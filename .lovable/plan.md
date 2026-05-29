## Update submit nudge hover styles

In `src/index.css`, update the `.submit-nudge:hover` rules:

- `.submit-nudge-heart`: change hover color from `--pink-500` to `--pink-600` (keep `scale(1.2)`)
- `.submit-nudge-link`: keep color shift to `--pink-600`, change `text-decoration-color` from `--pink-300` to `--pink-300` (already set — no change needed there)

Wait — re-reading the request: "shift the colour of the heart to --pink-600 on hover" and "update the underline color shifting to --pink-300 on hover". The underline is already `--pink-300` on hover. Only the heart color needs changing (from `--pink-500` → `--pink-600`).

### Color tokens confirmation
Both exist in `src/index.css`:
- `--pink-600: #BD506A`
- `--pink-300: #E8A9B6`

### Change
```css
.submit-nudge:hover .submit-nudge-heart {
  color: var(--pink-600);  /* was --pink-500 */
  transform: scale(1.2);
}
```
The link underline hover already uses `--pink-300`, so no change there.