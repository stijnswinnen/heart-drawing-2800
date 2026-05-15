Update the `<main>` max-width to `1200px` on three pages, matching `LocatieDetail.tsx` and `LocatiesOverview.tsx`.

## Changes

**`src/pages/FavoritePlek.tsx`** (line 15)
- From: `max-w-[760px]`
- To: `max-w-[1200px]`

**`src/pages/Over.tsx`** (line 33)
- From: `max-w-[720px]`
- To: `max-w-[1200px]`

**`src/pages/Profile.tsx`** (line 68)
- From: `max-w-[980px]`
- To: `max-w-[1200px]`

Padding (`px-7`), top/bottom padding, and `mx-auto` centering remain unchanged on all three.

## Note

These pages were originally narrower because their content (forms, prose, profile sections) was designed for a single-column reading width. Widening to 1200px will leave a lot of empty space on either side of the existing content unless the inner layouts are also updated. Let me know if you'd also like the inner content adjusted afterwards — for now the plan only changes the outer `<main>` max-width as requested.