import { useState } from "react";
import { PopupModal } from "react-calendly";

interface PhotoSessionBookingProps {
  soloUrl: string;
  koppelUrl: string;
  gezinUrl: string;
  ownerUrl: string;
  isOwner: boolean;
}

type Audience = "solo" | "koppel" | "gezin";

interface Session {
  audience: Audience;
  badge: string;
  title: string;
  duration: string;
  price: string;
  inclusions: string[];
  urlKey: "soloUrl" | "koppelUrl" | "gezinUrl";
}

const SESSIONS: Session[] = [
  {
    audience: "solo",
    badge: "Solo",
    title: "Mijn Mechelen",
    duration: "30 min",
    price: "€55",
    inclusions: [
      "10 bewerkte foto's",
      "Levering binnen 5 werkdagen",
      "Hoge resolutie, klaar om af te drukken",
    ],
    urlKey: "soloUrl",
  },
  {
    audience: "koppel",
    badge: "Koppel",
    title: "Ons Plekje",
    duration: "45 min",
    price: "€75",
    inclusions: [
      "15 bewerkte foto's",
      "Levering binnen 5 werkdagen",
      "Hoge resolutie, klaar om af te drukken",
    ],
    urlKey: "koppelUrl",
  },
  {
    audience: "gezin",
    badge: "Gezin · max. 5",
    title: "Thuis in de Stad",
    duration: "60 min",
    price: "€95",
    inclusions: [
      "20 bewerkte foto's",
      "Levering binnen 7 werkdagen",
      "€10 per extra persoon boven 5",
    ],
    urlKey: "gezinUrl",
  },
];

const badgeStyle = (audience: Audience): React.CSSProperties => {
  switch (audience) {
    case "solo":
      return {
        background: "var(--bg, #FAF7F2)",
        border: "1px solid var(--line)",
        color: "var(--ink-muted)",
      };
    case "koppel":
      return {
        background: "var(--pink-50)",
        color: "var(--pink-600, #B84A60)",
      };
    case "gezin":
      return {
        background: "var(--lav-50)",
        color: "var(--lav-700, #5B4A8A)",
      };
  }
};

export function PhotoSessionBooking({
  soloUrl,
  koppelUrl,
  gezinUrl,
}: PhotoSessionBookingProps) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const urls = { soloUrl, koppelUrl, gezinUrl };
  const rootEl =
    typeof document !== "undefined" ? document.getElementById("root") : null;

  return (
    <section
      className="photo-session-booking"
      style={{
        borderTop: "1px solid var(--line)",
      }}
    >
      <style>{`
        .photo-session-booking {
          margin-top: 96px;
          padding-top: 56px;
        }
        @media (max-width: 880px) {
          .photo-session-booking {
            margin-top: 64px;
            padding-top: 40px;
          }
        }
        .psb-header {
          margin-bottom: 32px;
        }
        .psb-title {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 28px;
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: var(--ink);
          margin: 0 0 12px 0;
        }
        .psb-intro {
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--ink-muted);
          max-width: 640px;
          margin: 0;
        }
        .psb-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 880px) {
          .psb-grid {
            grid-template-columns: 1fr;
          }
        }
        .psb-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px 22px;
          background: var(--surface);
          transition: border-color 150ms ease, transform 150ms ease;
        }
        .psb-card:hover {
          border-color: var(--ink-2);
          transform: translateY(-2px);
        }
        .psb-badge {
          align-self: flex-start;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .psb-card-title {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 22px;
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: var(--ink);
          margin: 0;
        }
        .psb-meta {
          font-size: 14px;
          color: var(--ink-2);
          font-variant-numeric: tabular-nums;
        }
        .psb-meta .psb-dot {
          color: var(--ink-muted);
          margin: 0 6px;
        }
        .psb-meta .psb-price {
          font-weight: 500;
          color: var(--ink);
        }
        .psb-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .psb-list li {
          position: relative;
          padding-left: 14px;
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--ink-2);
        }
        .psb-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: var(--pink-500);
        }
        .psb-cta {
          margin-top: auto;
          width: 100%;
          height: 42px;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--line-strong, var(--line));
          border-radius: 999px;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .psb-cta:hover {
          border-color: var(--ink);
        }
        .psb-footnote {
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--ink-muted);
          max-width: 720px;
          margin: 20px 0 0 0;
        }
      `}</style>

      <header className="psb-header">
        <h2 className="psb-title">Wil je hier gefotografeerd worden?</h2>
        <p className="psb-intro">
          Ik kom graag bij je op locatie voor een korte fotosessie op de plek
          waar jouw hart sneller klopt. Kies uit één van de drie pakketten, op
          maat van met je komt.
        </p>
      </header>

      <div className="psb-grid">
        {SESSIONS.map((s) => {
          const url = urls[s.urlKey];
          return (
            <article key={s.title} className="psb-card">
              <span className="psb-badge" style={badgeStyle(s.audience)}>
                {s.badge}
              </span>
              <h3 className="psb-card-title">{s.title}</h3>
              <div className="psb-meta">
                {s.duration}
                <span className="psb-dot">·</span>
                <span className="psb-price">{s.price}</span>
              </div>
              <ul className="psb-list">
                {s.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button
                type="button"
                className="psb-cta"
                onClick={() => setOpenUrl(url)}
              >
                Boek deze sessie
              </button>
            </article>
          );
        })}
      </div>

      <p className="psb-footnote">
        Alle pakketten leveren digitale bestanden op hoge resolutie (min. 300
        dpi, sRGB), geschikt om af te drukken tot A5-formaat.
      </p>

      {rootEl && openUrl && (
        <PopupModal
          url={openUrl}
          open={!!openUrl}
          onModalClose={() => setOpenUrl(null)}
          rootElement={rootEl}
          prefill={{
            customAnswers: {
              a2: window.location.href,
            },
          }}
        />
      )}
    </section>
  );
}

export default PhotoSessionBooking;
