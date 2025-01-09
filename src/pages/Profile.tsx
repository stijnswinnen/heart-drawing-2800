import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { HeartSection } from "@/components/profile/HeartSection";
import { LocationsSection } from "@/components/profile/LocationsSection";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { useEffect, useState } from "react";

const Profile = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking auth status:', error);
          setAuthenticated(false);
        } else {
          setAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <ProfileHeader />
      <HeartSection />
      <LocationsSection />
      <PersonalInfoSection />
    </div>
  );
};

export default Profile;