import { Link } from "react-router-dom";

interface DrawingTitleProps {
  onHeartClick: () => void;
}

const HeartSvg = () => (
  <svg
    className="heart"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 21s-7.5-4.6-9.6-9.4C.7 7.4 3.3 3 7.6 3c2.1 0 3.6 1 4.4 2.3C12.8 4 14.3 3 16.4 3c4.3 0 6.9 4.4 5.2 8.6C19.5 16.4 12 21 12 21z" />
  </svg>
);

export const DrawingTitle = ({ onHeartClick }: DrawingTitleProps) => {
  return (
    <section className="hero">
      {/* Eyebrow */}
      <span
        className="hero-eyebrow inline-flex items-center gap-2 rounded-full font-sans font-medium uppercase mb-7"
        style={{
          padding: "6px 14px",
          background: "var(--pink-50)",
          color: "var(--pink-600)",
          fontSize: "12px",
          letterSpacing: "0.02em",
        }}
      >
        <span
          aria-hidden="true"
          className="rounded-full"
          style={{ width: 6, height: 6, background: "var(--pink-500)" }}
        />
        Mechelen, een stad vol verhalen
      </span>

      {/* Headline */}
      <h1
        className="hero-title m-0 inline-flex items-center select-none font-serif font-light text-ink"
        style={{
          fontSize: "clamp(80px, 16vw, 220px)",
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          gap: "0.12em",
        }}
      >
        <span className="hidden-2800-mobile-canvas">2800</span>
        <button
          type="button"
          className="heart-btn"
          aria-label="Begin met tekenen"
          onClick={onHeartClick}
        >
          <HeartSvg />
        </button>
      </h1>

      {/* Subline */}
      <p
        className="hero-subline font-sans text-center"
        style={{
          marginTop: 28,
          color: "var(--ink-muted)",
          fontSize: 17,
          maxWidth: 520,
        }}
      >
        Een groeiend project dat de liefde voor Mechelen viert. Teken jouw hart en
        ontdek de mooiste plekjes van de stad.
      </p>

      {/* CTAs */}
      <div className="hero-ctas flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 40 }}>
        <Link
          to="/locaties"
          className="inline-flex items-center justify-center rounded-full font-sans font-medium transition-colors"
          style={{
            height: 52,
            padding: "0 26px",
            fontSize: 15,
            background: "var(--pink-500)",
            color: "var(--surface)",
            border: "1px solid var(--pink-500)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--pink-600)";
            e.currentTarget.style.borderColor = "var(--pink-600)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--pink-500)";
            e.currentTarget.style.borderColor = "var(--pink-500)";
          }}
        >
          Ontdek de plekjes
        </Link>

        <button
          type="button"
          onClick={onHeartClick}
          className="inline-flex items-center justify-center rounded-full font-sans font-medium transition-colors"
          style={{
            height: 52,
            padding: "0 26px",
            fontSize: 15,
            background: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--line-strong)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line-strong)")}
        >
          Teken een hart
        </button>
      </div>
    </section>
  );
};
