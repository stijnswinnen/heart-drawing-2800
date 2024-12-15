import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DrawingGridProps {
  drawings: Tables<"drawings">[] | null;
  selectedStatus: "new" | "approved";
  onApprove: (drawing: Tables<"drawings">) => Promise<void>;
  onDecline: (drawing: Tables<"drawings">) => Promise<void>;
}

export const DrawingGrid = ({ drawings, selectedStatus, onApprove, onDecline }: DrawingGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
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
      await onApprove(drawing);
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

  // Pagination logic
  const totalPages = drawings ? Math.ceil(drawings.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrawings = drawings?.slice(startIndex, endIndex) || [];

  const gridColumns = selectedStatus === "approved" 
    ? "grid-cols-1 md:grid-cols-5" 
    : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className={`grid ${gridColumns} gap-6 w-full`}>
        {currentDrawings.map((drawing) => (
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

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};