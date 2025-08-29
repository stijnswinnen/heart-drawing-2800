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
    const pathJobId = url.pathname.split('/').pop();
    
    // Try to get jobId from request body if available
    let jobId = pathJobId;
    try {
      const body = await req.json();
      if (body.jobId) {
        jobId = body.jobId;
      }
    } catch {
      // If no JSON body, use path jobId
    }
    
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
          // Try multiple endpoints for status
          const statusUrls = [
            `https://api.rendi.dev/v1/jobs/${job.rendi_job_id}`,
            `https://api.rendi.dev/jobs/${job.rendi_job_id}`,
          ];

          let rendiStatus: any = null;
          let lastStatus = 0;
          let lastBody = '';

          for (let i = 0; i < statusUrls.length; i++) {
            try {
              const res = await fetch(statusUrls[i], {
                headers: { 'Authorization': `Bearer ${rendiApiKey}` }
              });
              if (res.ok) {
                rendiStatus = await res.json();
                break;
              } else {
                lastStatus = res.status;
                lastBody = await res.text();
                console.log(`Rendi status check attempt ${i + 1} failed at ${statusUrls[i]} -> ${lastStatus}: ${lastBody}`);
              }
            } catch (e) {
              console.log(`Rendi status check attempt ${i + 1} threw error at ${statusUrls[i]}:`, e);
            }
          }

          if (rendiStatus) {
            console.log('Rendi status response:', rendiStatus);
            
            // Update job status based on Rendi response
            if (rendiStatus.status === 'completed' && job.status !== 'completed') {
              console.log('Finalizing completed job - downloading video...');
              
              // Download the completed video
              const videoResponse = await fetch(rendiStatus.output_url);
              const videoBlob = await videoResponse.blob();
              
              // Upload to Supabase storage
              const videoPath = `${new Date().toISOString().split('T')[0]}/video_${Date.now()}.mp4`;
              const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(videoPath, videoBlob);

              if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
              }

              // Mark job as completed
              await supabase
                .from('video_jobs')
                .update({ 
                  status: 'completed',
                  progress: 100,
                  video_path: videoPath,
                  completed_at: new Date().toISOString(),
                  logs: [
                    ...(job.logs || []),
                    { 
                      timestamp: new Date().toISOString(), 
                      message: `Video finalized successfully: ${videoPath}` 
                    }
                  ]
                })
                .eq('id', jobId);
                
              console.log('Job finalized successfully:', videoPath);
              
            } else if (rendiStatus.status === 'failed') {
              await supabase
                .from('video_jobs')
                .update({ 
                  status: 'failed',
                  error_message: rendiStatus.error || 'Rendi job failed',
                  completed_at: new Date().toISOString(),
                  logs: [
                    ...(job.logs || []),
                    { 
                      timestamp: new Date().toISOString(), 
                      message: `Rendi job failed: ${rendiStatus.error || 'Unknown error'}` 
                    }
                  ]
                })
                .eq('id', jobId);
            } else if (rendiStatus.progress !== undefined) {
              // Update progress
              const progress = 60 + Math.min(30, rendiStatus.progress || 0);
              await supabase
                .from('video_jobs')
                .update({ 
                  progress,
                  logs: [
                    ...(job.logs || []),
                    { 
                      timestamp: new Date().toISOString(), 
                      message: `Processing progress: ${progress}%` 
                    }
                  ]
                })
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