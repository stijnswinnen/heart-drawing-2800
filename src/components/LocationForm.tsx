import { useState, useEffect } from "react";
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
  const [email, setEmail] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setName(profile.name);
          setEmail(session.user.email || '');
        }
      }
    };

    fetchUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coordinates) {
      toast.error("Selecteer eerst een locatie op de kaart");
      return;
    }

    if (!locationName.trim()) {
      toast.error("Vul een naam in voor de locatie");
      return;
    }

    if (!description.trim()) {
      toast.error("Vul een beschrijving in voor de locatie");
      return;
    }

    if (!name.trim()) {
      toast.error("Vul je naam in");
      return;
    }

    if (!email.trim()) {
      toast.error("Vul je e-mailadres in");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create or update heart_user
      const { data: heartUser, error: heartUserError } = await supabase
        .from("heart_users")
        .upsert({
          email,
          name,
          marketing_consent: false,
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (heartUserError) throw heartUserError;

      // Then create the location
      const { error } = await supabase.from("locations").insert({
        name: locationName,
        description: description.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session?.user?.id || null,
        heart_user_id: heartUser.id,
      });

      if (error) throw error;

      // Send email notification
      const { error: notificationError } = await supabase.functions.invoke('send-location-notification', {
        body: {
          name,
          email,
          locationName,
          description: description.trim(),
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      });

      if (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't throw here as the location was saved successfully
      }

      toast.success("Locatie succesvol toegevoegd!");
      setLocationName("");
      setDescription("");
      setCoordinates(null);
      
      // Only reset name and email if not logged in
      if (!session) {
        setName("");
        setEmail("");
      }
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
            Jouw naam
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vul je naam in"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Jouw e-mailadres
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Vul je e-mailadres in"
            required
          />
        </div>

        <div>
          <label htmlFor="locationName" className="block text-sm font-medium mb-1">
            Naam van de locatie
          </label>
          <Input
            id="locationName"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
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