import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { useSession } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";

interface Location {
  id: string;
  name: string;
  description: string | null;
  recommendation: string | null;
  heart_users: {
    name: string;
  } | null;
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
          .select(`
            id, 
            name, 
            description, 
            recommendation,
            heart_users (
              name
            )
          `)
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
    <div className="bg-white p-6 space-y-6 w-[40%]">
      <h2 className="text-2xl font-barlow text-primary-dark">{location.name}</h2>
      
      <button
        onClick={() => handleLike(location.id)}
        disabled={!session}
        className={cn(
          "flex items-center gap-2 transition-colors text-primary-dark",
          session ? "hover:text-primary-dark" : "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart className="w-5 h-5" fill={likeCount > 0 ? "currentColor" : "none"} />
        <span>{likeCount}</span>
      </button>
      
      {location.description && (
        <p className="text-muted-foreground font-montserrat">{location.description}</p>
      )}
      
      {location.recommendation && (
        <p className="text-muted-foreground font-montserrat">{location.recommendation}</p>
      )}

      <Separator className="bg-primary-light" />
      
      {location.heart_users?.name && (
        <p className="text-sm text-muted-foreground font-montserrat">
          Gedeeld door {location.heart_users.name}
        </p>
      )}

      <Button asChild>
        <Link to="/mijn-favoriete-plek" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Voeg jouw lievelingsplek toe
        </Link>
      </Button>
    </div>
  );
};