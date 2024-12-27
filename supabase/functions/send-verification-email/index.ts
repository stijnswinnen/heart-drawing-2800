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
        from: "verify@2800.love", // Updated email address
        to: [email],
        subject: "Verify your email address",
        html: `
          <h2>Hello ${userData.name},</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify Email Address</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
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