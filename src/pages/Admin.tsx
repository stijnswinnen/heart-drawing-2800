import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminContent } from "@/components/admin/AdminContent";

const Admin = () => {
  const { session, isLoading: isSessionLoading } = useSessionContext();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate("/auth");
    }
  }, [isSessionLoading, session, navigate]);

  useEffect(() => {
    if (profileQuery.isFetched && profile && profile.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/auth");
    }
  }, [profileQuery.isFetched, profile, navigate]);

  const { data: drawings } = useQuery({
    queryKey: ["drawings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!profile && profile.role === "admin",
  });

  // Wait for auth + profile to settle before deciding what to render
  if (isSessionLoading || !session || profileQuery.isLoading || !profile || profile.role !== "admin") {
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
