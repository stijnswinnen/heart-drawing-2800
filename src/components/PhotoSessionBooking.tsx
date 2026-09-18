interface AddOn {
  label: string;
  price: string;
}

const BASE_OFFER = [
  "30 minuten fotosessie op de gekozen locatie",
  "Maximum 4 personen",
  "10 bewerkte foto's in hoge resolutie (min. 300 dpi, sRGB, printklaar tot A3)",
  "Levering binnen 5 werkdagen via online galerij",
];

const ADD_ONS: AddOn[] = [
  { label: "Extra 15 minuten", price: "+€20" },
  { label: "Extra persoon (vanaf 5e)", price: "+€15 / persoon" },
  { label: "Extra bewerkte foto's", price: "+€5 / foto" },
  { label: "Spoedlevering (binnen 48u)", price: "+€25" },
  { label: "Fotoboek 15×15 cm — 20 pagina's", price: "+€100" },
  { label: "Extra pagina's fotoboek", price: "+€10 / 2 pagina's" },
  { label: "Gepersonaliseerd fotoboek", price: "Op aanvraag" },
];

interface PhotoSessionBookingProps {
  tidycalUrl: string;
  ownerTidycalUrl?: string;
  isOwner?: boolean;
}

export function PhotoSessionBooking({
  tidycalUrl,
  ownerTidycalUrl,
  isOwner = false,
}: PhotoSessionBookingProps) {
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
        .psb-columns {
          display: flex;
          gap: 40px;
          align-items: stretch;
        }
        @media (max-width: 880px) {
          .psb-columns {
            flex-direction: column;
            gap: 24px;
          }
        }
        .psb-base {
          flex: 1 1 50%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 28px 26px;
          background: var(--surface);
          box-shadow: var(--shadow-soft);
        }
        .psb-price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .psb-price {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 40px;
          letter-spacing: -0.01em;
          line-height: 1;
          color: var(--ink);
        }
        .psb-price-note {
          font-size: 13px;
          color: var(--ink-muted);
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
        .psb-addons {
          flex: 1 1 50%;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .psb-addons-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin: 0 0 14px 0;
        }
        .psb-addons-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .psb-addons-list li {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid var(--line);
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-2);
        }
        .psb-addons-list li:last-child {
          border-bottom: none;
        }
        .psb-addon-price {
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          color: var(--ink-2);
        }
        .psb-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          box-sizing: border-box;
          text-align: center;
          height: 48px;
          padding: 0 26px;
          font-size: 15px;
          font-weight: 500;
          background: var(--pink-500);
          color: var(--surface);
          border: 1px solid var(--pink-500);
          border-radius: 999px;
          text-decoration: none;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .psb-cta:hover {
          background: var(--pink-600);
          border-color: var(--pink-600);
        }
        .psb-owner {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px 22px;
          background: var(--surface);
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .psb-owner-badge {
          align-self: flex-start;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--pink-100);
          color: var(--pink-600);
        }
        .psb-owner-title {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 20px;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin: 0;
        }
        .psb-owner-meta {
          font-size: 13.5px;
          color: var(--ink-2);
        }
        .psb-owner-free {
          color: var(--pink-500);
          font-weight: 500;
        }
        .psb-owner {
          margin-top: 40px;
          margin-bottom: 0;
        }
        .psb-owner .psb-cta {
          align-self: flex-start;
          width: auto;
          height: 44px;
          padding: 0 24px;
          font-size: 14px;
          margin-top: 4px;
          background: var(--surface);
          color: var(--ink);
          border-color: var(--line-strong);
        }
        .psb-owner .psb-cta:hover {
          background: var(--surface);
          border-color: var(--ink-muted);
        }
        .psb-footnote {
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink-muted);
          margin: 16px 0 0 0;
        }
      `}</style>

      <header className="psb-header">
        <h2 className="psb-title">Wil je hier gefotografeerd worden?</h2>
      </header>

      {isOwner && ownerTidycalUrl && (
        <div className="psb-owner">
          <span className="psb-owner-badge">Enkel voor jou</span>
          <h3 className="psb-owner-title">Je favoriete plek</h3>
          <div className="psb-owner-meta">
            15 min · <strong className="psb-owner-free">Gratis</strong> · 1
            bewerkte foto, voor 2800.love en social media
          </div>
          <a
            className="psb-cta"
            href={ownerTidycalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Boek je gratis sessie
          </a>
        </div>
      )}

      <div className="psb-columns">
        <div className="psb-base">
          <div className="psb-price-row">
            <span className="psb-price">€65</span>
            <span className="psb-price-note">per sessie</span>
          </div>
          <ul className="psb-list">
            {BASE_OFFER.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a
            className="psb-cta"
            href={tidycalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Boek een sessie op deze locatie
          </a>
          <p className="psb-footnote">
            De uitbreidingen bespreek je bij de boeking of voeg je achteraf
            toe.
          </p>
        </div>

        <div className="psb-addons">
          <h3 className="psb-addons-title">Uitbreidingen</h3>
          <ul className="psb-addons-list">
            {ADD_ONS.map((addOn) => (
              <li key={addOn.label}>
                <span>{addOn.label}</span>
                <span className="psb-addon-price">{addOn.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PhotoSessionBooking;
