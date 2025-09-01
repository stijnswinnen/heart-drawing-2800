import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LocationMapSection } from "./LocationMapSection";
import { UserInfoSection } from "./UserInfoSection";
import { LocationDetailsSection } from "./LocationDetailsSection";

interface LocationFormProps {
  fullWidthMap?: boolean;
}

export const LocationForm = ({ fullWidthMap = false }: LocationFormProps) => {
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
          .select('name, email')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setName(profile.name || '');
          setEmail(profile.email || '');
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
      let profileId: string;
      let isEmailVerified = false;
      let needsVerification = false;

      if (session?.user?.id) {
        // User is logged in - use their session
        profileId = session.user.id;
        
        // Check if their email is verified
        const { data: sessionProfile } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('id', session.user.id)
          .single();
        
        isEmailVerified = sessionProfile?.email_verified || false;
        if (!isEmailVerified) {
          needsVerification = true;
        }
      } else {
        // User not logged in - check for existing profile or create new user
        const { data: existingProfile, error: profileError } = await supabase
          .rpc('get_profile_minimal_by_email', { p_email: email });

        if (profileError) {
          console.error("Error checking profile:", profileError);
          toast.error("Er ging iets mis bij het controleren van je profiel");
          setIsSubmitting(false);
          return;
        }

        if (existingProfile?.[0]) {
          // Profile exists
          profileId = existingProfile[0].id;
          isEmailVerified = existingProfile[0].email_verified || false;
          if (!isEmailVerified) {
            needsVerification = true;
          }
        } else {
          // No profile exists - create new user
          const randomPassword = crypto.randomUUID();
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: randomPassword,
            options: {
              data: {
                name: name.trim()
              }
            }
          });

          if (signUpError) {
            console.error("Error creating user:", signUpError);
            toast.error("Er ging iets mis bij het aanmaken van je profiel");
            setIsSubmitting(false);
            return;
          }

          if (!authData.user?.id) {
            toast.error("Er ging iets mis bij het aanmaken van je profiel");
            setIsSubmitting(false);
            return;
          }

          profileId = authData.user.id;
          needsVerification = true;
        }
      }

      // Send verification email if needed
      if (needsVerification) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: { email }
          });
          
          if (emailError) {
            console.error("Error sending verification email:", emailError);
            // Don't block submission if email fails
          }
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
          // Don't block submission if email fails
        }
      }

      // Insert location with appropriate status
      const locationStatus = isEmailVerified ? 'new' : 'pending_verification';
      
      const { error } = await supabase.from("locations").insert({
        name: locationName,
        description: description.trim(),
        recommendation: recommendation.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session?.user?.id || null,
        heart_user_id: profileId,
        share_consent: shareConsent,
        status: locationStatus,
      });

      if (error) throw error;

      // Show appropriate success message
      if (isEmailVerified) {
        toast.success("Locatie succesvol toegevoegd!");
      } else {
        toast.success("Verificatie e-mail verzonden. Je locatie staat in de wacht tot je e-mailadres is bevestigd.");
      }

      // Reset form
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

  if (fullWidthMap) {
    return (
      <>
        {/* Full-width map section */}
        <div className="w-full">
          <LocationMapSection onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
        </div>
        
        {/* Form fields in container */}
        <div className="container max-w-4xl mx-auto px-4 py-8 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
        </div>
      </>
    );
  }

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