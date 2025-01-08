import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { AdminSidebar } from "./AdminSidebar";
import { DrawingGrid } from "./DrawingGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type DrawingStatus = "new" | "approved";

interface AdminContentProps {
  drawings: Tables<"drawings">[] | null;
}

export const AdminContent = ({ drawings }: AdminContentProps) => {
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus>("new");
  const queryClient = useQueryClient();

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
  );
};