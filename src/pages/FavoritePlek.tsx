import { Navigation } from "@/components/Navigation";
import { LocationForm } from "@/components/LocationForm";

const FavoritePlek = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Deel jouw favoriete plekje in Mechelen! ❤️</h1>
        <div className="space-y-4 text-lg mb-8">
          <p>
            Mechelen, onze stad vol verborgen pareltjes. Weet jij al welk plekje in Mechelen jouw hart sneller doet kloppen? Is het een romantisch bankje aan de Dijle, een gezellig terrasje op de Grote Markt, of misschien wel een geheime stek in het Vrijbroekpark?
          </p>
          <p>
            Wij zijn benieuwd naar jouw favoriete plek! Duid het aan op de kaart hieronder en vertel ons waarom deze plek zo speciaal voor je is. Wat maakt het zo inspirerend? Waar geniet je zorgeloos van elkaar, waar verzink je in elkaars ogen? Welke plek maakt je nóg meer verliefd op Mechelen?
          </p>
          <p>
            En psst... Als je bereid bent om je verhaal met ons te delen, maak je kans op een mini-fotoreportage op jouw lievelingsplek! (Let op: het aantal plaatsen is beperkt!)
          </p>
          <p>
            Deel je verhaal en laat ons meegenieten van de magie van Mechelen! ✨
          </p>
        </div>
        <LocationForm />
      </main>
    </div>
  );
};

export default FavoritePlek;