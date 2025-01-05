import { Navigation } from "@/components/Navigation";
import { LocationsMap } from "@/components/LocationsMap";

const Locaties = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Gedeelde plekken in Mechelen</h1>
        <LocationsMap />
      </div>
    </div>
  );
};

export default Locaties;