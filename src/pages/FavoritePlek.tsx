import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { LocationForm } from "@/components/LocationForm";
import { Seo } from "@/components/Seo";

const FavoritePlek = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Seo
        title="Deel jouw favoriete plek in Mechelen · 2800.love"
        description="Welke plek in Mechelen doet jouw hart sneller kloppen? Deel jouw favoriete plek en maak kans op een gratis mini-fotoreportage op locatie."
        path="/mijn-favoriete-plek"
      />
      <Navigation />
      <main className="mx-auto w-full max-w-[760px] px-7 pt-14 pb-24">
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
          Deel jouw plekje
        </span>

        {/* Heading */}
        <h1
          className="m-0 font-serif font-normal text-ink"
          style={{
            fontSize: "clamp(40px, 5.5vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Welke plek in Mechelen<br className="hidden md:inline" />{" "}
          doet jouw hart sneller kloppen?
        </h1>

        {/* Lead */}
        <p
          className="font-sans"
          style={{
            marginTop: 24,
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--ink-2)",
            maxWidth: "60ch",
          }}
        >
          Mechelen is een stad vol verborgen pareltjes. Een romantisch bankje aan
          de Dijle, een gezellig terrasje op de Grote Markt, of misschien een
          geheime stek in het Vrijbroekpark — vertel het ons.
        </p>

        {/* Callout */}
        <aside
          style={{
            margin: "56px 0",
            borderLeft: "3px solid var(--pink-500)",
            background: "var(--pink-50)",
            padding: "26px 30px 28px",
            borderRadius: "0 14px 14px 0",
          }}
        >
          <div
            className="font-sans"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--pink-600)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Wist je dat…
          </div>
          <p
            className="font-sans m-0"
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--ink-2)",
              maxWidth: "56ch",
            }}
          >
            Jouw verhaal verdient een podium. Deel je favoriete plek en maak
            kans op een exclusieve mini-fotoreportage op locatie — helemaal
            gratis.
          </p>
          <p
            className="font-sans m-0"
            style={{
              fontSize: 13,
              color: "var(--muted)",
              marginTop: 10,
            }}
          >
            Het aantal plaatsen is beperkt.
          </p>
        </aside>

        {/* Photographer note */}
        <div
          className="font-sans"
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink-2)",
            maxWidth: "60ch",
          }}
        >
          <p style={{ marginTop: 0 }}>
            Als fotograaf kom ik op diverse plekken in Mechelen en ontmoet ik
            vele mensen. Een vraag die ik telkens graag stel is wat hun
            favoriete plek is in of rond de stad. Een plaats waar men graag
            komt of waar een verhaal aan verbonden is. Indien haalbaar plannen
            we dan ook een fotosessie op die plaats.
          </p>
          <p>
            Graag verzamel ik hier al deze fijne plaatsen om ook anderen te
            inspireren en deze verhalen te kunnen delen.
          </p>
          <p
            className="font-serif italic"
            style={{
              marginTop: 8,
              fontSize: 17,
              color: "var(--muted)",
              fontWeight: 400,
            }}
          >
            — Stijn
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            marginTop: 64,
            paddingTop: 56,
            borderTop: "1px solid var(--line)",
          }}
        >
          <LocationForm />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
};

export default FavoritePlek;
