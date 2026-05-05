import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Heart, Share2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Profile = { id: string; name: string; };

interface LocationDetailsPanelProps {
  location: {
    id: string;
    name: string;
    description: string | null;
    heart_user_id: string | null;
    recommendation: string | null;
    image_path?: string | null;
    category?: string | null;
  };
  onClose: () => void;
}

export const LocationDetailsPanel = ({ location, onClose }: LocationDetailsPanelProps) => {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentLocation = useLocation();

  // Fetch category data to get the color
  const { data: categoryData } = useQuery({
    queryKey: ["category", location.category],
    queryFn: async () => {
      if (!location.category) return null;
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("name", location.category)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!location.category,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (location.heart_user_id) {
        try {
          const { data, error } = await supabase
            .rpc('get_public_profile', { p_id: location.heart_user_id });

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          setProfile(data?.[0] || null);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [location.heart_user_id]);

  const handleLike = async () => {
    if (!session) {
      toast.error("Je moet ingelogd zijn om een locatie leuk te vinden");
      return;
    }

    try {
      const { error } = await supabase
        .from('location_likes')
        .insert({
          location_id: location.id,
          user_id: session.user.id,
          heart_user_id: location.heart_user_id,
        });

      if (error) throw error;
      toast.success("Locatie toegevoegd aan favorieten");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Er ging iets mis bij het toevoegen aan favorieten");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/locaties?location=${location.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link gekopieerd naar klembord");
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error("Kon de link niet kopiëren");
    }
  };

  // Category color mapping per design spec
  const cat = location.category?.toLowerCase() || "";
  const categoryStyles =
    cat === "natuur"
      ? { bg: "var(--green-50)", color: "var(--green-700)" }
      : cat === "horeca"
      ? { bg: "var(--pink-50)", color: "var(--pink-600)" }
      : { bg: "var(--line)", color: "var(--ink-muted)" };

  const metaCells: { label: string; value: string }[] = [];
  if (!isLoading && profile?.name) {
    metaCells.push({ label: "Gedeeld door", value: profile.name });
  }
  if (location.category) {
    metaCells.push({ label: "Categorie", value: location.category });
  }

  return (
    <div>
      {location.category && (
        <span
          className="inline-block uppercase text-[12px] font-medium tracking-wide rounded-full"
          style={{
            backgroundColor: categoryStyles.bg,
            color: categoryStyles.color,
            padding: "5px 11px",
          }}
        >
          {location.category}
        </span>
      )}

      <h1
        className="font-fraunces font-normal text-ink"
        style={{
          fontSize: "clamp(44px, 6vw, 72px)",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          marginTop: "18px",
          marginBottom: "32px",
        }}
      >
        {location.name}
      </h1>

      {location.image_path && (
        <div className="mb-6">
          <img
            src={location.image_path}
            alt={location.name}
            className="w-full h-auto rounded-[14px] object-cover"
          />
        </div>
      )}

      {location.description && (
        <p
          className="text-ink-2"
          style={{ fontSize: "16.5px", lineHeight: 1.7, maxWidth: "56ch", marginBottom: "18px" }}
        >
          {location.description}
        </p>
      )}

      {location.recommendation && (
        <>
          <h3
            className="font-semibold text-ink-muted uppercase"
            style={{
              fontSize: "13px",
              letterSpacing: "0.08em",
              marginTop: "44px",
              marginBottom: "16px",
            }}
          >
            Waarom moet je deze plek zeker bezoeken?
          </h3>
          <p
            className="text-ink-2"
            style={{ fontSize: "16.5px", lineHeight: 1.7, maxWidth: "56ch", marginBottom: "18px" }}
          >
            {location.recommendation}
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-3" style={{ marginTop: "40px" }}>
        <button
          onClick={handleLike}
          className="inline-flex items-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
          style={{ height: "44px", padding: "0 22px", fontSize: "14px", fontWeight: 500, gap: "16px" }}
        >
          <Heart className="w-4 h-4" fill="currentColor" />
          Voeg toe aan favorieten
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center rounded-full bg-white border border-line-strong text-ink hover:bg-pink-50 transition-colors"
          style={{ height: "44px", padding: "0 22px", fontSize: "14px", fontWeight: 500, gap: "16px" }}
        >
          <Share2 className="w-4 h-4" />
          Deel deze plek
        </button>
      </div>

      {metaCells.length > 0 && (
        <div
          className="grid grid-cols-2 border-t border-line"
          style={{ marginTop: "40px", paddingTop: "28px", rowGap: "18px", columnGap: "32px" }}
        >
          {metaCells.map((cell) => (
            <div key={cell.label}>
              <div className="text-ink-muted" style={{ fontSize: "13px" }}>{cell.label}</div>
              <div className="text-ink" style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};