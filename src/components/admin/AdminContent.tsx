import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { AdminSidebar } from "./AdminSidebar";
import { DrawingGrid } from "./DrawingGrid";
import { LocationsGrid } from "./LocationsGrid";
import { VideoGrid } from "./VideoGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type DrawingStatus = "new" | "approved";
type AdminSection = "hearts" | "locations" | "videos";

interface AdminContentProps {
  drawings: Tables<"drawings">[] | null;
}

export const AdminContent = ({ drawings }: AdminContentProps) => {
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus>("new");
  const [selectedSection, setSelectedSection] = useState<AdminSection>("hearts");
  const queryClient = useQueryClient();

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });
      return data;
    },
  });

  const handleApproveDrawing = async (drawing: Tables<"drawings">) => {
    try {
      console.log('Starting approval process for drawing:', drawing.id);
      
      const { error: updateError } = await supabase
        .from("drawings")
        .update({ status: "approved" })
        .eq("id", drawing.id);

      if (updateError) throw updateError;

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

      // Try to send notification email, but don't block if it fails
      try {
        await supabase.functions
          .invoke('send-heart-notification', {
            body: { 
              drawingId: drawing.id,
              action: "approved"
            }
          });
        toast.success("Drawing approved, optimized and user notified");
      } catch (emailError) {
        console.error("Error sending notification:", emailError);
        toast.success("Drawing approved and optimized successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["drawings"] });
    } catch (error) {
      console.error("Error approving drawing:", error);
      toast.error("Failed to approve drawing");
    }
  };

  const handleDeclineDrawing = async (drawing: Tables<"drawings">) => {
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

  const handleApproveLocation = async (location: Tables<"locations">) => {
    try {
      const { error } = await supabase
        .from("locations")
        .update({ status: "approved" })
        .eq("id", location.id);

      if (error) throw error;

      toast.success("Locatie goedgekeurd");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (error) {
      console.error("Error approving location:", error);
      toast.error("Fout bij het goedkeuren van de locatie");
    }
  };

  const handleDeclineLocation = async (location: Tables<"locations">, reason: string) => {
    try {
      const { error: updateError } = await supabase
        .from("locations")
        .update({ 
          status: "rejected",
          rejection_reason: reason
        })
        .eq("id", location.id);

      if (updateError) throw updateError;

      // Try to send notification email, but don't block if it fails
      try {
        await supabase.functions
          .invoke('send-location-notification', {
            body: { 
              locationId: location.id,
              action: "rejected",
              reason
            }
          });
        toast.success("Locatie afgekeurd en gebruiker genotificeerd");
      } catch (emailError) {
        console.error("Error sending notification:", emailError);
        toast.warning("Locatie afgekeurd, maar notificatie mislukt");
      }

      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (error) {
      console.error("Error declining location:", error);
      toast.error("Fout bij het afkeuren van de locatie");
    }
  };

  const handleDeleteLocation = async (location: Tables<"locations">) => {
    try {
      // Try to send notification first, but proceed with deletion regardless
      let notificationSent = false;
      try {
        await supabase.functions
          .invoke('send-location-notification', {
            body: { 
              locationId: location.id,
              action: "deleted"
            }
          });
        notificationSent = true;
      } catch (emailError) {
        console.error("Error sending notification:", emailError);
      }

      const { error: deleteError } = await supabase
        .from("locations")
        .delete()
        .eq("id", location.id);

      if (deleteError) throw deleteError;

      if (notificationSent) {
        toast.success("Locatie verwijderd en gebruiker genotificeerd");
      } else {
        toast.warning("Locatie verwijderd, maar notificatie mislukt");
      }
      
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Fout bij het verwijderen van de locatie");
    }
  };

  // Filter items based on selected status
  const filteredDrawings = drawings?.filter(drawing => drawing.status === selectedStatus) || null;
  const filteredLocations = locations?.filter(location => location.status === selectedStatus) || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar
          selectedStatus={selectedStatus}
          selectedSection={selectedSection}
          setSelectedStatus={setSelectedStatus}
          setSelectedSection={setSelectedSection}
          drawings={drawings}
          locations={locations}
        />
        <main className="flex-1">
          {selectedSection === "hearts" ? (
            <DrawingGrid
              drawings={filteredDrawings}
              selectedStatus={selectedStatus}
              onApprove={handleApproveDrawing}
              onDecline={handleDeclineDrawing}
            />
          ) : selectedSection === "locations" ? (
            <LocationsGrid
              locations={filteredLocations}
              selectedStatus={selectedStatus}
              onApprove={handleApproveLocation}
              onDecline={handleDeclineLocation}
              onDelete={handleDeleteLocation}
            />
          ) : (
            <VideoGrid />
          )}
        </main>
      </div>
    </div>
  );
};