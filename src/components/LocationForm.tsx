import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LocationMap from "./LocationMap";

export const LocationForm = () => {
  const session = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coordinates) {
      toast.error("Selecteer eerst een locatie op de kaart");
      return;
    }

    if (!name.trim()) {
      toast.error("Vul een naam in voor de locatie");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("locations").insert({
        name,
        description: description.trim() || null,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session?.user?.id || null,
      });

      if (error) throw error;

      toast.success("Locatie succesvol toegevoegd!");
      setName("");
      setDescription("");
      setCoordinates(null);
    } catch (error: any) {
      console.error("Error submitting location:", error);
      toast.error("Er ging iets mis bij het toevoegen van de locatie");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LocationMap
        onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })}
      />
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Naam van de locatie
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Geef deze plek een naam"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Beschrijving (optioneel)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Waarom is dit jouw favoriete plek?"
            rows={4}
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !coordinates}>
          {isSubmitting ? "Bezig met versturen..." : "Verstuur locatie"}
        </Button>
      </div>
    </form>
  );
};