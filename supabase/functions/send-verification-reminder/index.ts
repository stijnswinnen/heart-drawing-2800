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
            subject: "Herinnering: Bevestig je e-mailadres voor je hart tekening",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Beste ${user.name},</p>
                
                <p>We zien dat je gisteren een hart hebt getekend, maar je e-mailadres nog niet hebt bevestigd. 
                   Gelieve je e-mailadres te bevestigen door op onderstaande link te drukken.</p>
                
                <p style="margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Valideer je e-mailadres
                  </a>
                </p>
                
                <p>Na validatie van je e-mailadres kan je altijd een nieuwe bijdrage maken.</p>
                <p>Het kan zijn dat jouw bijdrage niet onmiddellijk live verschijnt. Elke tekening wordt manueel nagekeken. Ongeldige bijdrages worden verwijderd.</p>
                
                <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                  Deze link is nog 1 uur geldig.<br>
                  Indien je deze aanvraag niet het gedaan, kan je deze mail gewoon negeren.
                </p>
                
                <p style="margin-top: 30px;">
                  Hartelijk dank<br>
                  2800.love
                </p>
              </div>
            `,
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