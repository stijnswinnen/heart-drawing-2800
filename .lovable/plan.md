## Prefill Calendly "Locatie" question with current URL

Add a `prefill` prop to the `PopupModal` in `src/components/PhotoSessionBooking.tsx` so that the custom "Locatie" question on each Calendly event is automatically filled with the current location detail page URL.

### Change

In `PhotoSessionBooking.tsx` (around lines 282–289), extend the `PopupModal` with:

```tsx
prefill={{
  customAnswers: {
    a1: window.location.href,
  },
}}
```

`a1` is Calendly's identifier for the first custom question on the event type. Since "Locatie" was added as the (only/first) custom question on all three events, `a1` targets it consistently.

### Notes

- No new props on `PhotoSessionBooking` needed — `window.location.href` already reflects `/locaties/:slug`.
- `PopupModal` only mounts client-side (guarded by `rootEl`), so `window` is safe to read.
- No styling, copy, or data-loading changes.

### Verification

After implementation: open a card on `/locaties/skatepark`, confirm the Calendly modal loads, and the "Locatie" field is pre-populated with the full page URL.