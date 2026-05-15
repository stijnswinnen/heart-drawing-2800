import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderEmail } from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting verification reminder process");

    // Check if RESEND_API_KEY is set
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration error");
    }

    // Get unverified users who submitted 24 hours ago and haven't received a reminder
    const { data: unverifiedUsers, error: userError } = await supabase
      .from("heart_users")
      .select("id, email, name, verification_token")
      .eq("email_verified", false)
      .is("reminder_sent_at", null)
      .gte("last_verification_email_sent_at", new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString())
      .lte("last_verification_email_sent_at", new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString());

    if (userError) {
      console.error("Error fetching unverified users:", userError);
      throw new Error("Failed to fetch unverified users");
    }

    console.log(`Found ${unverifiedUsers?.length || 0} users needing reminders`);

    const results = [];
    for (const user of unverifiedUsers || []) {
      try {
        // Generate fresh verification token (plaintext sent in email; SHA-256 hash stored in DB)
        const newToken = crypto.randomUUID();
        const tokenHashBuffer = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(newToken)
        );
        const tokenHash = Array.from(new Uint8Array(tokenHashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const { error: tokenUpdateError } = await supabase
          .from("heart_users")
          .update({
            verification_token: tokenHash,
            verification_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            last_verification_email_sent_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (tokenUpdateError) {
          console.error(`Error updating verification token for ${user.email}:`, tokenUpdateError);
          results.push({ email: user.email, status: "failed", error: tokenUpdateError });
          continue;
        }

        const verificationUrl = `https://2800.love/verify?token=${newToken}&email=${encodeURIComponent(user.email)}`;
        const ctaUrl = `${verificationUrl}&utm_source=email&utm_medium=transactional&utm_campaign=email-verification-reminder&utm_content=bevestig-emailadres`;
        const safeName = (user.name || "gebruiker")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const html = renderEmail({
          preheader: "Je hartje wacht nog op je — bevestig snel je e-mailadres.",
          heading: "Je hartje wacht nog op je",
          bodyHtml: `
            <p>Hallo ${safeName},</p>
            <p>Je hebt gisteren een hartje getekend, maar je e-mailadres nog niet bevestigd. Doe het nu — het duurt maar een seconde.</p>
          `,
          ctaLabel: "Bevestig e-mailadres",
          ctaUrl,
          footerNote: "Deze link is 1 uur geldig. Heb je geen hartje getekend? Dan kan je deze mail negeren.",
        });

        // Send reminder email using Resend
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "2800.love <noreply@2800.love>",
            to: [user.email],
            subject: "Nog even je e-mailadres bevestigen",
            html,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          console.error(`Failed to send reminder to ${user.email}:`, error);
          results.push({ email: user.email, status: "failed", error });
          continue;
        }

        // Update reminder_sent_at timestamp
        const { error: updateError } = await supabase
          .from("heart_users")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", user.id);

        if (updateError) {
          console.error(`Error updating reminder_sent_at for ${user.email}:`, updateError);
          results.push({ email: user.email, status: "partial", error: updateError });
          continue;
        }

        results.push({ email: user.email, status: "success" });
        console.log(`Successfully sent reminder to ${user.email}`);
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        results.push({ email: user.email, status: "failed", error });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} reminders`,
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-reminder function:", error?.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);