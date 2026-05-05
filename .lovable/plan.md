## What I observed (live test)

I clicked the heart, then dragged across the canvas. The result:
- `Verzenden` and `Reset` buttons appeared → meaning `path:created` did fire and `hasDrawn` became `true`.
- The canvas itself, however, looked completely empty — no stroke visible.

So the previous diagnosis ("path is created but never flushed to pixels") was incomplete. The path **is** added to Fabric's model and a render is requested, but the pixels we expect on the lower-canvas don't appear to the user. The fix attempts so far (`requestRenderAll()` after init, ref-based listener) addressed real bugs but did not address the actual visibility cause.

## Real root cause

Two issues compound, both rooted in `src/components/Canvas.tsx`:

1. **Retina/HiDPI mismatch via `setDimensions`.** Fabric v6 defaults to `enableRetinaScaling: true`. On the user's display (devicePixelRatio = 2), Fabric internally upscales the bitmap. The construction call sets `width`/`height` correctly, but our `handleResize` listener calls `canvas.setDimensions({ width, height })` **without** the second-arg options. In Fabric v6 the safe pattern when retina scaling is on is `setDimensions({width, height}, { cssOnly: false, backstoreOnly: false })` plus calling it once on init to align CSS and backing store. Even on first mount, certain layouts cause the painted upper-canvas content (where the brush draws live) to drift out of the visible CSS box. After mouseup, Fabric replaces the live preview with the committed path on the lower-canvas — at the proper coordinates — and the user perceives "drawing disappeared". This matches what we see: live preview not visible, mouseup fires `path:created`, but no committed pixels show either because the lower-canvas backing store wasn't sized in sync with CSS.

2. **`useIsMobile()` flips from `undefined` → `false` on mount.** The `useEffect` that initializes Fabric depends on `isMobile`. On first render `isMobile` is `false` (from `!!undefined`); the hook then runs its own `useEffect`, sets state, and if the value actually changes (mobile breakpoint, or a transient mismatch during hydration) the Canvas effect tears down and rebuilds the Fabric instance — wiping any drawing. This isn't the primary issue on desktop but it's a latent re-mount that erases work.

## Plan

Edit `src/components/Canvas.tsx`:

1. Disable retina scaling on the Fabric canvas to make CSS pixels and backing-store pixels 1:1. This eliminates the entire class of "drew but invisible" issues:
   ```ts
   new FabricCanvas(canvasRef.current, {
     width, height,
     backgroundColor: "#FFFFFF",
     isDrawingMode: true,
     enableRetinaScaling: false,
   });
   ```

2. Make `handleResize` preserve content and scale correctly:
   ```ts
   canvas.setDimensions({ width, height });
   canvas.requestRenderAll();
   ```
   (Already calls `setDimensions`; just ensure a re-render after.)

3. Stop tearing down the canvas on `isMobile` flips. Move the dimensions calculation into the resize handler and trigger it on mount + on `isMobile` change, but keep the Fabric instance alive across renders. Concretely: remove `isMobile` from the init effect's deps, keep init effect on `[]`, and add a separate effect `[isMobile, fabricCanvas]` that calls the resize handler.

4. Keep the `requestRenderAll()` after `setFabricCanvas` and the ref-based `path:created` handler from the previous fix — those were correct.

5. Sanity: confirm `DrawingCanvas` still passes `penColor={isEraser ? "#FFFFFF" : penColor}` (it does), so strokes are black on white by default and remain visible.

## Verification after applying

- Click heart, draw a stroke → stroke is visible immediately during drag and persists after mouseup.
- Resize the window mid-drawing → canvas resizes, existing path stays visible.
- Mobile breakpoint switch → no canvas rebuild, drawing not lost.

## Files touched

- `src/components/Canvas.tsx` (only file)

No changes to submission, providers, or styles are needed for this fix.
