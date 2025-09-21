import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.log('Starting unverified profiles cleanup...');

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_unverified_profiles');

    if (error) {
      console.error('Error during cleanup:', error);
      return new Response(
        JSON.stringify({ error: error.message, cleaned: 0 }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Cleanup completed. Removed ${data} unverified profiles.`);

    // Log the cleanup event
    await supabase.from('security_logs').insert({
      event_type: 'cleanup_unverified_profiles',
      details: {
        profiles_cleaned: data,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned: data,
        message: `Cleaned up ${data} unverified profiles older than 48 hours`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error.message, cleaned: 0 }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});