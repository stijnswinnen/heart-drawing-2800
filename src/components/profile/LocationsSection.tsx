import { useSession } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { slugify } from "@/utils/slug";
import { Heart } from "lucide-react";

type TabKey = "shared" | "favorites" | "pending" | "rejected";

const tagStyleFor = (category: string | null | undefined): React.CSSProperties => {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "natuur":
      return { background: "var(--green-50)", color: "var(--green-700)" };
    case "horeca":
      return { background: "var(--pink-50)", color: "var(--pink-600)" };
    case "cultuur":
      return { background: "var(--lav-50)", color: "var(--lav-700)" };
    case "stad":
      return { background: "var(--sand-50)", color: "var(--sand-700)" };
    default:
      return {
        background: "var(--bg)",
        color: "var(--ink-muted)",
        border: "1px solid var(--line)",
      };
  }
};

export const LocationsSection = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes, handleLike } = useLocationLikes();
  const [activeTab, setActiveTab] = useState<TabKey>("shared");

  const userId = session?.user?.id;

  const sharedLocations = locations.filter(
    (l) =>
      (l.user_id === userId || l.heart_user_id === userId) &&
      l.status === "approved"
  );

  const userLikes = locationLikes.filter(
    (l) => l.user_id === userId && l.status === "active"
  );
  const favoriteLocations = locations.filter((l) =>
    userLikes.some((like) => like.location_id === l.id)
  );

  const pendingLocations = locations.filter(
    (l) =>
      (l.user_id === userId || l.heart_user_id === userId) &&
      (l.status === "new" || l.status === "pending_verification")
  );

  const rejectedLocations = locations.filter(
    (l) =>
      (l.user_id === userId || l.heart_user_id === userId) &&
      l.status === "rejected"
  );

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "shared", label: "Gedeeld", count: sharedLocations.length },
    { key: "favorites", label: "Favorieten", count: favoriteLocations.length },
    { key: "pending", label: "In afwachting", count: pendingLocations.length },
    { key: "rejected", label: "Afgekeurd", count: rejectedLocations.length },
  ];

  const emptyCopy: Record<TabKey, { title: string; sub: string }> = {
    shared: {
      title: "Je hebt nog geen plek gedeeld.",
      sub: "Deel een plek die jouw hart sneller doet kloppen — na moderatie verschijnt ze hier.",
    },
    favorites: {
      title: "Nog geen favorieten gemarkeerd.",
      sub: "Tik op een hartje bij een plek om ze hier te bewaren.",
    },
    pending: {
      title: "Geen plekken in afwachting.",
      sub: "Wanneer je een nieuwe plek deelt, verschijnt die hier tot de moderatie ze publiceert.",
    },
    rejected: {
      title: "Niets afgekeurd.",
      sub: "Mocht een plek niet door de moderatie geraken, dan vind je hem hier terug met feedback.",
    },
  };

  const currentList =
    activeTab === "shared"
      ? sharedLocations
      : activeTab === "favorites"
      ? favoriteLocations
      : activeTab === "pending"
      ? pendingLocations
      : rejectedLocations;

  const outlinePill =
    "inline-flex items-center justify-center h-9 px-4 rounded-full text-[13px] font-medium font-sans text-ink bg-surface border border-line-strong hover:border-ink-2 transition-colors";

  return (
    <section>
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: 16 }}
      >
        <h2
          className="font-serif font-normal text-ink m-0"
          style={{ fontSize: 26, letterSpacing: "-0.01em" }}
        >
          Jouw plekken
        </h2>
        <Link
          to="/mijn-favoriete-plek"
          className="inline-flex items-center justify-center h-10 px-5 rounded-full font-sans font-medium transition-colors"
          style={{
            fontSize: 14,
            background: "var(--pink-500)",
            color: "#fff",
          }}
        >
          + Voeg een plek toe
        </Link>
      </div>

      {/* Tabs */}
      <div
        className="mt-6 flex flex-wrap"
        style={{ gap: 24, borderBottom: "1px solid var(--line)" }}
      >
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="font-sans inline-flex items-center"
              style={{
                gap: 8,
                padding: "10px 0",
                marginBottom: -1,
                background: "transparent",
                border: 0,
                borderBottom: `1.5px solid ${active ? "var(--ink)" : "transparent"}`,
                color: active ? "var(--ink)" : "var(--ink-muted)",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t.label}
              <span
                style={{
                  fontSize: 11.5,
                  fontVariantNumeric: "tabular-nums",
                  padding: "1px 8px",
                  borderRadius: 999,
                  background: active ? "var(--ink)" : "var(--bg)",
                  color: active ? "#fff" : "var(--ink-muted)",
                  border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                  lineHeight: 1.4,
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentList.length === 0 ? (
          <div
            className="text-center"
            style={{
              border: "1px dashed var(--line-strong)",
              borderRadius: 14,
              padding: "56px 24px",
            }}
          >
            <p
              className="font-serif font-normal m-0"
              style={{ fontSize: 18, color: "var(--ink)" }}
            >
              {emptyCopy[activeTab].title}
            </p>
            <p
              className="font-sans m-0 mx-auto"
              style={{
                marginTop: 10,
                fontSize: 13.5,
                color: "var(--ink-muted)",
                maxWidth: "42ch",
              }}
            >
              {emptyCopy[activeTab].sub}
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {currentList.map((location) => {
              const tagStyle = tagStyleFor(location.category);
              return (
                <article
                  key={location.id}
                  className="flex items-start justify-between transition-colors"
                  style={{
                    gap: 24,
                    padding: "22px 24px",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    background: "var(--surface)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--ink-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--line)")
                  }
                >
                  <div className="flex-1 min-w-0">
                    {location.category && (
                      <span
                        className="inline-block uppercase font-sans font-medium rounded-full"
                        style={{
                          ...tagStyle,
                          fontSize: 12,
                          letterSpacing: ".02em",
                          padding: "4px 10px",
                          marginBottom: 10,
                        }}
                      >
                        {location.category}
                      </span>
                    )}
                    <h3
                      className="font-serif font-normal text-ink m-0"
                      style={{ fontSize: 22, lineHeight: 1.2 }}
                    >
                      {location.name}
                    </h3>
                    {location.description && (
                      <p
                        className="font-sans m-0"
                        style={{
                          marginTop: 6,
                          fontSize: 14.5,
                          color: "var(--ink-2)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {location.description}
                      </p>
                    )}
                    {activeTab === "rejected" && location.rejection_reason && (
                      <p
                        className="font-sans m-0"
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          color: "var(--pink-600)",
                        }}
                      >
                        {location.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center shrink-0"
                    style={{ gap: 10 }}
                  >
                    {activeTab === "favorites" && (
                      <button
                        type="button"
                        aria-label="Verwijder favoriet"
                        onClick={() => handleLike(location.id)}
                        className="inline-flex items-center justify-center transition-colors"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          border: "1px solid var(--line-strong)",
                          background: "var(--surface)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--pink-50)";
                          e.currentTarget.style.borderColor = "var(--pink-300)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface)";
                          e.currentTarget.style.borderColor =
                            "var(--line-strong)";
                        }}
                      >
                        <Heart
                          style={{
                            width: 16,
                            height: 16,
                            color: "var(--pink-500)",
                            fill: "var(--pink-500)",
                          }}
                        />
                      </button>
                    )}
                    {(activeTab === "shared" || activeTab === "favorites") && (
                      <Link
                        to={`/locaties/${slugify(location.name)}`}
                        className={outlinePill}
                      >
                        Bekijk →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
