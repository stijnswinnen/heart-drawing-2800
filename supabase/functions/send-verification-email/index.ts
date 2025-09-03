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
    const { email }: EmailRequest = await req.json();
    console.log("Sending verification email to:", email);

    // Get user profile data including last send timestamp
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("verification_token, name, last_verification_email_sent_at")
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

    // Check if we sent an email recently (2 minute throttle)
    if (profile.last_verification_email_sent_at) {
      const lastSent = new Date(profile.last_verification_email_sent_at);
      const now = new Date();
      const timeDiff = (now.getTime() - lastSent.getTime()) / 1000; // seconds
      
      if (timeDiff < 120) { // 2 minutes = 120 seconds
        console.log(`Email throttled for ${email}, last sent ${Math.floor(timeDiff)}s ago`);
        return new Response(JSON.stringify({ 
          message: "Verificatie e-mail werd recent al verzonden" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Generate new verification token
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_token: crypto.randomUUID(),
        verification_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        last_verification_email_sent_at: new Date().toISOString()
      })
      .eq("email", email)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile with verification token:", updateError);
      throw new Error("Failed to generate verification token");
    }

    const verificationUrl = `${req.headers.get("origin")}/verify?token=${updatedProfile.verification_token}&email=${encodeURIComponent(email)}`;

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
            <p>Beste ${profile.name || 'gebruiker'},</p>
            
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