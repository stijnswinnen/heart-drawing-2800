import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FFmpeg } from "https://esm.sh/@ffmpeg/ffmpeg@0.12.10";
import { fetchFile } from "https://esm.sh/@ffmpeg/util@0.12.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];

function hasAllowedExt(name: string) {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing Supabase env vars' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('[generate-daily-video] Start');
    const startTs = Date.now();

    // Parse config from body or query params
    let payload: any = {};
    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        payload = await req.json().catch(() => ({}));
      }
    } catch (_) { payload = {}; }
    const urlObj = new URL(req.url);
    const mode = String(payload.mode ?? urlObj.searchParams.get('mode') ?? 'daily');
    const isArchive = mode === 'archive';
    const maxFramesParam = Number(payload.maxFrames ?? urlObj.searchParams.get('maxFrames'));
    const defaultCap = isArchive ? 300 : 50;
    const maxCap = isArchive ? 300 : 50;
    const maxFrames = Number.isFinite(maxFramesParam) ? Math.max(1, Math.min(Math.floor(maxFramesParam), maxCap)) : defaultCap;
    const fpsParam = Number(payload.fps ?? urlObj.searchParams.get('fps'));
    const fps = Number.isFinite(fpsParam) && fpsParam > 0 && fpsParam <= 30 ? Math.floor(fpsParam) : 25;
    const durationParam = Number(payload.duration ?? urlObj.searchParams.get('duration'));
    const durationSec = Number.isFinite(durationParam) && durationParam > 0 ? Number(durationParam) : 0.5;
    console.log(`[generate-daily-video] Config mode=${mode} maxFrames=${maxFrames} fps=${fps} duration=${durationSec}`);

    // 1) Retrieve all images from optimized bucket root
    console.log('[generate-daily-video] Listing optimized bucket root');
    const { data: files, error: listErr } = await supabase.storage
      .from('optimized')
      .list('', { limit: 10000, sortBy: { column: 'name', order: 'asc' } });
    if (listErr) {
      console.error('Error listing optimized bucket:', listErr);
      throw listErr;
    }

    const allImages = (files || [])
      .filter((f: any) => f && f.name && hasAllowedExt(f.name))
      .map((f: any) => f.name)
      .sort((a: string, b: string) => a.localeCompare(b)); // strict alphabetical

    // Cap to the configured maxFrames (most recent)
    const images = allImages.slice(-maxFrames);

    if (!images.length) {
      console.warn('[generate-daily-video] No images found in optimized bucket root');
      return new Response(
        JSON.stringify({ status: 'no-op', message: 'No images found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-daily-video] Found ${images.length} images`);

    // 2) Prepare ffmpeg wasm
    console.log('[generate-daily-video] Loading FFmpeg WASM');
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core-st@0.12.10/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core-st@0.12.10/dist/umd/ffmpeg-core.wasm',
    });

    // Create frames dir in ffmpeg FS
    try {
      // @ts-ignore - createDir is available in FFmpeg FS API
      await ffmpeg.createDir?.('frames');
    } catch (_) {
      // Ignore if not supported; using flat paths works as well
    }

    // 3) Download images and write to ffmpeg FS with sequential names
    console.log('[generate-daily-video] Downloading images to temp FS');
    const indexedNames: string[] = [];
    let successCount = 0;

    for (let idx = 0; idx < images.length; idx++) {
      const name = images[idx];
      try {
        const { data: blob, error: dlErr } = await supabase.storage.from('optimized').download(name);
        if (dlErr || !blob) {
          console.warn(`Skipping ${name}: download failed:`, dlErr);
          continue;
        }
        const ab = await blob.arrayBuffer();
        const uint8 = new Uint8Array(ab);
        const ext = name.toLowerCase().slice(name.lastIndexOf('.')) || '.jpg';
        const frameName = `frames/frame_${String(successCount + 1).padStart(5, '0')}${ext}`;
        await ffmpeg.writeFile(frameName, uint8);
        indexedNames.push(frameName);
        successCount++;
      } catch (err) {
        console.warn(`Skipping ${name}: processing error:`, err);
        continue;
      }
    }

    if (successCount === 0) {
      console.error('[generate-daily-video] No images could be processed');
      return new Response(
        JSON.stringify({ status: 'error', message: 'No images could be processed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-daily-video] Successfully processed ${successCount}/${images.length} images`);

    // 4) Build concat list with N seconds per image
    console.log('[generate-daily-video] Building concat list');
    let listTxt = '';
    for (const frame of indexedNames) {
      listTxt += `file '${frame}'\n`;
      listTxt += `duration ${durationSec}\n`;
    }
    // FFmpeg concat demuxer: repeat last frame one more time (no duration) to finalize segment
    if (indexedNames.length) {
      listTxt += `file '${indexedNames[indexedNames.length - 1]}'\n`;
    }

    await ffmpeg.writeFile('list.txt', await fetchFile(new Blob([listTxt])));

    // 5) Run ffmpeg to create H.264 650x650, 25fps, aspect preserved with padding
    console.log('[generate-daily-video] Running FFmpeg');
    const vf = [
      'scale=650:-2:force_original_aspect_ratio=decrease',
      'pad=650:650:(650-iw)/2:(650-ih)/2:color=black',
      `fps=${fps}`,
      'format=yuv420p',
    ].join(',');

    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-vf', vf,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', String(fps),
      '-movflags', 'faststart',
      '-profile:v', 'main',
      '-level', '3.1',
      'out.mp4',
    ]);

    const out = await ffmpeg.readFile('out.mp4');
    const outBlob = new Blob([out], { type: 'video/mp4' });

    // 6) Ensure videos bucket exists (best-effort) and upload
    console.log('[generate-daily-video] Ensuring "videos" bucket exists');
    const { data: bucketInfo, error: bucketErr } = await supabase.storage.getBucket('videos');
    if (bucketErr) {
      console.warn('videos bucket not found, attempting to create');
      const { error: createErr } = await supabase.storage.createBucket('videos', { public: true });
      if (createErr) {
        console.error('Failed to create videos bucket:', createErr);
        // Proceed anyway; upload will fail and be reported
      }
    }

    // Compute upload target path
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    let targetPath = '';
    if (isArchive) {
      const ts = now.toISOString().replace(/[:.]/g, '-');
      targetPath = `archive/archive-${ts}.mp4`;
    } else {
      targetPath = `daily/daily-${dateStr}.mp4`;
    }

    console.log(`[generate-daily-video] Uploading final video to videos/${targetPath}`);
    const { error: upErr } = await supabase.storage
      .from('videos')
      .upload(targetPath, outBlob, { upsert: true, contentType: 'video/mp4' });

    if (upErr) {
      console.error('Upload error:', upErr);
      throw upErr;
    }

    // Keep legacy path for backward compatibility in daily mode
    if (!isArchive) {
      const { error: legacyErr } = await supabase.storage
        .from('videos')
        .upload('final_video_h264.mp4', outBlob, { upsert: true, contentType: 'video/mp4' });
      if (legacyErr) {
        console.warn('Legacy path upload failed:', legacyErr);
      }
    }

    console.log('[generate-daily-video] Success');

    // 7) Cleanup temp FS
    console.log('[generate-daily-video] Cleaning up temp files');
    try {
      for (const f of indexedNames) {
        try { await ffmpeg.deleteFile(f); } catch (_) { /* ignore */ }
      }
      try { await ffmpeg.deleteFile('list.txt'); } catch (_) { /* ignore */ }
      try { await ffmpeg.deleteFile('out.mp4'); } catch (_) { /* ignore */ }
    } catch (_) {
      // ignore
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        mode,
        frames: indexedNames.length,
        candidates: allImages.length,
        fps,
        durationSec,
        elapsedMs: Date.now() - startTs,
        output: `videos/${targetPath}`,
        legacyOutput: !isArchive ? 'videos/final_video_h264.mp4' : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[generate-daily-video] Error:', err?.message || err);
    return new Response(
      JSON.stringify({ status: 'error', message: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
