import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DrawingGrid } from "./DrawingGrid";

export const ApprovedHeartsContent = () => {
  const { data: drawings } = useQuery({
    queryKey: ["admin-approved-drawings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <main className="flex-1">
          <DrawingGrid
            drawings={drawings}
            selectedStatus="approved"
            onApprove={async () => {}}
            onDecline={async () => {}}
          />
        </main>
      </div>
    </div>
  );
};