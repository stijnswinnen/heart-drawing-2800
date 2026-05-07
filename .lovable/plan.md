## Goal

Serve the sitemap at `https://2800.love/sitemap.xml` (same domain as the site, ideal for Google Search Console). It refreshes on every publish.

## Changes

1. **Restore `scripts/generate-sitemap.ts`** — a Vite build plugin that, at build time:
   - Fetches all `approved` locations from Supabase (id, name, updated_at, created_at)
   - Slugifies names with the same logic the app uses
   - Emits `dist/sitemap.xml` with: `/`, `/locaties`, every `/locaties/{slug}` (with `lastmod`), `/over`, `/mijn-favoriete-plek`, `/teken`, `/privacy`

2. **Re-register the plugin in `vite.config.ts`** so it runs on `vite build`.

3. **Update `public/robots.txt`** — point `Sitemap:` back to `https://2800.love/sitemap.xml`.

4. **Delete the live edge function `sitemap`** (no longer used, avoids two competing sitemaps).

## How refresh works

- New approved location → next time you click **Publish** in Lovable → sitemap regenerates with the new URL → Google sees it on its next crawl.
- No code action needed when approving locations; just remember to publish afterwards if you want Google to pick it up sooner.

## In Google Search Console

Submit: `https://2800.love/sitemap.xml`

## Files touched

- `scripts/generate-sitemap.ts` (re-created)
- `vite.config.ts` (re-add plugin import + entry)
- `public/robots.txt` (sitemap URL back to 2800.love)
- `supabase/functions/sitemap/index.ts` (deleted + undeployed)
