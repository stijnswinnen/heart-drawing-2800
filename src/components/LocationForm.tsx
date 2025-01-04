import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LocationMap from "./LocationMap";
import { useNavigate } from "react-router-dom";

export const LocationForm = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!session?.user?.id) {
      toast.error("Je moet ingelogd zijn om een locatie toe te voegen");
      navigate("/");
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        setName(profile.name);
        setEmail(session.user.email || "");
      }
    };

    fetchUserProfile();
  }, [session, navigate]);

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

    if (!description.trim()) {
      toast.error("Vul een beschrijving in voor de locatie");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Je moet ingelogd zijn om een locatie toe te voegen");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("locations").insert({
        name,
        description: description.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session.user.id,
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
          <label htmlFor="userName" className="block text-sm font-medium mb-1">
            Jouw naam
          </label>
          <Input
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jouw naam"
            required
            disabled
          />
        </div>

        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium mb-1">
            Jouw e-mail adres
          </label>
          <Input
            id="userEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Jouw e-mail adres"
            required
            disabled
          />
        </div>

        <div>
          <label htmlFor="locationName" className="block text-sm font-medium mb-1">
            Naam van de locatie
          </label>
          <Input
            id="locationName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Geef deze plek een naam"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Beschrijving
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Waarom is dit jouw favoriete plek?"
            rows={4}
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !coordinates}>
          {isSubmitting ? "Bezig met versturen..." : "Verstuur locatie"}
        </Button>
      </div>
    </form>
  );
};