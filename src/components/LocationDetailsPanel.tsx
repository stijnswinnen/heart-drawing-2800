import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Share2 } from "lucide-react";
import { useLocation } from "react-router-dom";

type Profile = { id: string; name: string; };

interface LocationDetailsPanelProps {
  location: {
    id: string;
    name: string;
    description: string | null;
    heart_user_id: string | null;
    recommendation: string | null;
  };
  onClose: () => void;
}

export const LocationDetailsPanel = ({ location, onClose }: LocationDetailsPanelProps) => {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentLocation = useLocation();

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

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-5xl font-semibold uppercase leading-[60px]">{location.name}</h2>
        {!isLoading && profile && (
          <p className="text-sm text-gray-600 uppercase">Gedeeld door {profile.name}</p>
        )}
      </div>

      {location.description && (
        <p className="text-gray-700">{location.description}</p>
      )}

      {location.recommendation && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Waarom moet je deze plek zeker bezoeken?</h3>
          <p className="text-gray-700">{location.recommendation}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-end gap-2">
        <Button onClick={handleShare} variant="outline" className="w-full md:w-auto">
          <Share2 className="w-4 h-4 mr-2" />
          Deel deze locatie
        </Button>
        <Button onClick={handleLike} variant="default" className="w-full md:w-auto">
          Voeg toe aan favorieten
        </Button>
      </div>
    </div>
  );
};