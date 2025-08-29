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

    // Start background processing
    processVideoJob(job.id);

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

    // Update progress
    await updateJobProgress(jobId, 10, 'Downloading images...');

    // Download images from Supabase storage
    const imageBlobs: Array<{ name: string; blob: Blob }> = [];
    
    for (let i = 0; i < drawings.length; i++) {
      const drawing = drawings[i];
      const { data: imageData } = await supabase.storage
        .from('optimized')
        .download(drawing.image_path);
        
      if (imageData) {
        imageBlobs.push({
          name: `image_${i.toString().padStart(4, '0')}.jpg`,
          blob: imageData
        });
      }
      
      // Update progress
      const progress = 10 + Math.floor((i / drawings.length) * 30);
      await updateJobProgress(jobId, progress, `Downloaded ${i + 1}/${drawings.length} images`);
    }

    if (imageBlobs.length === 0) {
      throw new Error('Failed to download any images');
    }

    await updateJobProgress(jobId, 45, 'Preparing video generation...');

    // Prepare Rendi.dev job
    const rendiApiKey = Deno.env.get('RENDI_API_KEY');
    if (!rendiApiKey) {
      throw new Error('Rendi API key not configured');
    }

    // Create form data for Rendi
    const formData = new FormData();
    
    // Add images to form data
    imageBlobs.forEach((image) => {
      formData.append('files', image.blob, image.name);
    });

    // Prepare FFmpeg command for video generation
    const duration = 0.5; // seconds per image
    const ffmpegCommand = [
      '-f', 'image2',
      '-framerate', `${1/duration}`,
      '-i', 'image_%04d.jpg',
      '-vf', `fps=${job.fps},scale=1920:1920:force_original_aspect_ratio=decrease,pad=1920:1920:-1:-1:color=black,format=yuv420p`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      'output.mp4'
    ];

    formData.append('command', ffmpegCommand.join(' '));

    await updateJobProgress(jobId, 50, 'Submitting job to Rendi...');

    // Submit job to Rendi.dev with fallback endpoints and header styles
    const endpoints = [
      { url: 'https://api.rendi.dev/jobs', headers: { 'Authorization': `Bearer ${rendiApiKey}` } },
      { url: 'https://api.rendi.dev/v1/jobs', headers: { 'Authorization': `Bearer ${rendiApiKey}` } },
      { url: 'https://api.rendi.dev/jobs', headers: { 'X-API-Key': rendiApiKey } },
      { url: 'https://api.rendi.dev/v1/jobs', headers: { 'X-API-Key': rendiApiKey } },
    ] as const;

    let rendiJob: any = null;
    let lastStatus = 0;
    let lastBody = '';

    for (let i = 0; i < endpoints.length; i++) {
      const ep = endpoints[i];
      try {
        const res = await fetch(ep.url, {
          method: 'POST',
          headers: ep.headers,
          body: formData
        });
        if (res.ok) {
          rendiJob = await res.json();
          break;
        } else {
          lastStatus = res.status;
          lastBody = await res.text();
          console.log(`Rendi submit attempt ${i + 1} failed at ${ep.url} -> ${lastStatus}: ${lastBody}`);
        }
      } catch (e) {
        console.log(`Rendi submit attempt ${i + 1} threw error at ${ep.url}:`, e);
      }
    }

    if (!rendiJob) {
      throw new Error(`Rendi API error after retries. Last response ${lastStatus} - ${lastBody}`);
    }

    console.log('Rendi job created:', rendiJob);

    // Update job with Rendi job ID
    await supabase
      .from('video_jobs')
      .update({ 
        rendi_job_id: rendiJob.id,
        progress: 60,
        logs: [
          ...job.logs || [],
          { 
            timestamp: new Date().toISOString(), 
            message: `Rendi job created: ${rendiJob.id}` 
          }
        ]
      })
      .eq('id', jobId);

    // Poll for completion
    await pollRendiJob(jobId, rendiJob.id);

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
  const maxAttempts = 60; // 5 minutes with 5s intervals
  
  while (attempts < maxAttempts) {
    try {
      // Try multiple endpoints for status
      const statusUrls = [
        `https://api.rendi.dev/jobs/${rendiJobId}`,
        `https://api.rendi.dev/v1/jobs/${rendiJobId}`,
      ];

      let jobStatus: any = null;
      let lastStatus = 0;
      let lastBody = '';

      for (let i = 0; i < statusUrls.length; i++) {
        try {
          const res = await fetch(statusUrls[i], {
            headers: { 'Authorization': `Bearer ${rendiApiKey}` }
          });
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

      if (jobStatus.status === 'completed') {
        // Download the completed video
        const videoResponse = await fetch(jobStatus.output_url);
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
              { 
                timestamp: new Date().toISOString(), 
                message: `Video generated successfully: ${videoPath}` 
              }
            ]
          })
          .eq('id', jobId);

        return;
        
      } else if (jobStatus.status === 'failed') {
        throw new Error(`Rendi job failed: ${jobStatus.error || 'Unknown error'}`);
      } else if (jobStatus.status === 'processing') {
        // Update progress if available
        const progress = 60 + Math.min(30, jobStatus.progress || 0);
        await updateJobProgress(jobId, progress, 'Processing video...');
      }

      // Wait 5 seconds before next poll
      await new Deno.Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
      
    } catch (error) {
      console.error('Polling error:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error(`Job polling failed after ${maxAttempts} attempts: ${error.message}`);
      }
      
      await new Deno.Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error('Job polling timeout');
}