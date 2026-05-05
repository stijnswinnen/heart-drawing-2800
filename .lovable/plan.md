## Changes to `src/pages/Hearts.tsx`

1. Add `bg-white` to the root wrapper so the page background is `#ffffff`.
2. Replace the inline `<footer>` (the two-link grid) with `<HomeFooter />`, the same component used on the homepage. Add the import.

No other files change. The two links currently in the inline footer ("Teken je hart voor Mechelen", "Vertel over je favoriete plek") will be dropped in favor of whatever `HomeFooter` renders — matching the homepage exactly, which is what was requested.