import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminContent } from "@/components/admin/AdminContent";

const Admin = () => {
  const session = useSession();
  const navigate = useNavigate();

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
    enabled: !!session?.user?.id,
  });

  const { data: drawings } = useQuery({
    queryKey: ["drawings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false });
      return data;
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

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <AdminContent drawings={drawings} />
    </div>
  );
};

export default Admin;