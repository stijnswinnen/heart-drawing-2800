## Problem
After the previous "transparent background" change, drawn strokes no longer remain visible on the canvas — the canvas appears empty/reset right after drawing.

## Root cause
In `src/components/Canvas.tsx` we set `backgroundColor: undefined` on the Fabric canvas and moved the white look to a `bg-white` CSS class on the `<canvas>` element. Fabric wraps the original `<canvas>` in a `.canvas-container` and stacks an absolutely positioned `upper-canvas` (and `lower-canvas`) on top. The Tailwind `bg-white` on our original `<canvas>` is hidden under those Fabric layers, so the user effectively sees the page background through a fully transparent Fabric canvas. Combined with the lower-canvas being cleared/redrawn on `path:created`, strokes look like they vanish (especially over the page's warm off-white background — strokes can still technically be there but the perceived "reset" is the lost white surface and the lack of visual contrast/feedback).

The previous plan assumed a CSS background on the `<canvas>` would persist visually — it does not, because Fabric overlays its own canvases on top.

## Fix
Keep Fabric's `backgroundColor` set to white (so the drawing surface is visibly white again and strokes remain visible while drawing), and instead strip the white background only at export time — right before `canvas.toBlob(...)` in the submission flow. This guarantees:

- Drawing UX is unchanged (white surface, visible strokes).
- The uploaded PNG has a transparent background.

### Changes

1. **`src/components/Canvas.tsx`**
   - Restore `backgroundColor: "#FFFFFF"` on the `FabricCanvas` constructor.
   - Remove the `bg-white` workaround on the `<canvas>` element (no longer needed; harmless either way).

2. **`src/utils/drawingSubmission.ts`**
   - Replace the direct `canvas.toBlob(...)` call with a transparent-export step:
     - Create an offscreen canvas of the same dimensions.
     - `drawImage` the source canvas into it.
     - Walk the pixel buffer and set alpha to 0 for any pixel that is pure white (`r=255, g=255, b=255`). Tolerance can be tight since the background is solid `#FFFFFF` and PencilBrush strokes are colored.
     - Call `toBlob('image/png')` on the offscreen canvas and upload that blob.
   - Keep the existing "is canvas empty" check (it already gates on stroke pixels, not background).

3. **No changes** to `optimize-heart` edge function — it already handles transparent PNGs correctly.

## Out of scope
- No backfill of existing uploads.
- No changes to brush, eraser, tools, or submission flow beyond the export step.

## Verification
- Draw a heart → strokes stay visible on a white surface (regression fixed).
- Submit → downloaded file from the `hearts` bucket has a transparent background.
- View the heart on a colored background page → no white box around the strokes.

## Edge case note
Pure-white strokes (if a user picks white as their pen color) would also become transparent. The current palette/eraser already uses white as the eraser color, so this matches expected behavior. If the user wants white strokes preserved in the future, we can switch from "white→transparent" to "flood-fill from edges" — out of scope here.
