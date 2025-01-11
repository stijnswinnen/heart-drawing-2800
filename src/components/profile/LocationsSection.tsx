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
import { MapPin, Star, Edit, PlusCircle, XCircle } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { useLocationLikes } from "@/hooks/useLocationLikes";
import { Link } from "react-router-dom";

export const LocationsSection = () => {
  const session = useSession();
  const locations = useLocations();
  const { locationLikes } = useLocationLikes();

  const userLocations = locations.filter(
    (location) => location.user_id === session?.user?.id
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
                    <Button variant="outline" asChild>
                      <Link to={`/locaties?id=${location.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bekijk Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card>
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
                    <Button variant="outline" asChild>
                      <Link to={`/locaties?id=${location.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bekijk Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {rejectedLocations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{location.description}</p>
                    <div className="bg-destructive/10 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Reden voor afkeuring:</h4>
                      <p className="text-sm text-destructive">{location.rejection_reason || "Geen reden opgegeven"}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild>
                      <Link to={`/locaties?id=${location.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bekijk Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};