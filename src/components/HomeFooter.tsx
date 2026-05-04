import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const HomeFooter = () => {
  const [hearts, setHearts] = useState<number | null>(null);
  const [locs, setLocs] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [h, l] = await Promise.all([
        supabase.from("drawings").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("locations").select("*", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      setHearts(h.count ?? 0);
      setLocs(l.count ?? 0);
    };
    load();
  }, []);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(251,250,247,0.85)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
        borderTop: "1px solid var(--line)",
        padding: "28px",
      }}
    >
      <div
        className="max-w-[1200px] mx-auto flex items-center justify-between gap-6 font-sans"
        style={{ color: "var(--ink-muted)", fontSize: 13 }}
      >
        <div className="flex gap-6">
          <span>
            <strong className="font-semibold" style={{ color: "var(--ink)" }}>
              {hearts ?? "—"}
            </strong>{" "}
            hartjes getekend
          </span>
          <span>
            <strong className="font-semibold" style={{ color: "var(--ink)" }}>
              {locs ?? "—"}
            </strong>{" "}
            plekjes gedeeld
          </span>
        </div>
        <Link
          to="/privacy"
          className="transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          Privacy Policy →
        </Link>
      </div>
    </footer>
  );
};
