import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";

const Locaties = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <LocationsMap />
      </div>
    </div>
  );
};

export default Locaties;