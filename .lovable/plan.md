## Context

The SEO scanner flagged two findings assuming `heart-drawing-2800.lovable.app` is the canonical domain:

- `http:robots` — "Sitemap directive points at 2800.love, not your project domain"
- `http:sitemap` — "Sitemap entries point at 2800.love, not your project domain"

In reality, **`2800.love` is the production domain**. The codebase confirms this:
- `public/robots.txt` → `Sitemap: https://2800.love/sitemap.xml`
- `scripts/generate-sitemap.ts` → `const SITE = "https://2800.love"`
- `src/components/Seo.tsx` → `const SITE = "https://2800.love"`

The scanner is wrong; no code changes are needed.

## Plan

Mark both findings as fixed via `seo_chat--update_findings`, with explanations stating that `2800.love` is the intended canonical domain and the sitemap/robots already point to it correctly.

The `http:sitemap` finding also mentions missing routes (`/auth`, `/admin`, `/verify`, `/hearts`, `/locaties/:slug`). Those are intentionally excluded (admin/auth/utility) or already covered (`/locaties/:slug` is generated dynamically in `scripts/generate-sitemap.ts`). `/hearts` could arguably be added — flagging here, but not changing unless you want it indexed.

No file changes. Two `update_findings` calls only.