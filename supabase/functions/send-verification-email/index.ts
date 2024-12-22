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

    const verificationUrl = `${req.headers.get("origin")}/verify?token=${userData.verification_token}&email=${encodeURIComponent(email)}`;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration error");
    }

    console.log("Attempting to send email via Resend");
    // Send email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Heart Drawing <verify@lovable.dev>",
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

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error("Failed to send verification email");
    }

    // Update last verification email sent timestamp
    await supabase
      .from("heart_users")
      .update({ last_verification_email_sent_at: new Date().toISOString() })
      .eq("email", email);

    return new Response(JSON.stringify({ message: "Verification email sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);