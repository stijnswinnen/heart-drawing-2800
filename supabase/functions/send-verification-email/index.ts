import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  heartUserId: string;
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { heartUserId, name, email }: EmailRequest = await req.json();

    console.log('Sending verification email to:', { heartUserId, name, email });

    // Check if we can send a new verification email
    const { data: userData, error: userError } = await supabase
      .from('heart_users')
      .select('last_verification_email_sent_at, verification_token')
      .eq('id', heartUserId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('User not found');
    }

    console.log('User data retrieved:', userData);

    const lastSent = userData.last_verification_email_sent_at;
    if (lastSent) {
      const cooldownPeriod = 10 * 1000; // 10 seconds in milliseconds
      const timeSinceLastEmail = Date.now() - new Date(lastSent).getTime();
      
      if (timeSinceLastEmail < cooldownPeriod) {
        const waitTimeSeconds = Math.ceil((cooldownPeriod - timeSinceLastEmail) / 1000);
        throw new Error(`Please wait ${waitTimeSeconds} seconds before requesting a new verification email`);
      }
    }

    // Generate new verification token
    const { error: updateError } = await supabase.rpc('generate_verification_token', {
      user_id: heartUserId
    });

    if (updateError) {
      console.error('Error generating new verification token:', updateError);
      throw new Error('Failed to generate verification token');
    }

    // Get the new token
    const { data: tokenData, error: tokenError } = await supabase
      .from('heart_users')
      .select('verification_token')
      .eq('id', heartUserId)
      .single();

    if (tokenError || !tokenData?.verification_token) {
      console.error('Error fetching verification token:', tokenError);
      throw new Error('Failed to fetch verification token');
    }

    console.log('Successfully generated verification token');

    const verificationUrl = `${req.headers.get('origin')}/verify?token=${tokenData.verification_token}`;

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Heart Drawing <verify@resend.dev>',
        to: email,
        subject: 'Verify your email to submit your heart drawing',
        html: `
          <h2>Hello ${name}!</h2>
          <p>Thank you for submitting your heart drawing. To complete your submission, please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify my email address</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't submit a heart drawing, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }

    // Update last_verification_email_sent_at
    const { error: updateTimeError } = await supabase
      .from('heart_users')
      .update({ last_verification_email_sent_at: new Date().toISOString() })
      .eq('id', heartUserId);

    if (updateTimeError) {
      console.error('Error updating last_verification_email_sent_at:', updateTimeError);
      // Don't throw here as the email was already sent
    }

    return new Response(
      JSON.stringify({ message: 'Verification email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});