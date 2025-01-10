import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminContent } from "@/components/admin/AdminContent";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLocationsContent } from "@/components/admin/AdminLocationsContent";
import { Routes, Route } from "react-router-dom";

const Admin = () => {
  const session = useSession();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminSidebar selectedStatus="new" setSelectedStatus={() => {}} drawings={[]} />
          <main className="flex-1">
            <Routes>
              <Route index element={<AdminContent drawings={[]} />} />
              <Route path="locations" element={<AdminLocationsContent />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;