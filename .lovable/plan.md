# Update approved heart confirmation email

Edit `supabase/functions/send-heart-notification/index.ts` in the `action === "approved"` branch:

1. **CTA URL** — replace the per-heart link with a fixed link:
   - From: `https://2800.love/hearts/{drawingId}?utm_...&utm_content=bekijk-hartje`
   - To: `https://2800.love/hearts` (no UTM params, fixed)

2. **Body copy** — replace the current two paragraphs with:
   ```
   Hallo {firstname}

   Je getekende hart is goedgekeurd en staat nu live op 2800.love. Bedankt dat je je creativiteit deelt. Je bijdrage maakt 2800.love mooier!
   ```
   - `{firstname}` = first token of `profile.name` (split on whitespace). Fallback to "daar" when name is missing, matching the existing pattern.
   - Render as two `<p>` tags (greeting + message), HTML-escaped.

3. Leave subject (`"Je hartje staat online"`), preheader, heading, and CTA label unchanged. Rejected-email branch untouched.

After edit, redeploy the `send-heart-notification` edge function.
