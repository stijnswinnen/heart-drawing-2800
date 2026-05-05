import { useSession } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApprovedHearts } from "@/hooks/useApprovedHearts";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

export const HeartSection = () => {
  const session = useSession();
  const approvedHearts = useApprovedHearts();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [heartUrl, setHeartUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (session?.user?.email) {
        const { data } = await supabase.rpc("get_profile_minimal_by_email", {
          p_email: session.user.email,
        });
        setProfileId(data?.[0]?.id || null);
      }
    };
    fetch();
  }, [session?.user?.email]);

  const ownHeart = approvedHearts.find(
    (h) =>
      (h.user_id === session?.user?.id || h.heart_user_id === profileId) &&
      (h.status === "approved" || h.status === "new")
  );

  useEffect(() => {
    if (ownHeart?.image_path) {
      const { data } = supabase.storage
        .from("hearts")
        .getPublicUrl(ownHeart.image_path);
      setHeartUrl(data?.publicUrl || null);
    } else {
      setHeartUrl(null);
    }
  }, [ownHeart?.image_path]);

  return (
    <aside className="profile-heart-col">
      <div
        className="font-sans uppercase"
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".08em",
          color: "var(--ink-muted)",
          marginBottom: 14,
        }}
      >
        Jouw hart
      </div>

      <div
        className="flex items-center justify-center"
        style={{
          aspectRatio: "1 / 1",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: 28,
        }}
      >
        {heartUrl ? (
          <img
            src={heartUrl}
            alt="Jouw hart"
            style={{ maxWidth: 180, width: "100%", height: "auto" }}
          />
        ) : (
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <Heart
              strokeWidth={1.25}
              style={{ width: 96, height: 96, color: "var(--line-strong)" }}
            />
            <Link
              to="/"
              className="font-sans"
              style={{
                fontSize: 14,
                color: "var(--ink)",
                textDecoration: "underline",
                textDecorationColor: "var(--pink-300)",
                textUnderlineOffset: 3,
              }}
            >
              Teken jouw hart →
            </Link>
          </div>
        )}
      </div>

      <p
        className="font-sans"
        style={{
          marginTop: 18,
          fontSize: 13,
          color: "var(--ink-muted)",
          lineHeight: 1.55,
        }}
      >
        Jouw hart maakt deel uit van het 2800.love-logo. Bedankt om mee te
        bouwen.
      </p>

      {heartUrl && (
        <Link
          to="/"
          className="font-sans inline-block"
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "var(--ink)",
            textDecoration: "underline",
            textDecorationColor: "var(--pink-300)",
            textUnderlineOffset: 3,
          }}
        >
          Teken opnieuw →
        </Link>
      )}

      <style>{`
        @media (min-width: 880px) {
          .profile-heart-col { position: sticky; top: 88px; }
        }
      `}</style>
    </aside>
  );
};
