import { useSession } from "@supabase/auth-helpers-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Star, Edit, PlusCircle, XCircle, AlertCircle } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const LocationsSection = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes } = useLocationLikes();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [editedLocation, setEditedLocation] = useState<any>(null);

  const userLocations = locations.filter(
    (location) => location.user_id === session?.user?.id && location.status === 'approved'
  );

  const userLikes = locationLikes.filter(
    (like) => like.user_id === session?.user?.id && like.status === "active"
  );

  const favoriteLocations = locations.filter((location) =>
    userLikes.some((like) => like.location_id === location.id)
  );

  const rejectedLocations = locations.filter(
    (location) => 
      location.user_id === session?.user?.id && 
      location.status === "rejected"
  );

  const handleLocationEdit = (location: any) => {
    setSelectedLocation(location);
    setEditedLocation({
      name: location.name || '',
      description: location.description || '',
      recommendation: location.recommendation || '',
    });
  };

  const handleSubmitEdit = async () => {
    if (!editedLocation || !selectedLocation) return;

    try {
      const { error } = await supabase
        .from('locations')
        .update({
          name: editedLocation.name,
          description: editedLocation.description,
          recommendation: editedLocation.recommendation,
          status: 'new'
        })
        .eq('id', selectedLocation.id);

      if (error) throw error;

      toast.success("Locatie opnieuw ingediend voor goedkeuring");
      setSelectedLocation(null);
      window.location.reload(); // Refresh to update the lists
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Er ging iets mis bij het bijwerken van de locatie");
    }
  };

  // ... keep existing code (JSX for tabs and cards)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary-dark">Mijn Plekken</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-locations">
          <TabsList>
            <TabsTrigger value="my-locations">
              <MapPin className="mr-2 h-4 w-4" />
              Mijn Locaties
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="mr-2 h-4 w-4" />
              Favorieten
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="mr-2 h-4 w-4" />
              Afgekeurd
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-locations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {userLocations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{location.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => handleLocationEdit(location)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Bekijk Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="shadow-none">
                <CardContent className="flex items-center justify-center p-8">
                  <Button asChild>
                    <Link to="/mijn-favoriete-plek">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Voeg Nieuwe Locatie Toe
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {favoriteLocations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{location.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => handleLocationEdit(location)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Bekijk Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {rejectedLocations.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>Je hebt geen afgekeurde locaties</p>
                </div>
              ) : (
                rejectedLocations.map((location) => (
                  <Card key={location.id} className="border-destructive/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" />
                        {location.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{location.description}</p>
                      <div className="bg-destructive/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Reden voor afkeuring:</h4>
                        <p className="text-sm text-destructive">{location.rejection_reason || "Geen reden opgegeven"}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" onClick={() => handleLocationEdit(location)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bewerken
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation?.status === 'rejected' ? 'Locatie opnieuw indienen' : 'Locatie details'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Naam van de locatie</label>
              <Input
                value={editedLocation?.name || ''}
                onChange={(e) => setEditedLocation({ ...editedLocation, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beschrijving</label>
              <Textarea
                value={editedLocation?.description || ''}
                onChange={(e) => setEditedLocation({ ...editedLocation, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aanbeveling</label>
              <Textarea
                value={editedLocation?.recommendation || ''}
                onChange={(e) => setEditedLocation({ ...editedLocation, recommendation: e.target.value })}
              />
            </div>
            {selectedLocation?.status === 'rejected' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reden voor afkeuring</label>
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {selectedLocation?.rejection_reason || "Geen reden opgegeven"}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedLocation(null)}>
              Annuleren
            </Button>
            {selectedLocation?.status === 'rejected' && (
              <Button onClick={handleSubmitEdit}>
                Opnieuw indienen
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
