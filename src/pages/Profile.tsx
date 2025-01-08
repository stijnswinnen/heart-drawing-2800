import { useSession } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { HeartSection } from "@/components/profile/HeartSection";
import { LocationsSection } from "@/components/profile/LocationsSection";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";

const Profile = () => {
  const session = useSession();

  if (!session) {
    return <Navigate to="/" />;
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