import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocations } from "@/hooks/useLocations";
import { LocationDetailsPanel } from "@/components/LocationDetailsPanel";
import { cn } from "@/lib/utils";

const LocatiesList = () => {
  const [searchParams] = useSearchParams();
  const locations = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // Handle URL parameter for shared locations
  useEffect(() => {
    const locationId = searchParams.get('location');
    if (locationId) {
      setSelectedLocationId(locationId);
    } else if (locations.length > 0) {
      // Select random location if none specified
      const randomIndex = Math.floor(Math.random() * locations.length);
      setSelectedLocationId(locations[randomIndex].id);
    }
  }, [searchParams, locations]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Side Panel */}
          <div className={cn(
            "w-full md:w-1/3 order-2 md:order-1",
            "transition-all duration-300 ease-in-out"
          )}>
            <LocationDetailsPanel 
              locationId={selectedLocationId} 
              onClose={() => setSelectedLocationId(null)}
            />
          </div>
          
          {/* Map */}
          <div className="w-full md:w-2/3 order-1 md:order-2">
            <LocationsMap 
              selectedLocationId={selectedLocationId}
              onLocationSelect={setSelectedLocationId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocatiesList;