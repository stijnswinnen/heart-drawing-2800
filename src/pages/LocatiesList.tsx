import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLocations } from "@/hooks/useLocations";
import { LocationDetailsPanel } from "@/components/LocationDetailsPanel";
import { ArrowLeft } from "lucide-react";

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

  const osmUrl = selectedLocation
    ? `https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=17/${selectedLocation.latitude}/${selectedLocation.longitude}`
    : "#";

  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-7 pt-14 pb-24">
        <Link
          to="/locaties"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors mb-9"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Alle plekjes
        </Link>

        <div className="grid grid-cols-1 min-[880px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-16 items-start">
          {/* LEFT: details */}
          <div className="order-2 min-[880px]:order-1">
            {selectedLocation && (
              <LocationDetailsPanel
                location={{
                  id: selectedLocation.id,
                  name: selectedLocation.name,
                  description: selectedLocation.description,
                  heart_user_id: selectedLocation.heart_user_id || null,
                  recommendation: selectedLocation.recommendation,
                  image_path: selectedLocation.image_path || null,
                  category: selectedLocation.category || null,
                }}
                onClose={() => setSelectedLocationId(null)}
              />
            )}
          </div>

          {/* RIGHT: map */}
          <div className="order-1 min-[880px]:order-2">
            <div className="min-[880px]:sticky min-[880px]:top-[88px]">
              <div
                className="rounded-[20px] overflow-hidden bg-white border border-line"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="aspect-[4/5] w-full">
                  <LocationsMap
                    selectedLocationId={selectedLocationId}
                    onLocationSelect={setSelectedLocationId}
                  />
                </div>
              </div>
              {selectedLocation && (
                <div className="flex items-center justify-between mt-4 px-1 text-[13px]">
                  <span className="text-ink-muted">Mechelen</span>
                  <a
                    href={osmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-ink transition-colors"
                  >
                    Open in kaart →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocatiesList;
