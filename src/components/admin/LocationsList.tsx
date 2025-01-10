import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Location = Tables<"locations">;

export const LocationsList = () => {
  const { data: locations, refetch } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("locations")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error("Error approving location");
      return;
    }

    toast.success("Location approved successfully");
    refetch();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("locations")
      .update({ status: "pending_verification" })
      .eq("id", id);

    if (error) {
      toast.error("Error rejecting location");
      return;
    }

    toast.success("Location rejected successfully");
    refetch();
  };

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations?.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>{location.description}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    location.status === "approved"
                      ? "success"
                      : location.status === "pending_verification"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {location.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(location.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="space-x-2">
                {location.status === "new" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(location.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(location.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};