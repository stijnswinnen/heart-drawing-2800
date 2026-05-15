## Problem

The optimized drawings are PNGs with a transparent background. The current FFmpeg filter only uses `pad=...:color=${bgFfmpeg}` which fills the area *around* the scaled image. The transparent pixels *inside* the image are not filled, so when `format=yuv420p` strips alpha they render as black.

## Fix

Replace the per-image `scale → pad → format` chain with `scale → overlay onto a solid color canvas → format`. A `color` source inside the filter graph provides the opaque background, and `overlay` composites the transparent PNG onto it, honoring alpha.

## Change

File: `supabase/functions/video-jobs-create/index.ts` (around line 203-207)

Replace the filter builder:

```ts
const filters: string[] = [];
for (let i = 0; i < optimizedUrls.length; i++) {
  filters.push(
    `color=c=${bgFfmpeg}:s=1080x1080:d=${perImageSeconds}[bg${i}];` +
    `[${i}:v]scale=w='min(iw,1080)':h='min(ih,1080)':force_original_aspect_ratio=decrease[s${i}];` +
    `[bg${i}][s${i}]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p,setsar=1[v${i}]`
  );
}
```

Notes:
- `color=c=${bgFfmpeg}:s=1080x1080:d=${perImageSeconds}` produces an opaque background of the chosen color for the same duration as each looped input.
- `overlay=(W-w)/2:(H-h)/2` centers the (already aspect-correct scaled) PNG and uses its alpha channel to blend onto the colored canvas, so any transparent pixels show the background color instead of black.
- `shortest=1` ends the overlay when the shorter input ends, keeping per-image duration at `perImageSeconds`.
- `format=yuv420p` after compositing is now safe — the alpha has already been resolved against the chosen color.
- `bgFfmpeg` continues to be the validated `0xRRGGBB` value already computed earlier in the function.

No other changes required (admin UI, validation, default `#FFFFFF`, etc. stay as-is).

## Verification

1. Deploy `video-jobs-create`.
2. From admin VideoGrid, generate a video with background `#FFFFFF` → drawings should appear on white (no black inside the heart shapes).
3. Repeat with e.g. `#F2DCE2` → drawings appear on the brand pink.
