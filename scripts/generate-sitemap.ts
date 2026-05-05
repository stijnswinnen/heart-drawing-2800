import type { Plugin } from "vite";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const SITE = "https://2800.love";

const STATIC_URLS: Array<{ loc: string; changefreq: string; priority: string }> = [
  { loc: `${SITE}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${SITE}/locaties`, changefreq: "weekly", priority: "0.9" },
  { loc: `${SITE}/over`, changefreq: "monthly", priority: "0.7" },
  { loc: `${SITE}/mijn-favoriete-plek`, changefreq: "monthly", priority: "0.6" },
  { loc: `${SITE}/teken`, changefreq: "monthly", priority: "0.5" },
  { loc: `${SITE}/privacy`, changefreq: "yearly", priority: "0.3" },
];

const slugify = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildSlugMap = (items: { id: string; name: string }[]) => {
  const used = new Map<string, number>();
  const result = new Map<string, string>();
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
  for (const item of sorted) {
    const base = slugify(item.name) || "plek";
    const count = used.get(base) || 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    used.set(base, count + 1);
    result.set(item.id, slug);
  }
  return result;
};

async function fetchLocations(): Promise<
  { id: string; name: string; updated_at: string | null; created_at: string | null }[]
> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[sitemap] Supabase env vars missing — skipping location URLs");
    return [];
  }
  const endpoint = `${url}/rest/v1/locations?status=eq.approved&select=id,name,updated_at,created_at`;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Failed to fetch locations: ${res.status}`);
      return [];
    }
    return (await res.json()) as {
      id: string;
      name: string;
      updated_at: string | null;
      created_at: string | null;
    }[];
  } catch (e) {
    console.warn("[sitemap] Error fetching locations:", e);
    return [];
  }
}

function renderSitemap(
  entries: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }>
): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>${
          e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""
        }\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    apply: "build",
    async closeBundle() {
      const locations = await fetchLocations();
      const slugMap = buildSlugMap(locations);
      const locationEntries = locations.map((l) => {
        const slug = slugMap.get(l.id)!;
        const lastmod = (l.updated_at || l.created_at || "").slice(0, 10);
        return {
          loc: `${SITE}/locaties/${slug}`,
          changefreq: "monthly",
          priority: "0.8",
          lastmod: lastmod || undefined,
        };
      });
      const all = [
        STATIC_URLS[0],
        STATIC_URLS[1],
        ...locationEntries,
        ...STATIC_URLS.slice(2),
      ];
      const xml = renderSitemap(all);
      const outPath = resolve(process.cwd(), "dist/sitemap.xml");
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, xml, "utf8");
      console.log(`[sitemap] Wrote ${all.length} URLs to dist/sitemap.xml`);
    },
  };
}
