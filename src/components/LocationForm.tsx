import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationMapSection } from "./LocationMapSection";
import { UserInfoSection } from "./UserInfoSection";
import { LocationDetailsSection } from "./LocationDetailsSection";

export const LocationForm = () => {
  const session = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [shareConsent, setShareConsent] = useState(false);
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

    if (!recommendation.trim()) {
      toast.error("Vul een aanbeveling in voor andere Mechelaars");
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

      const { error } = await supabase.from("locations").insert({
        name: locationName,
        description: description.trim(),
        recommendation: recommendation.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session?.user?.id || null,
        heart_user_id: heartUser.id,
        share_consent: shareConsent,
      });

      if (error) throw error;

      const { error: notificationError } = await supabase.functions.invoke('send-location-notification', {
        body: {
          name,
          email,
          locationName,
          description: description.trim(),
          recommendation: recommendation.trim(),
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      });

      if (notificationError) {
        console.error("Error sending notification:", notificationError);
      }

      toast.success("Locatie succesvol toegevoegd!");
      setLocationName("");
      setDescription("");
      setRecommendation("");
      setCoordinates(null);
      setShareConsent(false);
      
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
      <LocationMapSection onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
      
      <UserInfoSection
        name={name}
        email={email}
        onNameChange={setName}
        onEmailChange={setEmail}
      />

      <LocationDetailsSection
        locationName={locationName}
        description={description}
        recommendation={recommendation}
        shareConsent={shareConsent}
        onLocationNameChange={setLocationName}
        onDescriptionChange={setDescription}
        onRecommendationChange={setRecommendation}
        onShareConsentChange={setShareConsent}
      />

      <Button type="submit" disabled={isSubmitting || !coordinates}>
        {isSubmitting ? "Bezig met versturen..." : "Deel jouw favoriete plaats"}
      </Button>
    </form>
  );
};