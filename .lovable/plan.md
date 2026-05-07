## Goal

Serve `sitemap.xml` dynamically from a Supabase edge function so newly approved locations show up in Google Search Console immediately, without waiting for the next publish.

## Approach

Lovable hosting serves files from the build output as-is and doesn't support rewrite rules, so we can't keep the URL `https://2800.love/sitemap.xml` and have it secretly hit an edge function. The cleanest "always live" option is to serve the sitemap directly from a public Supabase edge function URL and point Google + `robots.txt` at it.

The edge function URL stays stable for the life of the project, so this is safe to submit to Google Search Console.

### What gets built

1. **New edge function `sitemap`** (public, `verify_jwt = false`)
   - Queries `locations` where `status = 'approved'` (id, name, updated_at, created_at)
   - Reuses the same slug logic as `scripts/generate-sitemap.ts` (port `slugify` + `buildSlugMap` into the function)
   - Emits the same XML shape as today: static pages first, then `/locaties/{slug}` entries with `lastmod`
   - Returns `Content-Type: application/xml` and a short `Cache-Control` (e.g. `public, max-age=300, s-maxage=300`) so Google sees fresh data within minutes but we don't hammer the DB
   - URL: `https://webocybzloqwnyxpquam.supabase.co/functions/v1/sitemap`

2. **Update `public/robots.txt`**
   - Change the `Sitemap:` line to point at the edge function URL above

3. **Remove the build-time sitemap generator** (no longer needed)
   - Delete `scripts/generate-sitemap.ts`
   - Remove the `sitemapPlugin()` import + entry from `vite.config.ts`
   - This avoids two competing sitemaps and keeps a single source of truth

4. **Google Search Console**
   - You re-submit the sitemap once, using the new edge function URL
   - From then on it's always live — no further action on new locations

## Pages included

Same set as today, kept in sync inside the edge function:

```text
/                       priority 1.0   weekly
/locaties               priority 0.9   weekly
/locaties/{slug}        priority 0.8   monthly   (one per approved location, with lastmod)
/over                   priority 0.7   monthly
/mijn-favoriete-plek    priority 0.6   monthly
/teken                  priority 0.5   monthly
/privacy                priority 0.3   yearly
```

Routes intentionally excluded (match current `robots.txt` disallow list): `/profile`, `/auth`, `/admin`, `/verify`, `/reset-password`, `/hearts`.

## Trade-offs

- **Pro**: Always fresh — a new approved location appears in the sitemap within ~5 minutes (cache TTL), no republish needed.
- **Pro**: Single source of truth, less build complexity.
- **Con**: The sitemap URL is on the `*.supabase.co` domain rather than `2800.love`. Google Search Console accepts cross-host sitemaps as long as they're declared in `robots.txt` on the site, which we'll do.

## Technical details

- Function file: `supabase/functions/sitemap/index.ts`
- Uses anon key + public `SELECT` RLS policy `Anyone can view approved locations` — no service role needed
- CORS headers included (harmless for a GET XML endpoint)
- `slugify` / `buildSlugMap` copied verbatim so URLs stay identical to the current sitemap (no SEO churn)
- Response headers: `Content-Type: application/xml; charset=utf-8`, `Cache-Control: public, max-age=300`
