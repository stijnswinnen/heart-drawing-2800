import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Locaties = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 flex flex-col gap-8">
        <LocationsMap 
          selectedLocationId={selectedLocationId}
          onLocationSelect={setSelectedLocationId}
        />
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/mijn-favoriete-plek" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Voeg jouw lievelingsplek toe
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Locaties;