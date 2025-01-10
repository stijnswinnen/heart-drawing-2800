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

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[40%] order-2 md:order-1">
            {selectedLocation && (
              <LocationDetailsPanel 
                location={{
                  id: selectedLocation.id,
                  name: selectedLocation.name,
                  description: selectedLocation.description,
                  heart_user_id: selectedLocation.heart_user_id || null
                }}
                onClose={() => setSelectedLocationId(null)}
              />
            )}
          </div>
          
          <div className="w-full md:w-[60%] order-1 md:order-2">
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