import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

interface LocationHeroProps {
  imageUrl: string;
  name: string;
  category?: string | null;
  summary?: string | null;
  credit?: string | null;
}

const MORPH_RANGE = 320;
const NAV_RANGE = 140;
const SMOOTH = 0.12;
const END_SIDE = 28;
const END_TOP = 80;
const END_SHRINK = 128;
const END_RADIUS = 28;

const easeOut = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1);
  return 1 - Math.pow(1 - c, 3);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const LocationHero = ({
  imageUrl,
  name,
  category,
  summary,
  credit,
}: LocationHeroProps) => {
  const figRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let scrollY = 0;
    let morphSmooth = 0;
    let navSmooth = 0;
    let rafId: number | null = null;

    const apply = (t: number, navT: number) => {
      const fig = figRef.current;
      const img = imgRef.current;
      const hint = hintRef.current;
      if (!fig || !img) return;

      const side = lerp(0, END_SIDE, t);
      const top = lerp(0, END_TOP, t);
      const shrink = lerp(0, END_SHRINK, t);
      const radius = lerp(0, END_RADIUS, t);
      const scale = lerp(1, 1.04, t);
      const sa1 = lerp(0, 0.06, t);
      const sa2 = lerp(0, 0.18, t);

      fig.style.top = `${top}px`;
      fig.style.width = `calc(100% - ${side * 2}px)`;
      fig.style.marginLeft = `${side}px`;
      fig.style.borderRadius = `${radius}px`;
      fig.style.height = `calc(100svh - ${shrink}px)`;
      fig.style.boxShadow =
        t > 0.02
          ? `0 2px 8px rgba(20,16,12,${sa1}), 0 32px 64px -16px rgba(20,16,12,${sa2})`
          : "none";
      img.style.transform = `scale(${scale})`;

      if (hint) hint.style.opacity = String(Math.max(0, 1 - scrollY / 80));

      // Broadcast nav state for Navigation component
      window.dispatchEvent(
        new CustomEvent("hero-nav-state", {
          detail: { navT, scrollY },
        })
      );
    };

    const tick = () => {
      const rawMorph = easeOut(scrollY / MORPH_RANGE);
      const rawNav = Math.min(scrollY / NAV_RANGE, 1);
      morphSmooth += (rawMorph - morphSmooth) * SMOOTH;
      navSmooth += (rawNav - navSmooth) * SMOOTH;
      apply(morphSmooth, navSmooth);

      const still =
        Math.abs(rawMorph - morphSmooth) < 0.0005 &&
        Math.abs(rawNav - navSmooth) < 0.0005;
      if (!still) {
        rafId = requestAnimationFrame(tick);
      } else {
        apply(rawMorph, rawNav);
        rafId = null;
      }
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      // Reset nav state when unmounting
      window.dispatchEvent(
        new CustomEvent("hero-nav-state", { detail: { navT: 1, scrollY: 999 } })
      );
    };
  }, [imageUrl]);

  return (
    <div className="relative w-full" style={{ height: "100svh" }}>
      <figure
        ref={figRef}
        className="overflow-hidden"
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100svh",
          margin: 0,
          background: "#1a1612",
          borderRadius: 0,
          willChange: "width, height, margin-left, border-radius, top",
          transition: "box-shadow .4s ease",
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={name}
          className="block w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center 40%",
            willChange: "transform",
          }}
        />
        {/* gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,10,8,.38) 0%, rgba(15,10,8,0) 40%, rgba(15,10,8,0) 50%, rgba(15,10,8,.70) 100%)",
          }}
        />

        {/* text */}
        <div
          className="absolute inset-0 flex flex-col justify-end pointer-events-none"
          style={{ padding: "0 clamp(24px,6vw,56px) clamp(28px,5vw,56px)" }}
        >
          {category && (
            <span
              className="inline-flex items-center gap-1.5 self-start uppercase font-medium"
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,.18)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.25)",
                fontSize: 12,
                letterSpacing: ".05em",
                color: "rgba(255,255,255,.92)",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#6fcf72",
                  display: "inline-block",
                }}
              />
              {category}
            </span>
          )}
          <h1
            className="font-fraunces"
            style={{
              fontWeight: 300,
              fontSize: "clamp(60px, 10vw, 130px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
              margin: "0 0 20px",
              color: "#fff",
              textShadow: "0 2px 32px rgba(0,0,0,.35)",
            }}
          >
            {name}
          </h1>
          {summary && (
            <p
              style={{
                fontSize: "clamp(15px, 1.4vw, 18px)",
                color: "rgba(255,255,255,.82)",
                maxWidth: "56ch",
                lineHeight: 1.55,
                margin: 0,
                textShadow: "0 1px 12px rgba(0,0,0,.3)",
              }}
            >
              {summary}
            </p>
          )}
        </div>

        <a
          href="https://www.stijnswinnen.be/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute italic hover:text-white transition-colors"
          style={{
            bottom: 20,
            right: 24,
            fontSize: 12,
            color: "rgba(255,255,255,.6)",
          }}
        >
          Foto · Stijn Swinnen
        </a>

        {/* scroll hint */}
        <div
          ref={hintRef}
          className="absolute flex flex-col items-center gap-2 pointer-events-none"
          style={{
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,.55)",
            fontSize: 11,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            transition: "opacity .3s ease",
            animation: "hero-hint-bounce 2s ease-in-out infinite",
          }}
        >
          <span>Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </figure>
      <style>{`
        @keyframes hero-hint-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
};
