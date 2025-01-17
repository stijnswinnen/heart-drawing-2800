import { useSession } from "@supabase/auth-helpers-react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AdminHeader = () => {
  const session = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  if (!session) return null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">2800</span>
          <Heart className="text-red-500" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-medium">{session.user.email}</div>
            <div className="text-sm text-muted-foreground">
              Admin{" "}
              <span className="text-muted-foreground">|</span>{" "}
              <button 
                onClick={handleLogout}
                className="text-blue-600 hover:underline ml-2"
              >
                Logout
              </button>
            </div>
          </div>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};