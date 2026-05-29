## Wat er gebeurt

De gebruiker (Annemie) heeft **eerder al een hartje ingediend en haar e-mailadres geverifieerd**. Bij deze nieuwe poging:

1. `submitDrawing` zoekt het profiel op via `get_profile_minimal_by_email` → vindt haar **bestaande, geverifieerde** profiel.
2. Ze is niet ingelogd (anonieme submission), dus de drawings INSERT loopt door de "anonieme tak" van de RLS-policy `Allow drawing submissions`.
3. Die tak eist `profiles.email_verified = false` voor het doelprofiel (zie migration `20260507223126`, expliciet bedoeld om impersonatie te voorkomen).
4. → INSERT geweigerd met `new row violates row-level security policy for table "drawings"`. De rauwe Postgres-foutmelding wordt 1-op-1 in een Engelse toast getoond.

Dit is dus **geen bug in de RLS-policy** — die werkt zoals bedoeld (anoniem mag niet posten namens een geverifieerd account). Het probleem is dat:
- de UI dit als een generieke technische fout toont in het Engels;
- de gebruiker geen pad krijgt om verder te gaan (inloggen of magic link).

## Plan

### 1. Dutch toast messages (frontend only)

In `src/utils/drawingSubmission.ts` en de aanroepende handler (`src/components/drawing/DrawingSubmissionHandler.tsx` of `src/components/DrawingSubmissionHandler.tsx` — controleren welke gebruikt wordt) de Engelse `throw new Error(...)` strings vervangen door Nederlandse user-facing teksten. Concreet:

| Huidig (EN) | Nieuw (NL) |
|---|---|
| "No drawing found!" | "Geen tekening gevonden." |
| "Please draw something before submitting!" | "Teken eerst iets voor je verzendt." |
| "Failed to check user information: ..." | "Kon je gegevens niet controleren. Probeer het opnieuw." |
| "Failed to save user information: ..." | "Kon je gegevens niet opslaan. Probeer het opnieuw." |
| "Failed to upload drawing: ..." | "Uploaden van je tekening is mislukt. Probeer het opnieuw." |
| "Failed to save drawing information: ..." (RLS-geval) | **Specifieke detectie:** zie hieronder |

### 2. Specifieke afhandeling van het "verified email" geval

In de `dbError`-tak: als `dbError.code === '42501'` (RLS) **of** de message bevat `row-level security policy` **én** de gebruiker is anoniem **én** het opgehaalde profiel had `email_verified === true`, dan een duidelijke, bruikbare melding tonen:

> "Dit e-mailadres is al geregistreerd en geverifieerd. Log in om je hart te versturen."

`get_profile_minimal_by_email` geeft `email_verified` al terug — die waarde doorgeven naar de error branch zodat we proactief kunnen detecteren (eigenlijk: vóór de upload al stoppen wanneer `existingProfile.email_verified === true && !userId`, en meteen een login-prompt tonen). Dat scheelt ook de overbodige storage-upload + cleanup.

### 3. UX: aanbieden om in te loggen

In de toast (of een kleine dialoog) een knop "Inloggen" tonen die de bestaande `AuthDialog` opent met het ingevulde e-mailadres voor-gevuld. Na succesvolle login automatisch opnieuw `submitDrawing` aanroepen met de nu bekende `userId`.

### Niet doen

- Geen wijziging aan de RLS-policy — die is bewust strikt.
- Geen wijziging aan de Supabase-database of edge functions.
- Geen wijziging aan de drawing/canvas-logica.

## Bestanden die aangepast worden

- `src/utils/drawingSubmission.ts` — NL meldingen + early-return op verified profile.
- `src/components/drawing/DrawingSubmissionHandler.tsx` (of de variant in `src/components/`) — toast in NL + "Inloggen" actie.
- Eventueel kleine prop-toevoeging aan `AuthDialog` om e-mailadres voor te vullen, als dat nog niet bestaat.
