import { Navigation } from "@/components/Navigation";
import { LocationForm } from "@/components/LocationForm";

const FavoritePlek = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Deel jouw favoriete plekje in Mechelen! ❤️</h1>
        <p className="text-lg mb-8">
          Selecteer jouw favoriete plek op de kaart en vertel ons er meer over.
        </p>
        <LocationForm />
      </main>
    </div>
  );
};

export default FavoritePlek;