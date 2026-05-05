import { useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { useApprovedHearts } from "@/hooks/useApprovedHearts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cleanupAuthState } from "@/utils/authCleanup";

const pluralise = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const ProfileHeader = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes } = useLocationLikes();
  const approvedHearts = useApprovedHearts();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (session?.user?.email) {
        const { data } = await supabase.rpc("get_profile_minimal_by_email", {
          p_email: session.user.email,
        });
        setProfileId(data?.[0]?.id || null);
      }
    };
    run();
  }, [session?.user?.email]);

  const userId = session?.user?.id;
  const userMeta = session?.user?.user_metadata as { name?: string } | undefined;
  const fullName = userMeta?.name || "";
  const firstName = fullName.trim().split(/\s+/)[0] || "";

  const heartCount = approvedHearts.some(
    (h) =>
      (h.user_id === userId || h.heart_user_id === profileId) &&
      (h.status === "approved" || h.status === "new")
  )
    ? 1
    : 0;

  const sharedCount = locations.filter(
    (l) =>
      (l.user_id === userId || l.heart_user_id === userId) &&
      (l.status === "approved" ||
        l.status === "new" ||
        l.status === "pending_verification")
  ).length;

  const favCount = locationLikes.filter(
    (l) => l.user_id === userId && l.status === "active"
  ).length;

  const handleLogout = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (e: any) {
        if (!e?.message?.includes("session_not_found")) console.error(e);
      }
      toast.success("Je bent succesvol uitgelogd");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch {
      cleanupAuthState();
      window.location.href = "/";
    }
  };

  return (
    <header>
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
        Mijn profiel
      </span>

      <h1
        className="m-0 font-serif font-normal text-ink"
        style={{
          fontSize: "clamp(40px, 5.5vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        {firstName ? `Welkom terug, ${firstName}.` : "Welkom terug."}
      </h1>

      <div
        className="mt-5 flex flex-wrap items-center font-sans"
        style={{ fontSize: 15, color: "var(--ink-muted)", gap: 12 }}
      >
        <span>{session?.user?.email}</span>
        <span
          aria-hidden="true"
          className="rounded-full"
          style={{ width: 3, height: 3, background: "var(--ink-muted)" }}
        />
        <button
          type="button"
          onClick={handleLogout}
          className="profile-logout-link"
          style={{
            color: "var(--ink)",
            textDecoration: "underline",
            textDecorationColor: "var(--pink-300)",
            textUnderlineOffset: "3px",
            background: "none",
            border: 0,
            padding: 0,
          }}
        >
          uitloggen
        </button>
      </div>

      <style>{`.profile-logout-link:hover{text-decoration-color:var(--pink-500) !important;}`}</style>

      <div
        className="mt-8 flex flex-wrap"
        style={{ gap: "48px" }}
      >
        {[
          {
            v: heartCount,
            l: `${heartCount} ${pluralise(heartCount, "hart", "harten")} getekend`,
          },
          {
            v: sharedCount,
            l: `${sharedCount} ${pluralise(sharedCount, "plek", "plekken")} gedeeld`,
          },
          {
            v: favCount,
            l: `${favCount} ${pluralise(favCount, "favoriet", "favorieten")}`,
          },
        ].map((m, i) => (
          <div key={i}>
            <div
              className="font-serif font-normal text-ink"
              style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              {m.v}
            </div>
            <div
              className="font-sans"
              style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}
            >
              {m.l.replace(/^\d+\s/, "")}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
};
