import { Navigation } from "@/components/Navigation";
import { LocationForm } from "@/components/LocationForm";
import { HeartTrail } from "@/components/HeartTrail";

const FavoritePlek = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeartTrail />
      <Navigation />
      <main className="container relative z-10 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-barlow font-bold mb-6 text-right text-secondary-dark">
          Deel jouw favoriete plekje<br />in Mechelen! ❤️
        </h1>
        <div className="space-y-4 text-lg mb-8 md:ml-[40%] font-montserrat">
          <p>
            Mechelen, onze stad vol verborgen pareltjes. Weet jij al welk plekje in Mechelen jouw hart sneller doet kloppen? Is het een romantisch bankje aan de Dijle, een gezellig terrasje op de Grote Markt, of misschien wel een geheime stek in het Vrijbroekpark?
          </p>
          <div className="md:ml-[-30%] md:mr-[10%] bg-primary-light rounded-[20px] p-6 space-y-2 animate-slide-in-right">
            <p className="text-[2.5rem] leading-tight font-semibold text-white">
              Wist je dat...
            </p>
            <p className="text-[1.5rem] leading-snug text-white">
              Als we jouw verhaal publiek mogen delen, maak je kans op een mini-fotoreportage op jouw lievelingsplek!
            </p>
            <p className="text-[0.8rem] text-white">
              (Let op: het aantal plaatsen is beperkt!)
            </p>
          </div>
          <p>
            Wij zijn benieuwd naar jouw favoriete plek! Duid het aan op de kaart hieronder en vertel ons waarom deze plek zo speciaal voor je is. Wat maakt het zo inspirerend? Waar geniet je zorgeloos van elkaar, waar verzink je in elkaars ogen? Welke plek maakt je nóg meer verliefd op Mechelen?
          </p>
        </div>
        <div className="bg-primary -mx-4 px-4 py-8 md:px-8 md:py-12">
          <LocationForm />
        </div>
      </main>
    </div>
  );
};

export default FavoritePlek;