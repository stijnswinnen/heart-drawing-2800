import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DrawingGridProps {
  drawings: Tables<"drawings">[] | null;
  selectedStatus: "new" | "approved";
  onApprove: (drawing: Tables<"drawings">) => Promise<void>;
  onDecline: (drawing: Tables<"drawings">) => Promise<void>;
}

export const DrawingGrid = ({ drawings, selectedStatus, onApprove, onDecline }: DrawingGridProps) => {
  const getImageUrl = (drawing: Tables<"drawings">) => {
    const bucket = drawing.status === "approved" ? "optimized" : "hearts";
    const imagePath = drawing.status === "approved" 
      ? `optimized/${drawing.image_path.split('/').pop()}`
      : drawing.image_path;
    
    console.log('Getting image URL for:', { bucket, imagePath });
    const { data } = supabase.storage.from(bucket).getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const handleApprove = async (drawing: Tables<"drawings">) => {
    try {
      // First, approve the drawing
      await onApprove(drawing);

      // Then, optimize the image
      const { data, error } = await supabase.functions.invoke('optimize-heart', {
        body: { imagePath: drawing.image_path }
      });

      if (error) {
        console.error('Error optimizing image:', error);
        toast.error("Heart approved but optimization failed");
        return;
      }

      console.log('Optimization response:', data);
      toast.success("Heart approved and optimized successfully");
    } catch (error) {
      console.error('Error in handleApprove:', error);
      toast.error("Heart approved but optimization failed");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {drawings?.map((drawing) => (
        <div
          key={drawing.id}
          className="border border-dashed rounded-lg p-4"
        >
          <div className="aspect-square mb-4">
            <img
              src={getImageUrl(drawing)}
              alt="Heart drawing"
              className="w-full h-full object-contain"
            />
          </div>
          {selectedStatus === "new" && (
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleApprove(drawing)}
              >
                <CheckCircle className="mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDecline(drawing)}
              >
                <XCircle className="mr-2" />
                Decline
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};