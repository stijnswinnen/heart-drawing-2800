import { Navigation } from "@/components/Navigation";
import { LocationForm } from "@/components/LocationForm";
import { HeartTrail } from "@/components/HeartTrail";

const FavoritePlek = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeartTrail />
      <Navigation />
      <main className="container relative z-10 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl leading-relaxed font-barlow font-bold mb-8 text-left text-primary-dark">
          Deel jouw favoriete plekje<br />in Mechelen! ❤️
        </h1>
        <div className="space-y-8 text-lg mb-12 md:ml-[40%] font-montserrat">
          <p>
            Mechelen, onze stad vol verborgen pareltjes. Weet jij al welk plekje in Mechelen jouw hart sneller doet kloppen? Is het een romantisch bankje aan de Dijle, een gezellig terrasje op de Grote Markt, of misschien wel een geheime stek in het Vrijbroekpark?
          </p>
          <div className="md:ml-[-30%] md:mr-[10%] bg-primary-light rounded-[20px] p-6 space-y-2 animate-slide-in-right">
            <p className="text-[2.5rem] leading-tight font-semibold text-white">
              Wist je dat...
            </p>
            <p className="text-[1.5rem] leading-snug text-white">
              Jouw verhaal verdient een podium! Deel je favoriete plek en maak kans op een exclusieve mini-fotoreportage op locatie – helemaal gratis.
            </p>
            <p className="text-[0.8rem] text-white">
              (Let op: het aantal plaatsen is beperkt!)
            </p>
          </div>
          <p>
            Als fotograaf kom ik op diverse plekken in Mechelen. Duid jouw favoriete plek aan op de kaart hieronder en vertel ons waarom deze plek zo speciaal voor je is. Wat maakt het zo inspirerend? Waar geniet je zorgeloos van elkaar, waar verzink je in elkaars ogen? Welke plek maakt je nóg meer verliefd op Mechelen?
          </p>
        </div>
      </main>
      <div className="bg-primary px-4 py-8 md:px-8 md:py-12">
        <div className="container max-w-4xl mx-auto">
          <LocationForm />
        </div>
      </div>
    </div>
  );
};

export default FavoritePlek;