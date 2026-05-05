import { Link } from "react-router-dom";

interface DrawingTitleProps {
  isDrawing: boolean;
  onHeartClick: () => void;
}

export const DrawingTitle = ({ isDrawing, onHeartClick }: DrawingTitleProps) => {
  // While drawing: keep the small "2800" marker in its corner, identical behaviour as before.
  if (isDrawing) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 transition-all duration-700 md:translate-x-[-150%] md:ml-8 md:top-1/2 top-8 -translate-y-0 mt-4">
        <h1 className="text-[clamp(100px,20vw,200px)] font-serif font-light text-ink opacity-20 leading-none tracking-[-0.04em]">
          2800
        </h1>
      </div>
    );
  }

  // Hero
  return (
    <section
      className="relative w-full"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div className="grid place-items-center text-center px-7 pt-20 pb-16 md:pt-[120px] md:pb-20">
        {/* Eyebrow */}
        <span
          className="inline-flex items-center gap-2 rounded-full font-sans font-medium uppercase mb-7"
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
          onClick={onHeartClick}
          className="m-0 inline-flex items-center cursor-pointer select-none font-serif font-light text-ink"
          style={{
            fontSize: "clamp(80px, 16vw, 220px)",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            gap: "0.12em",
          }}
        >
          2800
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{
              width: "0.55em",
              height: "0.55em",
              color: "var(--pink-300)",
              transform: "translateY(0.04em)",
            }}
          >
            <path d="M12 21s-7.5-4.6-9.6-9.4C.7 7.4 3.3 3 7.6 3c2.1 0 3.6 1 4.4 2.3C12.8 4 14.3 3 16.4 3c4.3 0 6.9 4.4 5.2 8.6C19.5 16.4 12 21 12 21z" />
          </svg>
        </h1>

        {/* Subline */}
        <p
          className="font-sans text-center"
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
        <div className="flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 40 }}>
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
      </div>
    </section>
  );
};
