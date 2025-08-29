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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.pathname.split('/').pop();
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    // Get job status
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      throw new Error(`Failed to fetch job: ${jobError.message}`);
    }

    if (!job) {
      throw new Error('Job not found');
    }

    // If job is processing and has a Rendi job ID, check Rendi status
    if (job.status === 'processing' && job.rendi_job_id) {
      try {
        const rendiApiKey = Deno.env.get('RENDI_API_KEY');
        if (rendiApiKey) {
          const statusResponse = await fetch(`https://api.rendi.dev/v1/jobs/${job.rendi_job_id}`, {
            headers: {
              'Authorization': `Bearer ${rendiApiKey}`,
            }
          });

          if (statusResponse.ok) {
            const rendiStatus = await statusResponse.json();
            
            // Update job status based on Rendi response
            if (rendiStatus.status === 'completed' && job.status !== 'completed') {
              // Download and upload video (this should normally be handled by the webhook or polling)
              console.log('Rendi job completed, should download video');
            } else if (rendiStatus.status === 'failed') {
              await supabase
                .from('video_jobs')
                .update({ 
                  status: 'failed',
                  error_message: rendiStatus.error || 'Rendi job failed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', jobId);
            } else if (rendiStatus.progress) {
              // Update progress
              const progress = 60 + Math.min(30, rendiStatus.progress || 0);
              await supabase
                .from('video_jobs')
                .update({ progress })
                .eq('id', jobId);
            }
          }
        }
      } catch (error) {
        console.error('Error checking Rendi status:', error);
        // Don't fail the whole request, just log the error
      }
    }

    // Fetch updated job data
    const { data: updatedJob } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    return new Response(JSON.stringify({
      success: true,
      job: updatedJob || job
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in video-jobs-status:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});