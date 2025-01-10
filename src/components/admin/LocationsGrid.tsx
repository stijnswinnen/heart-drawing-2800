import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationsGridProps {
  locations: Tables<"locations">[];
}

export const LocationsGrid = ({ locations }: LocationsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {locations.map((location) => (
        <Card key={location.id}>
          <CardHeader>
            <CardTitle>{location.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
            <div className="flex flex-col gap-1">
              <p className="text-sm">
                <span className="font-medium">Status:</span> {location.status}
              </p>
              <p className="text-sm">
                <span className="font-medium">Coordinates:</span>{" "}
                {location.latitude}, {location.longitude}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};