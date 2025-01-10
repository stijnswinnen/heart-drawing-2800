import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Profile {
  name: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  recommendation: string;
  profile: Profile | null;
}

interface LocationDetailsPanelProps {
  locationId: string | null;
  onClose: () => void;
}

export const LocationDetailsPanel = ({ locationId, onClose }: LocationDetailsPanelProps) => {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) return;

      try {
        const { data, error } = await supabase
          .from('locations')
          .select(`
            id, 
            name, 
            description, 
            recommendation,
            profiles!locations_heart_user_id_fkey (
              name
            )
          `)
          .eq('id', locationId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching location:', error);
          toast.error("Er ging iets mis bij het ophalen van de locatie");
          return;
        }

        if (!data) {
          console.error('No location found with id:', locationId);
          toast.error("Locatie niet gevonden");
          return;
        }

        const locationData: Location = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          recommendation: data.recommendation || '',
          profile: data.profiles ? { name: data.profiles.name } : null
        };

        setLocation(locationData);
      } catch (error) {
        console.error('Error fetching location:', error);
        toast.error("Er ging iets mis bij het ophalen van de locatie");
      }
    };

    fetchLocation();
  }, [locationId]);

  if (!location) return null;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{location.name}</h2>
      <p className="mt-2">{location.description}</p>
      <p className="mt-2"><strong>Aanbeveling:</strong> {location.recommendation}</p>
      <p className="mt-2"><strong>Profiel:</strong> {location.profile?.name || 'Anoniem'}</p>
      <Button onClick={onClose} className="mt-4">Sluiten</Button>
    </div>
  );
};