import { createClient } from '@supabase/supabase-js';
import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadImage(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for new approved hearts...');
    
    // Get the current video generation status
    const { data: videoStatus, error: statusError } = await supabase
      .from('video_generation')
      .select('*')
      .single();

    if (statusError) {
      throw new Error(`Error fetching video status: ${statusError.message}`);
    }

    // Get approved hearts since last processed drawing
    const { data: newHearts, error: heartsError } = await supabase
      .from('drawings')
      .select('id')
      .eq('status', 'approved')
      .gt('id', videoStatus.last_processed_drawing_id || '00000000-0000-0000-0000-000000000000')
      .order('id', { ascending: true });

    if (heartsError) {
      throw new Error(`Error fetching new hearts: ${heartsError.message}`);
    }

    // Check if we have enough new hearts to generate a video
    if (!newHearts || newHearts.length < 10) {
      console.log(`Only ${newHearts?.length || 0} new hearts, waiting for more...`);
      return new Response(JSON.stringify({ 
        status: 'waiting',
        newHeartsCount: newHearts?.length || 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${newHearts.length} new hearts, generating video...`);

    // Fetch all approved hearts
    const { data: allHearts, error: allHeartsError } = await supabase
      .from('drawings')
      .select('image_path')
      .eq('status', 'approved')
      .order('id', { ascending: true });

    if (allHeartsError || !allHearts) {
      throw new Error(`Error fetching all hearts: ${allHeartsError?.message}`);
    }

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm`, 'application/wasm')
    });

    console.log('FFmpeg loaded, processing images...');

    // Process each heart image
    let frameCount = 0;
    for (const heart of allHearts) {
      const imageUrl = supabase.storage
        .from('optimized')
        .getPublicUrl(`optimized/${heart.image_path}`).data.publicUrl;
      
      const imageData = await downloadImage(imageUrl);
      await ffmpeg.writeFile(`frame${frameCount}.png`, imageData);
      frameCount++;
    }

    // Create video with fade transitions
    const ffmpegCommand = [
      '-framerate', '1',
      '-i', 'frame%d.png',
      '-vf', 'fade=in:0:5,fade=out:25:5,scale=300:300,format=yuv420p',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      'output.mp4'
    ];

    await ffmpeg.exec(ffmpegCommand);

    // Read the generated video
    const videoData = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([videoData], { type: 'video/mp4' });

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload('hearts-compilation.mp4', videoBlob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error uploading video: ${uploadError.message}`);
    }

    // Update video generation status
    const lastProcessedId = newHearts[newHearts.length - 1].id;
    const { error: updateError } = await supabase
      .from('video_generation')
      .update({
        last_processed_drawing_id: lastProcessedId,
        processed_count: videoStatus.processed_count + 1
      })
      .eq('id', videoStatus.id);

    if (updateError) {
      throw new Error(`Error updating video status: ${updateError.message}`);
    }

    console.log('Video generation completed successfully');

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'Video generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in video generation:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});