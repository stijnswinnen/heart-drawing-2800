import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { HeartSection } from "@/components/profile/HeartSection";
import { LocationsSection } from "@/components/profile/LocationsSection";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { Seo } from "@/components/Seo";
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
    <>
      <Seo
        title="Mijn profiel · 2800.love"
        description="Beheer jouw hart, gedeelde plekken en favorieten op 2800.love."
        path="/profile"
        noindex
      />
      <Navigation />
      <main className="min-h-screen bg-bg">
        <div className="mx-auto w-full max-w-[1200px] px-7 pt-14 pb-24">
          <ProfileHeader />
          <div
            className="profile-grid"
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "minmax(0, 280px) 1fr",
              gap: 56,
              alignItems: "start",
            }}
          >
            <HeartSection />
            <LocationsSection />
          </div>
          <PersonalInfoSection />
          <style>{`
            @media (max-width: 880px) {
              .profile-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
            }
          `}</style>
        </div>
      </main>
      <HomeFooter />
    </>
  );
};

export default Profile;