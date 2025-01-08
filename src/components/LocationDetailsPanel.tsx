import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { useSession } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";

interface Location {
  id: string;
  name: string;
  description: string | null;
  recommendation: string | null;
}

interface LocationDetailsPanelProps {
  locationId: string | null;
  onClose: () => void;
}

export const LocationDetailsPanel = ({ locationId, onClose }: LocationDetailsPanelProps) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { locationLikes, handleLike } = useLocationLikes();
  const session = useSession();

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!locationId) {
        setLocation(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, description, recommendation')
          .eq('id', locationId)
          .single();

        if (error) throw error;
        setLocation(data);
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [locationId]);

  if (!locationId) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
        Selecteer een locatie op de kaart om meer details te zien
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Heart className="w-12 h-12 text-primary-dark animate-pulse" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
        Deze locatie kon niet worden geladen
      </div>
    );
  }

  const likeCount = locationLikes[location.id] || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-semibold">{location.name}</h2>
      
      {location.description && (
        <div>
          <h3 className="font-medium mb-2">Waarom is dit een lievelingsplek?</h3>
          <p className="text-muted-foreground">{location.description}</p>
        </div>
      )}
      
      {location.recommendation && (
        <div>
          <h3 className="font-medium mb-2">Waarom moet je hier naartoe?</h3>
          <p className="text-muted-foreground">{location.recommendation}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleLike(location.id)}
          disabled={!session}
          className={cn(
            "flex items-center gap-2 transition-colors",
            session ? "hover:text-primary-dark" : "opacity-50 cursor-not-allowed",
            likeCount > 0 ? "text-primary-dark" : "text-muted-foreground"
          )}
        >
          <Heart className="w-5 h-5" fill={likeCount > 0 ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
};