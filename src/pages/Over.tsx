import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";

const Over = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <main className="mx-auto w-full max-w-[720px] px-7 pt-16 pb-24">
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
          Over 2800.love
        </span>

        {/* Title */}
        <h1
          className="m-0 font-serif font-normal text-ink"
          style={{
            fontSize: "clamp(44px, 6vw, 72px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
          }}
        >
          Een visuele ode<br className="hidden md:inline" /> aan Mechelen.
        </h1>

        {/* Lead */}
        <p
          className="mt-7 m-0"
          style={{
            fontSize: "19px",
            color: "var(--ink-2)",
            lineHeight: 1.55,
            maxWidth: "60ch",
          }}
        >
          2800.love is een groeiend project dat de liefde voor Mechelen viert — en jij kan meedoen. Met dit initiatief zetten we de fijnste plekken in de stad op een positieve manier in de kijker.
        </p>

        {/* Prose paragraph */}
        <p
          className="m-0"
          style={{
            marginTop: "56px",
            fontSize: "17px",
            color: "var(--ink-2)",
            lineHeight: 1.7,
            maxWidth: "60ch",
          }}
        >
          Ken je de hashtag <strong style={{ fontWeight: 600, color: "var(--ink)" }}>#2800love</strong> al? Die duikt overal in Mechelen op, van slogans tot op fanartikelen. Nu krijgt die hashtag een nieuwe dimensie met dit project.
        </p>

        {/* Pull-quote divider */}
        <div
          style={{
            margin: "48px 0",
            padding: "40px 0",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            textAlign: "center",
          }}
        >
          <p
            className="m-0 font-serif"
            style={{
              fontWeight: 300,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            Hoe? Door <em style={{ fontStyle: "italic", color: "var(--pink-500)" }}>jouw</em> hart.
          </p>
        </div>

        {/* Participation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 01 */}
          <article
            className="flex flex-col"
            style={{
              border: "1px solid var(--line)",
              borderRadius: "20px",
              padding: "32px 30px",
              background: "var(--surface)",
            }}
          >
            <div
              className="font-serif"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                color: "var(--pink-500)",
                letterSpacing: "0.04em",
              }}
            >
              01 — Teken
            </div>
            <h2
              className="font-serif m-0 mt-3"
              style={{ fontWeight: 400, fontSize: "26px", lineHeight: 1.1 }}
            >
              Teken een hart
            </h2>
            <p
              className="m-0 mt-4"
              style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.6 }}
            >
              Teken jouw hart en voeg het toe aan de collectie. Zo verzamelen we 2800 unieke hartjes. Met behulp van animatie en AI brengen we elk hart later tot leven.
            </p>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: "14px",
                color: "var(--muted-foreground, #7A726B)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Elk hart wordt deel van het steeds veranderende logo van 2800.love — zo bouwen we samen aan een visuele ode aan de stad.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full transition-colors"
              style={{
                marginTop: "auto",
                height: "52px",
                padding: "0 26px",
                background: "var(--pink-500)",
                color: "var(--surface)",
                fontSize: "15px",
                fontWeight: 500,
                alignSelf: "flex-start",
              }}
            >
              Begin met tekenen →
            </Link>
          </article>

          {/* Card 02 */}
          <article
            className="flex flex-col"
            style={{
              border: "1px solid var(--line)",
              borderRadius: "20px",
              padding: "32px 30px",
              background: "var(--surface)",
            }}
          >
            <div
              className="font-serif"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                color: "var(--pink-500)",
                letterSpacing: "0.04em",
              }}
            >
              02 — Deel
            </div>
            <h2
              className="font-serif m-0 mt-3"
              style={{ fontWeight: 400, fontSize: "26px", lineHeight: 1.1 }}
            >
              Deel jouw plek
            </h2>
            <p
              className="m-0 mt-4"
              style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.6 }}
            >
              We zoeken ook naar jouw liefdesplek in Mechelen — om te genieten, te chillen, te rusten, lief te hebben, geliefd te worden.
            </p>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: "14px",
                color: "var(--muted-foreground, #7A726B)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Deel je favoriete plekje en inspireer andere Mechelaars om die plek ook te ontdekken.
            </p>
            <Link
              to="/mijn-favoriete-plek"
              className="inline-flex items-center justify-center rounded-full transition-colors"
              style={{
                marginTop: "auto",
                height: "52px",
                padding: "0 26px",
                background: "var(--surface)",
                color: "var(--ink)",
                fontSize: "15px",
                fontWeight: 500,
                border: "1px solid var(--line-strong)",
                alignSelf: "flex-start",
              }}
            >
              Deel een plekje →
            </Link>
          </article>
        </div>

        {/* Credits footer */}
        <footer
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          style={{
            marginTop: "56px",
            paddingTop: "40px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--muted-foreground, #7A726B)",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Initiatief
            </div>
            <p className="m-0" style={{ fontSize: "15px", color: "var(--ink-2)" }}>
              Een onafhankelijk gefinancierd project van Mechels fotograaf{" "}
              <a
                href="https://www.stijnswinnen.be"
                target="_blank"
                rel="noopener noreferrer"
                className="over-link"
              >
                Stijn Swinnen
              </a>
              .
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--muted-foreground, #7A726B)",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Volg het project
            </div>
            <p className="m-0" style={{ fontSize: "15px", color: "var(--ink-2)" }}>
              <a
                href="https://www.instagram.com/2800loves"
                target="_blank"
                rel="noopener noreferrer"
                className="over-link"
              >
                Instagram @2800loves
              </a>
            </p>
          </div>
        </footer>

        <style>{`
          .over-link {
            color: var(--ink);
            text-decoration: underline;
            text-decoration-color: var(--pink-300);
            text-underline-offset: 3px;
            transition: text-decoration-color 150ms ease;
          }
          .over-link:hover {
            text-decoration-color: var(--pink-500);
          }
        `}</style>
      </main>
      <HomeFooter />
    </div>
  );
};

export default Over;
