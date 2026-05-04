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
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-7 py-4 flex items-center justify-between gap-6 text-[13px] text-muted-foreground font-['Inter']">
        <div className="flex gap-6">
          <span>
            <strong className="text-foreground font-semibold">{hearts ?? "—"}</strong> hartjes getekend
          </span>
          <span>
            <strong className="text-foreground font-semibold">{locs ?? "—"}</strong> plekjes gedeeld
          </span>
        </div>
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy Policy →
        </Link>
      </div>
    </footer>
  );
};
