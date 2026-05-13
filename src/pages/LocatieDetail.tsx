import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { LocationsMap } from "@/components/LocationsMap";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocations } from "@/hooks/useLocations";
import { LocationDetailsPanel } from "@/components/LocationDetailsPanel";
import { ArrowLeft } from "lucide-react";
import { LocationCard } from "@/components/LocationCard";
import { buildSlugMap } from "@/utils/slug";
import { Seo } from "@/components/Seo";
import { PhotoSessionBooking } from "@/components/PhotoSessionBooking";
import { CALENDLY_URLS } from "@/config/calendly";
import { useSession } from "@supabase/auth-helpers-react";
import { LocationHero } from "@/components/LocationHero";
import { Helmet } from "react-helmet-async";

const LocatieDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const locations = useLocations();
  const session = useSession();

  const slugMap = useMemo(() => buildSlugMap(locations), [locations]);
  const idToSlug = slugMap;
  const slugToId = useMemo(() => {
    const m = new Map<string, string>();
    slugMap.forEach((s, id) => m.set(s, id));
    return m;
  }, [slugMap]);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setHasScrolled(false);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) setHasScrolled(true);
      else setHasScrolled(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedLocationId = slug ? slugToId.get(slug) ?? null : null;
  const selectedLocation = locations.find((loc) => loc.id === selectedLocationId);

  const osmUrl = selectedLocation
    ? `https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=17/${selectedLocation.latitude}/${selectedLocation.longitude}`
    : "#";

  const handleSelect = (locationId: string) => {
    const s = idToSlug.get(locationId);
    if (s) navigate(`/locaties/${s}`);
  };

  // Build SEO description
  let seoTitle = "Plekje in Mechelen · 2800.love";
  let seoDescription: string | undefined;
  if (selectedLocation) {
    const category = (selectedLocation.category || "plek").toLowerCase();
    const sharedBy = (selectedLocation as any).sharedBy as string | undefined;
    const rawShort =
      ((selectedLocation as any).shortDescription as string | undefined) ||
      (selectedLocation.description
        ? selectedLocation.description.split(/(?<=[.!?])\s/)[0]
        : "");
    const truncate = (s: string, max: number) => {
      if (s.length <= max) return s;
      const cut = s.slice(0, max);
      const i = cut.lastIndexOf(" ");
      return (i > 0 ? cut.slice(0, i) : cut).replace(/[.,;:!?]+$/, "") + "…";
    };
    let shortDesc = truncate(rawShort || "", 95);
    const buildDesc = (sd: string) =>
      sharedBy
        ? `${sharedBy} deelt ${selectedLocation.name}, een ${category} in Mechelen. ${sd}`
        : `${selectedLocation.name}, een ${category} in Mechelen. ${sd}`;
    let desc = buildDesc(shortDesc);
    while (desc.length > 160 && shortDesc.length > 20) {
      shortDesc = truncate(shortDesc.replace(/…$/, ""), shortDesc.length - 10);
      desc = buildDesc(shortDesc);
    }
    seoTitle = `${selectedLocation.name}, een lievelingsplek in Mechelen · 2800.love`;
    seoDescription = desc;
  }

  const plainDesc = (selectedLocation?.description || "").replace(/<[^>]*>/g, "").trim();
  const placeJsonLd = selectedLocation
    ? {
        "@context": "https://schema.org",
        "@type": "Place",
        name: selectedLocation.name,
        description: plainDesc,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mechelen",
          postalCode: "2800",
          addressCountry: "BE",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: String(selectedLocation.latitude),
          longitude: String(selectedLocation.longitude),
        },
        url: `https://2800.love/locaties/${slug}`,
      }
    : null;
  const breadcrumbJsonLd = selectedLocation
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Plekjes",
            item: "https://2800.love/locaties",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: selectedLocation.name,
            item: `https://2800.love/locaties/${slug}`,
          },
        ],
      }
    : null;
  const jsonLd = [placeJsonLd, breadcrumbJsonLd].filter(Boolean) as unknown[];

  const hasHero = Boolean(selectedLocation?.image_path);

  return (
    <div className="min-h-screen bg-bg">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/locaties/${slug ?? ""}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <Navigation transparentOverHero={hasHero} />

      {hasHero && selectedLocation && (
        <LocationHero
          imageUrl={selectedLocation.image_path as string}
          name={selectedLocation.name}
          category={selectedLocation.category}
          summary={selectedLocation.summary}
        />
      )}

      <main
        className={`max-w-[1200px] mx-auto px-7 pb-24 ${
          hasHero ? "pt-14" : "pt-[88px]"
        }`}
      >
        <Link
          to="/locaties"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors mb-9"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Alle plekjes
        </Link>

        <div className="grid grid-cols-1 min-[880px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-16 items-start">
          {/* LEFT: details */}
          <div className="order-2 min-[880px]:order-1">
            {selectedLocation && (
              <LocationDetailsPanel
                location={{
                  id: selectedLocation.id,
                  name: selectedLocation.name,
                  description: selectedLocation.description,
                  heart_user_id: selectedLocation.heart_user_id || null,
                  recommendation: selectedLocation.recommendation,
                  image_path: selectedLocation.image_path || null,
                  category: selectedLocation.category || null,
                  summary: selectedLocation.summary || null,
                }}
                onClose={() => navigate("/locaties")}
                heroAbove={hasHero}
              />
            )}
          </div>

          {/* RIGHT: map */}
          <div className="order-1 min-[880px]:order-2">
            <div className="min-[880px]:sticky min-[880px]:top-[88px]">
              <div
                className="rounded-[20px] overflow-hidden bg-surface border border-line"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="aspect-[4/5] w-full">
                  <LocationsMap
                    selectedLocationId={selectedLocationId}
                    onLocationSelect={handleSelect}
                  />
                </div>
              </div>
              {selectedLocation && (
                <div className="flex items-center justify-between mt-4 px-1 text-[13px]">
                  <span className="text-ink-muted">Mechelen</span>
                  <a
                    href={osmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-ink transition-colors"
                  >
                    Open in kaart →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {!selectedLocation?.photo_session_hidden && (
          <PhotoSessionBooking
            soloUrl={CALENDLY_URLS.solo}
            koppelUrl={CALENDLY_URLS.koppel}
            gezinUrl={CALENDLY_URLS.gezin}
            ownerUrl={CALENDLY_URLS.owner}
            isOwner={Boolean(
              session?.user?.id &&
                selectedLocation &&
                (selectedLocation.user_id === session.user.id ||
                  selectedLocation.heart_user_id === session.user.id) &&
                selectedLocation.status === "approved"
            )}
          />
        )}

        {/* Related locations */}
        {selectedLocation && locations.length > 1 && (
          <section
            className="border-t border-line"
            style={{ marginTop: "96px", paddingTop: "48px" }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2
                className="font-fraunces font-normal text-ink"
                style={{ fontSize: "28px", lineHeight: 1.1 }}
              >
                Andere plekjes in 2800
              </h2>
              <Link
                to="/locaties"
                className="inline-flex items-center text-[14px] text-ink-muted hover:text-ink hover:bg-pink-50 rounded-full px-3 py-1.5 transition-colors"
              >
                Bekijk alle →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
              {locations
                .filter((l) => l.id !== selectedLocation.id)
                .slice(0, 3)
                .map((loc) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    slug={idToSlug.get(loc.id) || ""}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
      <div
        className={`transition-opacity duration-500 ${hasScrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <HomeFooter />
      </div>
    </div>
  );
};

export default LocatieDetail;
