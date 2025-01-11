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
      console.log('Starting approval process for drawing:', drawing.id);
      
      // First update the drawing status
      const { error: updateError } = await supabase
        .from("drawings")
        .update({ status: "approved" })
        .eq("id", drawing.id);

      if (updateError) throw updateError;

      // Then trigger the optimization process
      console.log('Triggering optimization for drawing:', drawing.image_path);
      const { data: optimizationData, error: optimizationError } = await supabase.functions
        .invoke('optimize-heart', {
          body: { imagePath: drawing.image_path }
        });

      if (optimizationError) {
        console.error('Optimization error:', optimizationError);
        toast.error("Drawing approved but optimization failed");
        return;
      }

      console.log('Optimization response:', optimizationData);
      toast.success("Drawing approved and optimized successfully");
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

  // Filter drawings based on selected status
  const filteredDrawings = drawings?.filter(drawing => drawing.status === selectedStatus) || null;

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
            drawings={filteredDrawings}
            selectedStatus={selectedStatus}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        </main>
      </div>
    </div>
  );
};