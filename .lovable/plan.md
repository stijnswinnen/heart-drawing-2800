## Goal
Save heart drawings as PNGs with a transparent background instead of white, so they composite cleanly onto colored page backgrounds.

## Root cause
`src/components/Canvas.tsx` initializes the Fabric canvas with `backgroundColor: "#FFFFFF"`. That white fill becomes part of the exported PNG when `canvas.toBlob(..., 'image/png')` runs in `src/utils/drawingSubmission.ts`. PencilBrush strokes themselves are already drawn on top — only the explicit background needs to go.

## Changes

1. **`src/components/Canvas.tsx`** — Remove `backgroundColor: "#FFFFFF"` from the `FabricCanvas` constructor (Fabric defaults to transparent). To preserve the current visual drawing surface, move the white look to CSS on the wrapper/`<canvas>` element via `bg-white` (or `bg-[var(--bg)]` if we want it to match the warm off-white page background — confirm preference, defaulting to `bg-white` to match current UX). The CSS background is not captured by `toBlob`, so the export stays transparent.

2. **`src/utils/drawingSubmission.ts`** — Update the "is canvas empty" check. Today it uses `imageData.some((pixel, index) => index % 4 === 3 && pixel !== 0)` which checks alpha > 0. With a previously-white background every pixel had alpha 255, so this check was effectively a no-op but still passed. With a transparent background it now becomes a real and correct emptiness check — no code change required, just confirming it still works. No edit needed here.

3. **No change needed** to `supabase/functions/optimize-heart/index.ts` — its non-white-pixel scan already gates on `a > 0`, so transparent pixels are correctly treated as "no content" during the auto-crop.

## Out of scope / left alone
- Existing already-uploaded hearts in storage keep their white background. We are not running a backfill. New submissions only.
- Rendering components (`RandomApprovedHeart`, `ApprovedHeartsCarousel`, `HeartSection`) need no changes — transparent PNGs render fine in `<img>`.
- No changes to drawing tools, brush color/size, or submission flow.

## Verification
After implementation: draw a heart, submit, open the uploaded file from the `hearts` (and `optimized`) bucket, confirm transparent background. Then view the heart on a page with a non-white background (e.g. the warm off-white `--bg`) and confirm no white box around it.
