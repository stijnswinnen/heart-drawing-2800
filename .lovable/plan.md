# Fotosessie-boekingsblok met TidyCal

## Doel
Het huidige boekingsblok onderaan elke locatiepagina (drie Calendly-pakketten via react-calendly popup) vervangen door één duidelijk aanbod met add-ons, geboekt via TidyCal.

## Wijzigingen

### 1. `src/components/PhotoSessionBooking.tsx` — herbouwen
Nieuwe props: `tidycalUrl: string`, `ownerTidycalUrl?: string`, `isOwner?: boolean`.

**Basisformule** (als lijst, geen kaarten):
- 30 minuten fotosessie op de gekozen locatie
- Maximum 4 personen
- 10 bewerkte foto's in hoge resolutie (min. 300 dpi, sRGB, printklaar tot A3)
- Levering binnen 5 werkdagen via online galerij
- Prijs prominent: **€65**

**Uitbreidingen** als compacte lijst onder de basisinfo, prijs rechts uitgelijnd:

| Uitbreiding | Prijs |
|---|---|
| Extra 15 minuten | +€20 |
| Extra persoon (vanaf 5e) | +€15 / persoon |
| Extra bewerkte foto's | +€5 / foto |
| Spoedlevering (binnen 48u) | +€25 |
| Fotoboek 15×15 cm — 20 pagina's | +€100 |
| Extra pagina's fotoboek | +€10 / 2 pagina's |
| Gepersonaliseerd fotoboek | Op aanvraag |

**Structuur van het blok:**
1. Kop: *"Wil je hier gefotografeerd worden?"* (Fraunces, zelfde stijl als nu)
2. Basisformule + prijs €65
3. Uitbreidingen-lijst (subtieler dan de basis: kleinere tekst, muted kleur)
4. Eén outline-knop **"Boek een sessie op deze locatie"** → opent TidyCal-URL in nieuw tabblad via `<a target="_blank" rel="noopener noreferrer">` (geen popup, geen react-calendly)
5. Onder de knop, klein en subtiel: *"De uitbreidingen bespreek je bij de boeking of voeg je achteraf toe."*

**Gratis eigenaressessie behouden:** de kaart "Je favoriete plek" (15 min, gratis, 1 bewerkte foto) blijft, alleen zichtbaar voor de indiener (`isOwner`), met een eigen knop naar `ownerTidycalUrl`. Bovenaan het blok geplaatst met een badge "Enkel voor jou", zoals nu.

### 2. `src/config/tidycal.ts` — nieuw configbestand
```ts
export const TIDYCAL_URLS = {
  sessie: "https://tidycal.com/m8n4x9q/2800love",
  owner: "https://tidycal.com/m8n4x9q/je-favoriete-plek", // nog aan te maken in TidyCal
} as const;
```
`src/config/calendly.ts` verwijderen.

### 3. `src/pages/LocatieDetail.tsx` — props aanpassen
Alleen de props van `<PhotoSessionBooking>` updaten naar `tidycalUrl={TIDYCAL_URLS.sessie}` en `ownerTidycalUrl={TIDYCAL_URLS.owner}`. De bestaande gating blijft ongewijzigd: blok verborgen als `photo_session_hidden`, `isOwner` blijft de bestaande check (indiener van de locatie + status approved).

### 4. Afhankelijkheid opruimen
`react-calendly` uit `package.json` verwijderen (wordt nergens meer gebruikt). Geen nieuwe dependencies toegevoegd.

## Stijl
- Bestaande design-tokens: `--ink`, `--ink-muted`, `--line`, `--pink-500`, Fraunces voor koppen
- Geen felle achtergronden; outline-knop in de bestaande pill-stijl
- Add-ons subtieler dan de basis (kleinere tekst, muted kleur, dunne scheidingslijn)
- Blok blijft lichter dan de locatie-inhoud: dezelfde border-top-scheiding en witruimte als nu

## Randgevolgen
- De Calendly-prefill die de huidige paginalink meegaf vervalt (TidyCal ondersteunt dit niet via URL). Bezoekers boeken rechtstreeks via TidyCal.
- De TidyCal-event voor de gratis eigenaressessie moet in TidyCal aangemaakt worden; tot dan geeft die knop een nog-niet-bestaande URL. Alternatief: die knop tonen zodra de URL bekend is.

## Niet in scope
- Betaalintegratie, eigen boekingsdatabase, meertaligheid
- Geen routing-, data-, state- of auth-wijzigingen; alleen dit component, het configbestand en de props in LocatieDetail
