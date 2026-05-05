import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { useLocations } from "@/hooks/useLocations";
import { buildSlugMap } from "@/utils/slug";
import { LocationCard } from "@/components/LocationCard";
import { OverviewMap } from "@/components/OverviewMap";

const formatDutchDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
};

const LocatiesOverview = () => {
  const locations = useLocations();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const slugMap = useMemo(() => buildSlugMap(locations), [locations]);

  const locationsWithSlug = useMemo(
    () => locations.map((l) => ({ ...l, slug: slugMap.get(l.id) || "" })),
    [locations, slugMap]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set).sort();
  }, [locations]);

  const filtered = useMemo(() => {
    if (!activeCategory) return locationsWithSlug;
    return locationsWithSlug.filter((l) => l.category === activeCategory);
  }, [locationsWithSlug, activeCategory]);

  // useLocations doesn't expose created_at/updated_at — compute "most recent" if available
  const mostRecentDate = useMemo(() => {
    const dates = locations
      .map((l: any) => l.updated_at || l.created_at)
      .filter(Boolean) as string[];
    if (!dates.length) return "";
    const max = dates.reduce((a, b) => (a > b ? a : b));
    return formatDutchDate(max);
  }, [locations]);

  const Pill = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="rounded-full transition-colors"
      style={{
        padding: "8px 16px",
        fontSize: 14,
        background: active ? "var(--ink)" : "transparent",
        border: active ? "1px solid var(--ink)" : "1px solid var(--line-strong)",
        color: active ? "#FFFFFF" : "var(--ink-2)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <main className="max-w-[1200px] mx-auto" style={{ padding: "56px 28px 96px" }}>
        {/* Header */}
        <span
          className="inline-block uppercase tracking-wide rounded-full"
          style={{
            background: "var(--pink-50)",
            color: "var(--pink-600)",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 12px",
          }}
        >
          Plekjes in 2800
        </span>
        <h1
          className="font-fraunces font-normal text-ink mt-5"
          style={{
            fontSize: "clamp(44px, 6vw, 72px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
          }}
        >
          Hartjes van Mechelen.
        </h1>
        <p
          className="mt-5"
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            maxWidth: "60ch",
          }}
        >
          Een groeiende collectie favoriete plekjes — gedeeld door Mechelaars en
          bezoekers van de stad. Klik op een pin of een kaartje om het verhaal te
          lezen.
        </p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Pill active={activeCategory === null} onClick={() => setActiveCategory(null)}>
            Alle plekjes{" "}
            <span style={{ opacity: 0.55, marginLeft: 4 }}>{locations.length}</span>
          </Pill>
          {categories.map((cat) => (
            <Pill
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Pill>
          ))}
        </div>

        {/* Map */}
        <div
          className="rounded-[20px] overflow-hidden bg-surface border border-line"
          style={{ marginTop: 32, boxShadow: "var(--shadow-soft)" }}
        >
          <div className="w-full h-[360px] md:h-[480px]">
            <OverviewMap locations={filtered} />
          </div>
        </div>

        {/* Stats */}
        <p className="mt-6" style={{ fontSize: 13, color: "var(--ink-muted)" }}>
          <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
            {filtered.length}
          </strong>{" "}
          plekjes
          {mostRecentDate && <> · Bijgewerkt op {mostRecentDate}</>}
        </p>

        {/* Card grid */}
        <div
          className="grid gap-[18px] mt-6"
          style={{
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
          }}
        >
          <style>{`
            @media (min-width: 700px) {
              .loc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
            @media (min-width: 980px) {
              .loc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            }
          `}</style>
          <div
            className="loc-grid grid gap-[18px]"
            style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
          >
            {filtered.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
                Nog geen plekjes gedeeld
              </p>
            ) : (
              filtered.map((loc) => (
                <LocationCard key={loc.id} location={loc} slug={loc.slug} />
              ))
            )}
          </div>
        </div>

        {/* CTA strip */}
        <div
          className="mt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={{
            background: "var(--pink-50)",
            borderRadius: 20,
            padding: "28px 32px",
          }}
        >
          <div>
            <h3
              className="font-fraunces font-normal text-ink"
              style={{ fontSize: 24, lineHeight: 1.2 }}
            >
              Mis jij jouw plek?
            </h3>
            <p className="mt-1" style={{ fontSize: 15, color: "var(--ink-2)" }}>
              Voeg je favoriete plekje toe en help de collectie groeien.
            </p>
          </div>
          <Link
            to="/mijn-favoriete-plek"
            className="inline-flex items-center justify-center rounded-full font-medium self-start sm:self-auto"
            style={{
              height: 52,
              padding: "0 26px",
              fontSize: 15,
              background: "var(--pink-500)",
              color: "var(--surface)",
              border: "1px solid var(--pink-500)",
            }}
          >
            Deel een plek →
          </Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
};

export default LocatiesOverview;
