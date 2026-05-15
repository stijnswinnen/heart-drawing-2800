## Change

In `src/components/admin/DrawingGrid.tsx`, remove the `style={{ filter: "brightness(0)" }}` (and the `mix-blend-multiply` workaround that only existed to compensate for it) from the approved-hearts grid `<img>` (lines ~119-124). Keep the rest of the layout intact so hearts render with their natural colors and transparent background.

Also remove the heavy `filter: brightness(0) saturate(...) ...` style on the moderation card `<img>` (lines ~184-193) so new/pending drawings also show correctly.

No other files affected.

## Verification

Reload `/admin` → Approved and New tabs show heart drawings as-is, no black squares, no tinting.
