## Problem

On `/teken` (mobile), the canvas only occupies ~62% of the viewport width. Hiding the "2800" text isn't enough — the layout itself is a horizontal split:

```
.home-stage          → flex row
  .hero              → flex: 0 0 38vw   (still reserves left column)
  .canvas-stage      → flex: 0 0 62vw   (canvas lives here)
```

Even with "2800" hidden, the `.hero` column still takes 38vw of empty space, so the canvas can never reach full width on a phone.

## Fix

Add a mobile-only override (≤767px) inside `.canvas-mode`:

- `.home-stage` → switch from `flex-direction: row` to column behavior for the canvas-mode split, OR simply collapse the hero column.
- `.canvas-mode .home-stage .hero` → `flex: 0 0 0; padding: 0; overflow: hidden;` (hide entirely on mobile while drawing — the eyebrow/subline/CTAs are already hidden, and "2800" adds no value on a phone canvas).
- `.canvas-mode .home-stage .canvas-stage` → `flex: 0 0 100vw;` so the canvas fills the full viewport width.
- Remove the now-redundant `.hidden-2800-mobile-canvas` rule added previously and the wrapper span in `DrawingTitle.tsx` (the whole hero is hidden, no need for a targeted hide).

Desktop behavior (≥768px) is unchanged: 38vw hero / 62vw canvas split remains.

## Files

- `src/index.css` — add mobile `.canvas-mode` overrides; remove the prior `.hidden-2800-mobile-canvas` rule.
- `src/components/DrawingTitle.tsx` — revert the `<span className="hidden-2800-mobile-canvas">2800</span>` wrapper back to plain `2800`.

## Out of scope

- Navigation bar visibility, drawing tools position, and "Sluiten" / Privacy Policy chrome remain as-is (they already use fixed positioning and overlay the canvas correctly).
