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

interface EmailRequest {
  email: string;
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailRequest = await req.json();
    console.log("Sending verification email to:", email);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("verification_token, name")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Failed to fetch profile data");
    }

    if (!profile) {
      console.error("No profile found for email:", email);
      throw new Error("Profile not found");
    }

    // Generate new verification token (plaintext sent in email; SHA-256 hash stored in DB)
    const newToken = crypto.randomUUID();
    const tokenHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(newToken)
    );
    const tokenHash = Array.from(new Uint8Array(tokenHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_token: tokenHash,
        verification_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        last_verification_email_sent_at: new Date().toISOString()
      })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating profile with verification token");
      throw new Error("Failed to generate verification token");
    }

    const verificationUrl = `${req.headers.get("origin")}/verify?token=${newToken}&email=${encodeURIComponent(email)}`;
    const ctaUrl = `${verificationUrl}&utm_source=email&utm_medium=transactional&utm_campaign=email-verification&utm_content=bevestig-emailadres`;
    const safeName = (profile.name || "gebruiker")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = renderEmail({
      preheader: "Bevestig je e-mailadres om je hartje te activeren.",
      heading: "Bevestig je e-mailadres",
      bodyHtml: `
        <p>Hallo ${safeName},</p>
        <p>Bedankt voor het tekenen van je hartje! Bevestig je e-mailadres om je bijdrage te activeren. Je hartje wordt daarna manueel nagekeken voor het live gaat.</p>
      `,
      ctaLabel: "Bevestig e-mailadres",
      ctaUrl,
      footerNote: `Werkt de knop niet? Kopieer dan deze link in je browser: ${ctaUrl}<br>Deze link is 1 uur geldig. Heb je geen hartje getekend? Dan kan je deze mail negeren.`,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.love <noreply@2800.love>",
        to: [email],
        subject: "Bevestig je e-mailadres",
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send verification email: ${error}`);
    }

    return new Response(JSON.stringify({ message: "Verification email sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error?.message);
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