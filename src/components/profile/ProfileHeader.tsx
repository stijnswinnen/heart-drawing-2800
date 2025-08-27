import { useSession } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";

export const ProfileHeader = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes } = useLocationLikes();

  const userLocations = locations.filter(
    (location) => location.user_id === session?.user?.id
  );

  const userLikes = locationLikes.filter(
    (like) => like.user_id === session?.user?.id && like.status === "active"
  );

  return (
    <div className="rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl p-8 border border-primary/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold font-montserrat bg-gradient-to-r from-primary-dark to-secondary bg-clip-text text-transparent">
              Welkom!
            </h1>
            <p className="text-muted-foreground mt-1">{session?.user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Card className="p-4 bg-white/50 backdrop-blur transition-all duration-300 hover:scale-105">
            <p className="text-sm text-muted-foreground">Locaties Toegevoegd</p>
            <p className="text-2xl font-bold text-primary-dark">{userLocations.length}</p>
          </Card>
          <Card className="p-4 bg-white/50 backdrop-blur transition-all duration-300 hover:scale-105">
            <p className="text-sm text-muted-foreground">Favoriete Plekken</p>
            <p className="text-2xl font-bold text-primary-dark">{userLikes.length}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};