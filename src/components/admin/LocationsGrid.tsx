import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface LocationsGridProps {
  locations: Tables<"locations">[] | null;
  selectedStatus: "new" | "approved";
  onApprove: (location: Tables<"locations">) => void;
  onDecline: (location: Tables<"locations">) => void;
}

export const LocationsGrid = ({
  locations,
  selectedStatus,
  onApprove,
  onDecline,
}: LocationsGridProps) => {
  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {selectedStatus === "new"
            ? "No new locations to review"
            : "No approved locations yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Recommendation</TableHead>
            {selectedStatus === "new" && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.name}</TableCell>
              <TableCell>{location.description || "-"}</TableCell>
              <TableCell>
                {location.latitude}, {location.longitude}
              </TableCell>
              <TableCell>{location.recommendation || "-"}</TableCell>
              {selectedStatus === "new" && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onApprove(location)}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDecline(location)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};