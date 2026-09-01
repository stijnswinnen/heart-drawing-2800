# Replace Calendly with TidyCal for photo-session booking

## Context
`PhotoSessionBooking` (on each location detail page) opens booking via `react-calendly`'s `PopupModal`, with URLs in `src/config/calendly.ts` (solo / koppel / gezin / owner). TidyCal has no React popup SDK, but supports embedding any booking page/type via a standard iframe. We replace the Calendly modal with our own lightweight modal that iframes the TidyCal booking page — matching the existing design (rounded, quiet, no decorations).

## Changes

### 1. `src/config/calendly.ts` → rename to `src/config/booking.ts`
- Replace the four Calendly URLs with TidyCal booking-type URLs, e.g.:
  ```ts
  export const BOOKING_URLS = {
    solo: "https://tidycal.com/<user>/mijn-mechelen",
    koppel: "https://tidycal.com/<user>/ons-plekje",
    gezin: "https://tidycal.com/<user>/thuis-in-de-stad",
    owner: "https://tidycal.com/<user>/je-favoriete-plek",
  } as const;
  ```
- Placeholder paths kept; final TidyCal URLs needed from the user (or I keep the same slugs).

### 2. `src/components/PhotoSessionBooking.tsx`
- Remove `react-calendly` import and `PopupModal`.
- Add a small self-contained modal (matching site styling):
  - Fixed overlay (dimmed backdrop, click/Escape closes), centered dialog.
  - `<iframe src={openUrl} title="Boek een fotosessie" />` filling the dialog (~90vw × 80vh, rounded corners, border `var(--line)`, surface background).
  - Close button (X) top-right.
  - Body scroll locked while open.
- Drop the Calendly-specific `prefill.customAnswers.a2 = window.location.href` (TidyCal doesn't support prefill via custom answers). Optionally append `?ref=<location-url>` — not supported by TidyCal; skip.

### 3. `src/pages/LocatieDetail.tsx`
- Update import from `@/config/booking` and prop values (no other changes).

### 4. Cleanup
- Remove `react-calendly` from `package.json` (bun remove).
- Delete `src/config/calendly.ts`.

## Notes / limitations
- TidyCal embed = plain iframe; no postMessage prefill like Calendly's `customAnswers`. The current-page-URL prefill (a2) will be lost unless recreated as a TidyCal booking question the invitee fills in manually.
- Payment for sessions: if Calendly handled paid bookings (€55/€75/€95), TidyCal supports payments via Stripe/PayPal per booking type — configure in TidyCal, no code change needed here.

## Needed from you
- The 4 TidyCal booking-type URLs (or confirmation to use placeholder slugs you'll update later).
