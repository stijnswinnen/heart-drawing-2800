import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const rendiApiKey = Deno.env.get('RENDI_API_KEY');
    if (!rendiApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'RENDI_API_KEY not set' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const urls = [
      'https://api.rendi.dev/v1/jobs',
      'https://api.rendi.dev/jobs',
    ];

    let result: any = null;
    let lastStatus = 0;
    let lastBody = '';

    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(urls[i], { headers: { 'X-API-KEY': rendiApiKey } });
        if (res.ok) {
          result = { status: res.status, body: await res.text(), url: urls[i] };
          break;
        } else {
          lastStatus = res.status;
          lastBody = await res.text();
        }
      } catch (e) {
        lastStatus = 0;
        lastBody = String(e);
      }
    }

    return new Response(JSON.stringify({ success: !!result, result, lastStatus, lastBody }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in rendi-auth-check:', error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});