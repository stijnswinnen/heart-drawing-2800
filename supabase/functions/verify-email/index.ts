import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { token } = await req.json();

    console.log('Verifying email with token:', token);

    // Get the heart user with this token
    const { data: heartUser, error: userError } = await supabase
      .from('heart_users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (userError || !heartUser) {
      console.error('Error finding heart user:', userError);
      throw new Error('Invalid verification token');
    }

    // Check if token is expired
    if (new Date(heartUser.verification_token_expires_at) < new Date()) {
      console.error('Token expired for user:', heartUser.id);
      throw new Error('Verification token has expired');
    }

    // Get the latest pending drawing for this user
    const { data: drawings, error: drawingsError } = await supabase
      .from('drawings')
      .select('*')
      .eq('heart_user_id', heartUser.id)
      .eq('status', 'pending_verification')
      .order('created_at', { ascending: false })
      .limit(1);

    if (drawingsError) {
      console.error('Error finding drawings:', drawingsError);
      throw new Error('Failed to find drawing');
    }

    if (!drawings || drawings.length === 0) {
      console.error('No pending drawings found for user:', heartUser.id);
      throw new Error('No pending drawings found');
    }

    // Update the drawing status to 'new'
    const { error: updateDrawingError } = await supabase
      .from('drawings')
      .update({ status: 'new' })
      .eq('id', drawings[0].id);

    if (updateDrawingError) {
      console.error('Error updating drawing:', updateDrawingError);
      throw new Error('Failed to update drawing status');
    }

    // Mark the user's email as verified
    const { error: updateUserError } = await supabase
      .from('heart_users')
      .update({ 
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null
      })
      .eq('id', heartUser.id);

    if (updateUserError) {
      console.error('Error updating heart user:', updateUserError);
      throw new Error('Failed to verify email');
    }

    console.log('Successfully verified email for user:', heartUser.id);
    
    return new Response(
      JSON.stringify({ 
        message: 'Email verified successfully',
        redirectUrl: '/' // Frontend will handle redirect
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in verify-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});