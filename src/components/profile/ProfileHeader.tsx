import { useSession } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { useApprovedHearts } from "@/hooks/useApprovedHearts";

export const ProfileHeader = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes } = useLocationLikes();
  const approvedHearts = useApprovedHearts();

  const userLocations = locations.filter(
    (location) => location.user_id === session?.user?.id
  );

  const userLikes = locationLikes.filter(
    (like) => like.user_id === session?.user?.id && like.status === "active"
  );

  const userHearts = approvedHearts.filter(
    (heart) => heart.user_id === session?.user?.id
  );

  return (
    <div className="flex items-center justify-between mb-8 p-6 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback>
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welkom!</h1>
          <p className="text-muted-foreground">{session?.user.email}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Harten Gemaakt</p>
          <p className="text-2xl font-bold">{userHearts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Locaties Toegevoegd</p>
          <p className="text-2xl font-bold">{userLocations.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Favoriete Plekken</p>
          <p className="text-2xl font-bold">{userLikes.length}</p>
        </Card>
      </div>
    </div>
  );
};