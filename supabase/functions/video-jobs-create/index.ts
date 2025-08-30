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
    const { mode, maxFrames, fps } = await req.json();
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

    console.log('Creating video job:', { mode, maxFrames, fps });

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .insert({
        user_id: user.id,
        job_type: mode,
        max_frames: maxFrames,
        fps: fps,
        status: 'pending',
        logs: [{ 
          timestamp: new Date().toISOString(), 
          message: 'Job created, preparing images...' 
        }]
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    console.log('Job created:', job);

    // Start background processing with EdgeRuntime.waitUntil for persistence
    EdgeRuntime.waitUntil(processVideoJob(job.id));

    return new Response(JSON.stringify({ 
      success: true, 
      jobId: job.id,
      message: 'Video job created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in video-jobs-create:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processVideoJob(jobId: string) {
  try {
    // Update job status to processing
    await supabase
      .from('video_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        logs: [{ 
          timestamp: new Date().toISOString(), 
          message: 'Starting video processing...' 
        }]
      })
      .eq('id', jobId);

    // Get job details
    const { data: job } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      throw new Error('Job not found');
    }

    // Fetch approved drawings
    const { data: drawings } = await supabase
      .from('drawings')
      .select('image_path')
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(job.max_frames);

    if (!drawings || drawings.length === 0) {
      throw new Error('No approved drawings found');
    }

    console.log(`Found ${drawings.length} approved drawings`);

    // Build concat list of public optimized images
    await updateJobProgress(jobId, 10, 'Building image list...');

    // Build public URLs to optimized images and create an ffconcat list
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const optimizedUrls: string[] = [];
    for (let i = 0; i < drawings.length; i++) {
      const cleanPath = (drawings[i].image_path || '').split('/').pop() || drawings[i].image_path;
      // Prefer API to get public URL to handle any path nuances
      const { data: pub } = supabase.storage.from('optimized').getPublicUrl(cleanPath);
      const url = pub?.publicUrl || `${supabaseUrl}/storage/v1/object/public/optimized/${cleanPath}`;
      optimizedUrls.push(url);
    }

    if (optimizedUrls.length === 0) {
      throw new Error('No optimized image URLs available');
    }

    // Using enumerated image inputs for Rendi; default 1s per image (size configurable later)
    const perImageSeconds = 1;
    await updateJobProgress(jobId, 30, 'Preparing input files...');
    await updateJobProgress(jobId, 45, 'Preparing video generation...');

    // Prepare Rendi.dev job
    const rendiApiKey = Deno.env.get('RENDI_API_KEY');
    if (!rendiApiKey) {
      throw new Error('Rendi API key not configured');
    }

    // Prepare FFmpeg command using enumerated image inputs
    const inputArgs: string[] = [];
    for (let i = 0; i < optimizedUrls.length; i++) {
      inputArgs.push('-loop', '1', '-t', perImageSeconds.toString(), '-i', `{{in_${i}}}`);
    }

    const filters: string[] = [];
    for (let i = 0; i < optimizedUrls.length; i++) {
      filters.push(`[${i}:v]scale=w='min(iw,1080)':h='min(ih,1080)':force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p,setsar=1[v${i}]`);
    }
    const concatFilter = `${filters.join(';')};${optimizedUrls.map((_, i) => `[v${i}]`).join('')}concat=n=${optimizedUrls.length}:v=1:a=0[outv]`;

    const ffmpegCommand = [
      ...inputArgs,
      '-filter_complex', concatFilter,
      '-map', '[outv]',
      '-r', String(job.fps || 2),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      '{{out_video}}'
    ];
    await updateJobProgress(jobId, 50, 'Submitting job to Rendi...');

    // Submit job to Rendi.dev with JSON payload (v1 endpoint)
    const endpoints = [
      'https://api.rendi.dev/v1/run-ffmpeg-command',
    ];

    console.log('Submitting to Rendi with command:', ffmpegCommand.join(' '));

    // Build input/output files per Rendi API requirements
    const input_files: Record<string, string> = {};
    optimizedUrls.forEach((url, i) => { input_files[`in_${i}`] = url; });
    const output_files = { out_video: 'output.mp4' };
    const payload = {
      input_files,
      output_files,
      ffmpeg_command: ffmpegCommand.join(' '),
      max_command_run_seconds: 15 * 60,
      vcpu_count: 2,
    };

    let rendiJob: any = null;
    let lastStatus = 0;
    let lastBody = '';
    let lastUrl = '';

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-KEY': rendiApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          rendiJob = await res.json();
          console.log(`Rendi job submitted successfully via ${url}:`, rendiJob);
          break;
        } else {
          lastStatus = res.status;
          lastBody = await res.text();
          lastUrl = url;
          console.log(`Rendi submission failed at ${url} -> ${res.status}: ${lastBody}`);
        }
      } catch (e) {
        lastStatus = 0;
        lastBody = String(e);
        lastUrl = url;
        console.log(`Rendi submission error at ${url}:`, e);
      }
    }

    if (!rendiJob) {
      throw new Error(`Rendi API error: ${lastStatus} - ${lastBody} (last tried: ${lastUrl})`);
    }

    console.log('Rendi job created:', rendiJob);

    // Determine command/job id key from response
    const rendiJobId =
      rendiJob.command_id ||
      rendiJob.id ||
      rendiJob.job_id ||
      rendiJob?.data?.command_id ||
      rendiJob?.data?.id;
    if (!rendiJobId) {
      console.error('Unexpected Rendi response payload:', JSON.stringify(rendiJob));
      throw new Error('Rendi job ID missing in response (expected command_id)');
    }

    // Update job with Rendi job ID
    await supabase
      .from('video_jobs')
      .update({ 
        rendi_job_id: rendiJobId,
        progress: 60,
        logs: [
          ...job.logs || [],
          { 
            timestamp: new Date().toISOString(), 
            message: `Rendi job created: ${rendiJobId}` 
          }
        ]
      })
      .eq('id', jobId);

    // Poll for completion
    await pollRendiJob(jobId, rendiJobId);

  } catch (error) {
    console.error('Error processing video job:', error);
    
    await supabase
      .from('video_jobs')
      .update({ 
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
        logs: [
          { 
            timestamp: new Date().toISOString(), 
            message: `Error: ${error.message}` 
          }
        ]
      })
      .eq('id', jobId);
  }
}

async function updateJobProgress(jobId: string, progress: number, message: string) {
  await supabase
    .from('video_jobs')
    .update({ 
      progress,
      logs: [
        { 
          timestamp: new Date().toISOString(), 
          message 
        }
      ]
    })
    .eq('id', jobId);
}

async function pollRendiJob(jobId: string, rendiJobId: string) {
  const rendiApiKey = Deno.env.get('RENDI_API_KEY');
  let attempts = 0;
  const maxAttempts = 180; // 15 minutes with 5s intervals
  
  while (attempts < maxAttempts) {
    try {
      // Try multiple endpoints for status
      const statusUrls = [
        `https://api.rendi.dev/v1/commands/${rendiJobId}`,
        `https://api.rendi.dev/commands/${rendiJobId}`,
        `https://api.rendi.dev/v1/jobs/${rendiJobId}`,
        `https://api.rendi.dev/jobs/${rendiJobId}`,
      ];

      let jobStatus: any = null;
      let lastStatus = 0;
      let lastBody = '';

      for (let i = 0; i < statusUrls.length; i++) {
        try {
          const res = await fetch(statusUrls[i], { headers: { 'X-API-KEY': rendiApiKey as string } });

          if (res.ok) {
            jobStatus = await res.json();
            break;
          } else {
            lastStatus = res.status;
            lastBody = await res.text();
            console.log(`Rendi status attempt ${i + 1} failed at ${statusUrls[i]} -> ${lastStatus}: ${lastBody}`);
          }
        } catch (e) {
          console.log(`Rendi status attempt ${i + 1} threw error at ${statusUrls[i]}:`, e);
        }
      }

      if (!jobStatus) {
        throw new Error(`Status check failed: ${lastStatus} - ${lastBody}`);
      }

      console.log('Rendi job status:', jobStatus);

      const status =
        jobStatus.status ??
        jobStatus.command?.status ??
        jobStatus.data?.status;
      const normalizedStatus = (status ?? '').toString().toLowerCase();

      const outputUrl =
        jobStatus.output_url ??
        jobStatus.outputUrl ??
        jobStatus.output_files?.out_video?.storage_url ??
        jobStatus.output_files?.out_video?.url ??
        jobStatus.output_files?.out_video ??
        jobStatus.result?.output_url ??
        jobStatus.data?.output_url;

      const fileId =
        jobStatus.output_files?.out_video?.file_id ??
        jobStatus.data?.output_files?.out_video?.file_id;

      if (['completed', 'success', 'succeeded'].includes(normalizedStatus)) {
        if (!outputUrl) {
          throw new Error('Rendi completed without output_url');
        }
        // Download the completed video
        const videoResponse = await fetch(outputUrl);
        const videoBlob = await videoResponse.blob();
        // Determine fps
        const { data: jobRow } = await supabase
          .from('video_jobs')
          .select('fps')
          .eq('id', jobId)
          .single();
        const fps = jobRow?.fps || 2;
        // Upload to Supabase storage with format-based path
        const videoPath = `1080-1080-${fps}fps/video_${Date.now()}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(videoPath, videoBlob);
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        // Cleanup Rendi files after successful upload
        await cleanupRendiFiles(rendiJobId, fileId);
        // Mark job as completed
        await supabase
          .from('video_jobs')
          .update({ 
            status: 'completed',
            progress: 100,
            video_path: videoPath,
            completed_at: new Date().toISOString(),
            logs: [
              { 
                timestamp: new Date().toISOString(), 
                message: `Video generated successfully: ${videoPath}` 
              }
            ]
          })
          .eq('id', jobId);
        return;
      } else if (['failed', 'error'].includes(normalizedStatus)) {
        const errMsg =
          jobStatus.error ??
          jobStatus.command?.error ??
          jobStatus.data?.error ??
          'Unknown error';
        throw new Error(`Rendi job failed: ${errMsg}`);
      } else if (['processing', 'queued', 'running', 'pending', 'in_progress', 'started'].includes(normalizedStatus)) {
        // Update progress if available
        const rawProgress =
          jobStatus.progress ??
          jobStatus.command?.progress ??
          jobStatus.data?.progress ?? 0;
        const progress = 60 + Math.min(30, Number(rawProgress) || 0);
        await updateJobProgress(jobId, progress, 'Processing video...');
      }

      // Wait 5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
      
    } catch (error) {
      console.error('Polling error:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error(`Job polling failed after ${maxAttempts} attempts: ${error.message}`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error('Job polling timeout');
}

async function cleanupRendiFiles(rendiJobId: string, fileId?: string) {
  const rendiApiKey = Deno.env.get('RENDI_API_KEY');
  if (!rendiApiKey) {
    console.log('No Rendi API key, skipping cleanup');
    return;
  }

  try {
    // Delete specific file if we have the file_id
    if (fileId) {
      const deleteFileRes = await fetch(`https://api.rendi.dev/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'X-API-KEY': rendiApiKey }
      });
      console.log(`Rendi file deletion (${fileId}):`, deleteFileRes.status);
    }

    // Delete all command files
    const deleteCommandRes = await fetch(`https://api.rendi.dev/v1/commands/${rendiJobId}/files`, {
      method: 'DELETE',
      headers: { 'X-API-KEY': rendiApiKey }
    });
    console.log(`Rendi command files deletion (${rendiJobId}):`, deleteCommandRes.status);
    
  } catch (error) {
    console.error('Error cleaning up Rendi files:', error);
    // Don't throw - cleanup is best effort
  }
}