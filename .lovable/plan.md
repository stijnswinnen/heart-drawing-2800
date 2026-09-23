# Kaart zonder "API key required"-melding

De kaarten halen hun achtergrondbeeld bij CARTO, en die dienst vraagt sinds kort een sleutel. Zonder sleutel verschijnt de melding over de kaart. We voegen de sleutel toe aan de kaart-adressen, zodat de melding verdwijnt.

## Wat er verandert

- De twee kaarten (de overzichtskaart met alle plekjes en de kaart op een locatiepagina) krijgen de sleutel mee.
- Verder verandert er niets: zelfde kaartstijl, zelfde markeringen, zelfde gedrag.

## Technisch

- Sleutel: `cb1_3vhw_1_75613701781a405ddf708c73`, rechtstreeks in de code (browser-sleutel, bedoeld om publiek te zijn).
- In `src/components/OverviewMap.tsx` en `src/components/LocationMap.tsx`: elke tegel-URL wordt
  `https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png?key=cb1_3vhw_1_75613701781a405ddf708c73`.
- Attributie, layers, zoom en overige kaartinstellingen blijven ongewijzigd.

## Controle

- Beide kaarten in de preview bekijken (overzicht `/locaties` en een locatiepagina) en bevestigen dat de tegels laden zonder watermerk en zonder fouten in de console.
