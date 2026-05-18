# Approval confirmation email for location submitters

When an admin approves a submitted plek, send a Dutch confirmation email to the submitter using the existing shared `renderEmail` template, including a direct link to the location page. If the location has the free photo session booking enabled, mention it in the email body.

## 1. Extend the edge function `send-location-notification`

Add a new `action: "approved"` branch alongside `"rejected"` / `"deleted"`.

The handler will:
- Fetch the location (already does), additionally selecting `name`, `photo_session_hidden`.
- Fetch all approved locations and the just-approved location, then build the same slug (using the same algorithm as `src/utils/slug.ts`: lowercase, ASCII, dash-separated, deduped by appending `-2`, `-3`, … in id-sorted order) so the URL matches what the site uses (`/locaties/:slug`).
- Compose the email with `renderEmail({...})`:
  - **Subject:** `"Je favoriete plek staat online"`
  - **Heading:** `"Je plek is goedgekeurd"`
  - **Body (Dutch):**
    - Greeting with submitter name
    - "Je ingediende plek '<name>' is goedgekeurd en staat nu live op 2800.love."
    - If `photo_session_hidden !== true`: extra paragraph — "Als indiener van deze plek kan je een **gratis fotosessie** aanvragen op deze locatie. Klik op de knop hieronder en boek je sessie via de locatiepagina."
  - **CTA:** `"Bekijk je plek"` → `https://2800.love/locaties/<slug>?utm_source=email&utm_medium=transactional&utm_campaign=location-approved`
- Send via Resend with the existing `from: "2800.love <noreply@2800.love>"`.

The slug-building logic will be inlined in the edge function (small, ~10 lines) to avoid a shared-module import.

## 2. Wire the trigger in `src/components/admin/AdminContent.tsx`

Update `handleApproveLocation` (currently just updates status + toast) to invoke the function after a successful status update, mirroring the rejection/deletion pattern:

```ts
try {
  await supabase.functions.invoke('send-location-notification', {
    body: { locationId: location.id, action: "approved" }
  });
  toast.success("Locatie goedgekeurd en gebruiker genotificeerd");
} catch (emailError) {
  console.error("Error sending notification:", emailError);
  toast.warning("Locatie goedgekeurd, maar notificatie mislukt");
}
```

Also consider `handleSaveLocation` in the same file: when the edit dialog changes a location's status from non-approved to `approved`, send the same email. This covers the case where an admin approves via the edit dialog instead of the quick-approve button. Implementation: compare `editingLocation.status` to `updates.status` and trigger the invoke if it transitions to `"approved"`.

## Out of scope

- No schema changes.
- No new edge function (extending existing one).
- No idempotency table — relying on admin not re-approving an already-approved location, same as current rejected/deleted flow.

## Technical notes

- The function uses the legacy direct-Resend pattern (not the Lovable Emails queue), matching the existing `send-location-notification`, `send-heart-notification`, `send-verification-email` setup in this project. Keeping the same pattern for consistency.
- `photo_session_hidden` is a boolean field on `locations` already used in `LocatieDetail.tsx` to gate the `<PhotoSessionBooking>` component, so the same check determines whether to mention the photo session offer in the email.
