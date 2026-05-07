import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://2800.love";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: locations, error } = await supabase
      .from("locations")
      .select("id, name, updated_at, created_at")
      .eq("status", "approved");

    if (error) throw error;

    const slugMap = buildSlugMap(locations ?? []);
    const locationEntries = (locations ?? []).map((l) => {
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

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
      status: 200,
    });
  } catch (e) {
    console.error("[sitemap] error:", e);
    return new Response(`Error generating sitemap: ${(e as Error).message}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
