## Problem

On desktop, the map briefly shows at the top of the page before the hero image appears. The cause is **not** image loading — the hero image already preloads with `fetchpriority="high"` and the wrapper is correctly `100svh`. The real issue is data loading:

1. `useLocations()` starts as `[]` and fetches asynchronously.
2. Until that fetch resolves, `selectedLocation` is `undefined`, so `hasHero` is `false`.
3. With `hasHero=false`, the entire `<LocationHero>` block in `LocatieDetail.tsx` (lines 148–165) is skipped.
4. `<main>` renders at the top → the map appears above the fold for a frame.
5. Locations resolve → hero mounts → map gets pushed down (visible "jump").

So the hero wrapper never reserves its 100svh height during the data-loading window.

## Fix

Reserve the hero's vertical space from the very first paint on any detail route, regardless of whether `selectedLocation` is loaded yet.

### Changes to `src/pages/LocatieDetail.tsx`

1. Detect "we are on a detail route and locations haven't resolved yet" — i.e. `slug` is present and `locations.length === 0`. Treat this as "hero pending".
2. Always render a hero placeholder when either the real hero is available OR hero is pending. The placeholder is a `div` with `height: 100svh`, the same dark background (`#1a1612`) and the existing shimmer gradient already used inside `LocationHero`. This guarantees the map cannot appear above the fold.
3. Once `selectedLocation` resolves:
   - If it has `image_path` → swap placeholder for `<LocationHero>` (the preload link + image priority work as before).
   - If it has no `image_path` → drop the placeholder and fall back to the current `pt-[88px]` layout.
4. Keep the existing `<Helmet>` preload link exactly as-is (still fires as soon as `image_path` is known).
5. Adjust `Navigation transparentOverHero` so it stays transparent during the pending state too (otherwise the nav style would flicker).

No changes to `LocationHero.tsx` — its wrapper is already `100svh` and image loading is already prioritised. No business-logic changes.

### Technical detail

```text
hasHero      = Boolean(selectedLocation?.image_path)
heroPending  = Boolean(slug) && locations.length === 0 && !selectedLocation
showHeroSlot = hasHero || heroPending
```

Render order inside the page root:

```text
<Seo />
<Navigation transparentOverHero={showHeroSlot} />

{hasHero && <Helmet preload /> + <LocationHero />}
{!hasHero && heroPending && <div style="height:100svh; background:#1a1612; shimmer" />}

<main className={showHeroSlot ? "pt-14" : "pt-[88px]"}>
  ...
</main>
```

The placeholder uses the same gradient + `@keyframes hero-shimmer` already defined in `LocationHero` — duplicate the small style block locally (or extract a tiny shared `HeroPlaceholder` component if cleaner) so the visual matches exactly.

### Out of scope

- No change to `LocationHero` internals.
- No change to image preload/priority (already correct).
- No change to map, footer, or scroll behaviour.
