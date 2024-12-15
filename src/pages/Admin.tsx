import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DrawingGrid } from "@/components/admin/DrawingGrid";

type DrawingStatus = "new" | "approved";

const Admin = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus>("new");
  const queryClient = useQueryClient();

  // Handle logout
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

  // Only fetch profile if we have a session
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        navigate('/');
        return null;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id, // Only run query if we have a user ID
  });

  const { data: drawings } = useQuery({
    queryKey: ["drawings", selectedStatus],
    queryFn: async () => {
      const { data } = await supabase
        .from("drawings")
        .select("*")
        .eq("status", selectedStatus)
        .order("created_at", { ascending: false });
      return data as Tables<"drawings">[] | null;
    },
  });

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  // Add a separate effect for profile role check
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [profile, navigate]);

  // Don't render anything until we have confirmed the user is an admin
  if (!session || !profile || profile.role !== "admin") {
    return null;
  }

  const handleApprove = async (drawing: Tables<"drawings">) => {
    try {
      const { error } = await supabase
        .from("drawings")
        .update({ status: "approved" })
        .eq("id", drawing.id);

      if (error) throw error;

      toast.success("Drawing approved successfully");
      queryClient.invalidateQueries({ queryKey: ["drawings"] });
    } catch (error) {
      console.error("Error approving drawing:", error);
      toast.error("Failed to approve drawing");
    }
  };

  const handleDecline = async (drawing: Tables<"drawings">) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("hearts")
        .remove([drawing.image_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("drawings")
        .delete()
        .eq("id", drawing.id);

      if (dbError) throw dbError;

      toast.success("Drawing declined and removed");
      queryClient.invalidateQueries({ queryKey: ["drawings"] });
    } catch (error) {
      console.error("Error declining drawing:", error);
      toast.error("Failed to decline drawing");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">2800</span>
            <Heart className="text-red-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">{profile.name}</div>
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
              <AvatarFallback>
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminSidebar
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            drawings={drawings}
          />
          <main className="flex-1">
            <DrawingGrid
              drawings={drawings}
              selectedStatus={selectedStatus}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;