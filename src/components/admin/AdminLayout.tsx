import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [selectedStatus, setSelectedStatus] = useState<"new" | "approved">("new");

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
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          drawings={drawings}
        />
        <main className="flex-1 p-8 bg-zinc-50">{children}</main>
      </div>
    </SidebarProvider>
  );
};