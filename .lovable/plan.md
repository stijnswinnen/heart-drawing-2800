## Fix: Calendly prefill targets the wrong field

The screenshot shows the URL landed in the "Deel alsjeblieft alles wat kan helpen…" textarea (the built-in "additional notes" question) instead of the custom **Locatie** field below it.

### Cause

In Calendly's `customAnswers`, `a1` is reserved for the built-in "Please share anything…" notes question. Custom questions added by the organizer start at `a2`. We're currently passing the URL to `a1`, which is why it ends up in the notes box.

### Change

In `src/components/PhotoSessionBooking.tsx`, update the `prefill.customAnswers` key from `a1` to `a2`:

```tsx
prefill={{
  customAnswers: {
    a2: window.location.href,
  },
}}
```

No other changes. All three Calendly events have "Locatie" as their only custom question, so `a2` applies uniformly.

### Verification

Reopen any of the three cards on `/locaties/skatepark` and confirm the URL appears in the **Locatie** field (and the notes textarea is empty).