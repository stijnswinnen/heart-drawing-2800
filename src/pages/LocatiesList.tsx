import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocations } from "@/hooks/useLocations";
import { LocationDetailsPanel } from "@/components/LocationDetailsPanel";

const LocatiesList = () => {
  const [searchParams] = useSearchParams();
  const locations = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  useEffect(() => {
    const locationId = searchParams.get('location');
    if (locationId) {
      setSelectedLocationId(locationId);
    } else if (locations.length > 0) {
      const randomIndex = Math.floor(Math.random() * locations.length);
      setSelectedLocationId(locations[randomIndex].id);
    }
  }, [searchParams, locations]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 order-2 md:order-1">
            <LocationDetailsPanel 
              locationId={selectedLocationId} 
              onClose={() => setSelectedLocationId(null)}
            />
          </div>
          
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