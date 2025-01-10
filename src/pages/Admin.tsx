import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminContent } from "@/components/admin/AdminContent";
import { LocationsList } from "@/components/admin/LocationsList";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { Routes, Route } from "react-router-dom";

const Admin = () => {
  const session = useSession();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        navigate("/");
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
    queryKey: ["admin-drawings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role === "admin",
  });

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  useEffect(() => {
    if (profile && profile.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [profile, navigate]);

  if (!session || !profile || profile.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminContent drawings={drawings} />} />
        <Route path="/locations" element={<LocationsList />} />
        <Route path="/stats" element={<StatsOverview />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;