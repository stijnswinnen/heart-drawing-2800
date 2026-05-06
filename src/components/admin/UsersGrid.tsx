import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, CheckCircle2, XCircle, Heart, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SectionHeader } from "./SectionHeader";

interface ProfileRow {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  email_verified: boolean | null;
  created_at: string;
}

interface DrawingRow {
  id: string;
  image_path: string;
  user_id: string | null;
  heart_user_id: string | null;
}

interface LocationRow {
  id: string;
  name: string;
  status: string;
  user_id: string | null;
  heart_user_id: string | null;
}

const SUPABASE_PUBLIC_URL =
  "https://webocybzloqwnyxpquam.supabase.co/storage/v1/object/public";

export const UsersGrid = () => {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<ProfileRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, email_verified, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const { data: drawings } = useQuery({
    queryKey: ["admin-all-drawings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drawings")
        .select("id, image_path, user_id, heart_user_id");
      if (error) throw error;
      return data as DrawingRow[];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["admin-all-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, status, user_id, heart_user_id");
      if (error) throw error;
      return data as LocationRow[];
    },
  });

  const drawingsForProfile = (p: ProfileRow) =>
    (drawings || []).filter(
      (d) =>
        d.heart_user_id === p.id ||
        (p.user_id && d.user_id === p.user_id),
    );

  const locationsForProfile = (p: ProfileRow) =>
    (locations || []).filter(
      (l) =>
        l.heart_user_id === p.id ||
        (p.user_id && l.user_id === p.user_id),
    );

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("admin-delete-user", {
        body: { profileId: toDelete.id },
      });
      if (error) throw error;
      toast.success("Gebruiker verwijderd");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-drawings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-locations"] });
      setToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error("Verwijderen mislukt");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Laden...</p>;
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Gebruikers"
        title={`${profiles?.length || 0} ${profiles?.length === 1 ? "gebruiker" : "gebruikers"}.`}
        description="Overzicht van alle profielen en hun bijdragen."
      />
      <div className="rounded-lg border">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Heart</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((p) => {
              const userDrawings = drawingsForProfile(p);
              const userLocations = locationsForProfile(p);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name || "—"}</TableCell>
                  <TableCell>{p.email || "—"}</TableCell>
                  <TableCell>
                    {p.email_verified ? (
                      <CheckCircle2 className="text-green-600" size={18} />
                    ) : (
                      <XCircle className="text-muted-foreground" size={18} />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(p.created_at), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>
                    {userDrawings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {userDrawings.map((d) => (
                          <a
                            key={d.id}
                            href={`${SUPABASE_PUBLIC_URL}/hearts/${d.image_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-10 h-10 rounded border overflow-hidden hover:ring-2 hover:ring-primary"
                          >
                            <img
                              src={`${SUPABASE_PUBLIC_URL}/hearts/${d.image_path}`}
                              alt="heart"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Heart size={14} /> —
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {userLocations.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {userLocations.map((l) => (
                          <Badge
                            key={l.id}
                            variant="secondary"
                            className="w-fit gap-1"
                          >
                            <MapPin size={12} />
                            {l.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(p)}
                      aria-label="Delete user"
                    >
                      <Trash2 className="text-destructive" size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {profiles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Geen gebruikers gevonden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gebruiker verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.email || toDelete?.name} wordt definitief verwijderd. Hartjes
              en locaties blijven behouden, maar worden losgekoppeld van deze
              gebruiker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Bezig..." : "Verwijderen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
