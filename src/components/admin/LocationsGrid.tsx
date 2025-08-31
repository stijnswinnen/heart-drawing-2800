import { useState } from "react";
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
import { Check, X, Trash2 } from "lucide-react";
import { LocationRejectionDialog } from "./LocationRejectionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LocationsGridProps {
  locations: Tables<"locations">[] | null;
  selectedStatus: "new" | "approved" | "rejected";
  onApprove: (location: Tables<"locations">) => void;
  onDecline: (location: Tables<"locations">, reason: string) => void;
  onDelete: (location: Tables<"locations">) => void;
}

export const LocationsGrid = ({
  locations,
  selectedStatus,
  onApprove,
  onDecline,
  onDelete,
}: LocationsGridProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Tables<"locations"> | null>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch profiles for all locations
  const { data: profiles } = useQuery({
    queryKey: ["profiles", locations?.map(loc => loc.heart_user_id)],
    queryFn: async () => {
      if (!locations) return [];
      const heartUserIds = locations
        .map(loc => loc.heart_user_id)
        .filter((id): id is string => id !== null);
      
      if (heartUserIds.length === 0) return [];

      const { data } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", heartUserIds);

      return data || [];
    },
    enabled: !!locations?.length,
  });

  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {selectedStatus === "new"
            ? "Geen nieuwe locaties om te beoordelen"
            : selectedStatus === "approved"
            ? "Nog geen goedgekeurde locaties"
            : "Geen afgekeurde locaties"}
        </p>
      </div>
    );
  }

  const handleDeclineClick = (location: Tables<"locations">) => {
    setSelectedLocation(location);
    setIsRejectionDialogOpen(true);
  };

  const handleDeleteClick = (location: Tables<"locations">) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const getProfileInfo = (heartUserId: string | null) => {
    if (!heartUserId || !profiles) return { name: "-", email: "-" };
    const profile = profiles.find(p => p.id === heartUserId);
    return {
      name: profile?.name || "-",
      email: profile?.email || "-"
    };
  };

  const getGoogleMapsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Naam</TableHead>
               <TableHead>Beschrijving</TableHead>
               <TableHead>Afbeelding</TableHead>
               <TableHead>Categorie</TableHead>
               <TableHead>Coördinaten</TableHead>
               <TableHead>Aanbeveling</TableHead>
               <TableHead>Gebruiker naam</TableHead>
               <TableHead>Gebruiker email</TableHead>
               {selectedStatus === "rejected" && <TableHead>Reden afkeuring</TableHead>}
               <TableHead>Acties</TableHead>
             </TableRow>
           </TableHeader>
          <TableBody>
            {locations.map((location) => {
              const profileInfo = getProfileInfo(location.heart_user_id);
              return (
                 <TableRow key={location.id}>
                   <TableCell>{location.name}</TableCell>
                   <TableCell>{location.description || "-"}</TableCell>
                   <TableCell>
                     {location.image_path ? (
                       <img 
                         src={location.image_path} 
                         alt={location.name}
                         className="w-16 h-12 object-cover rounded"
                       />
                     ) : (
                       "-"
                     )}
                   </TableCell>
                   <TableCell>
                     {location.category ? (
                       <span className="inline-block bg-pink-400 text-white text-xs font-semibold px-2 py-1 rounded uppercase">
                         {location.category}
                       </span>
                     ) : (
                       "-"
                     )}
                   </TableCell>
                   <TableCell>
                     <a 
                       href={getGoogleMapsUrl(Number(location.latitude), Number(location.longitude))}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-500 hover:underline"
                     >
                       {location.latitude}, {location.longitude}
                     </a>
                   </TableCell>
                   <TableCell>{location.recommendation || "-"}</TableCell>
                   <TableCell>{profileInfo.name}</TableCell>
                   <TableCell>{profileInfo.email}</TableCell>
                  {selectedStatus === "rejected" && (
                    <TableCell>{location.rejection_reason || "-"}</TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-2">
                      {selectedStatus === "new" && (
                        <>
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
                            onClick={() => handleDeclineClick(location)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(location)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LocationRejectionDialog
        isOpen={isRejectionDialogOpen}
        onClose={() => {
          setIsRejectionDialogOpen(false);
          setSelectedLocation(null);
        }}
        onConfirm={(reason) => {
          if (selectedLocation) {
            onDecline(selectedLocation, reason);
          }
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedLocation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Locatie verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze locatie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              De gebruiker zal hiervan op de hoogte worden gebracht via e-mail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedLocation) {
                  onDelete(selectedLocation);
                }
              }}
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};