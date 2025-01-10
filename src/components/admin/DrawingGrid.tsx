import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getStorageUrl } from "@/utils/imageUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DrawingGridProps {
  drawings: Tables<"drawings">[] | null;
  selectedStatus: "new" | "approved";
  onApprove: (drawing: Tables<"drawings">) => Promise<void>;
  onDecline: (drawing: Tables<"drawings">) => Promise<void>;
}

interface Profile {
  email_verified: boolean;
  email: string;
}

export const DrawingGrid = ({ drawings, selectedStatus, onApprove, onDecline }: DrawingGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const itemsPerPage = 20;
  
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!drawings?.length) return;
      
      const profileIds = drawings.map(d => d.heart_user_id).filter(Boolean);
      if (!profileIds.length) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email_verified, email')
        .in('id', profileIds);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      const profileMap = (data || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      setProfiles(profileMap);
    };

    fetchProfiles();
  }, [drawings]);

  const handleApprove = async (drawing: Tables<"drawings">) => {
    if (!drawing.heart_user_id || !profiles[drawing.heart_user_id]?.email_verified) {
      toast.error("Cannot approve drawing: Email not verified");
      return;
    }

    try {
      await onApprove(drawing);
      toast.success("Heart approved successfully");
    } catch (error) {
      console.error('Error in handleApprove:', error);
      toast.error("Failed to approve heart");
    }
  };

  // Pagination logic
  const totalPages = drawings ? Math.ceil(drawings.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrawings = drawings?.slice(startIndex, endIndex) || [];

  const gridColumns = selectedStatus === "approved" 
    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
    : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className={`grid ${gridColumns} gap-6 w-full`}>
        {currentDrawings.map((drawing) => (
          <Card key={drawing.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={getStorageUrl(drawing.image_path, drawing.status)}
                  alt="Heart drawing"
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedStatus === "new" && (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      {drawing.heart_user_id && profiles[drawing.heart_user_id]?.email_verified ? (
                        <Badge variant="secondary" className="w-full justify-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Email verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="w-full justify-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Email not verified
                        </Badge>
                      )}
                    </div>
                    {drawing.heart_user_id && profiles[drawing.heart_user_id]?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">
                          {profiles[drawing.heart_user_id].email}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(drawing)}
                      disabled={!drawing.heart_user_id || !profiles[drawing.heart_user_id]?.email_verified}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDecline(drawing)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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