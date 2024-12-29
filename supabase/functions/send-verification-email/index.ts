import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Check if RESEND_API_KEY is set
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration error: RESEND_API_KEY is not set");
    }

    const { email }: EmailRequest = await req.json();
    console.log("Sending verification email to:", email);

    // Get user verification token
    const { data: userData, error: userError } = await supabase
      .from("heart_users")
      .select("verification_token, name")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to fetch user data");
    }

    if (!userData) {
      console.error("No user found for email:", email);
      throw new Error("User not found");
    }

    console.log("User data retrieved:", { ...userData, verification_token: "REDACTED" });

    const verificationUrl = `${req.headers.get("origin")}/verify?token=${userData.verification_token}&email=${encodeURIComponent(email)}`;
    console.log("Verification URL generated:", verificationUrl);

    console.log("Attempting to send email via Resend");
    // Send email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "verify@2800.love",
        to: [email],
        subject: "Bevestig jouw e-mail adres",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>Beste ${userData.name},</p>
            
            <p>Bedankt om jouw hart te tekenen. Gelieve jouw e-mailadres te bevestigen door op onderstaande link te drukken.</p>
            
            <p style="margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Valideer je e-mailadres
              </a>
            </p>
            
            <p>Na validatie van je e-mailadres kan je altijd een nieuwe bijdrage maken.</p>
            <p>Het kan zijn dat jouw bijdrage niet onmiddellijk live verschijnt. Elke tekening wordt manueel nagekeken. Ongeldige bijdrages worden verwijderd.</p>
            
            <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
              Deze link is slechts 1 uur geldig.<br>
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

    const resendResponse = await res.text();
    console.log("Resend API response:", resendResponse);

    if (!res.ok) {
      console.error("Resend API error:", resendResponse);
      throw new Error(`Failed to send verification email: ${resendResponse}`);
    }

    // Update last verification email sent timestamp
    const { error: updateError } = await supabase
      .from("heart_users")
      .update({ last_verification_email_sent_at: new Date().toISOString() })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating last_verification_email_sent_at:", updateError);
      // Don't throw here as the email was sent successfully
    }

    return new Response(JSON.stringify({ message: "Verification email sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);