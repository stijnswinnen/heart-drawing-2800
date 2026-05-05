## Problem

When the user clicks the password reset link, they land on `/reset-password` and immediately see **"Ongeldige of verlopen reset link"** — even though the link is valid.

## Root cause

The auth logs confirm the link itself works: Supabase's `/verify` endpoint returns a 303 redirect to `/reset-password#access_token=...&type=recovery&...` and an actual `login` auth event is recorded server-side. So the token is consumed correctly the first time.

The bug is in `src/pages/ResetPassword.tsx`:

```ts
useEffect(() => {
  const validateSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Ongeldige of verlopen reset link");
      navigate("/");
    }
    ...
  };
  validateSession();
}, []);
```

`supabase.auth.getSession()` is called **synchronously on mount**, but `detectSessionInUrl` parses the recovery hash **asynchronously**. On the first render the hash hasn't been processed yet, so `session` is `null` → we toast the error and redirect to `/`. By the time the user clicks the link again the one-time token is already consumed (which then matches the second cluster of `One-time token not found` entries in the auth logs at 22:36, 22:37, 22:39 — those are the user retrying after we wrongly bounced them).

## Fix

Change `ResetPassword.tsx` to subscribe to `onAuthStateChange` and accept the session via the `PASSWORD_RECOVERY` / `SIGNED_IN` event, with `getSession()` only as a fallback:

1. On mount, register `supabase.auth.onAuthStateChange((event, session) => ...)`. When `event === 'PASSWORD_RECOVERY'` (or any event with a valid session), set `validatingToken = false`.
2. Also call `getSession()` once for the case where the hash was already processed before we subscribed.
3. Only show the "Ongeldige of verlopen reset link" toast after a short grace period (e.g. 1.5s) with no session and no recovery event — not synchronously on first render.
4. Unsubscribe on unmount.

No other files need changes. The edge function, the email link, and the `Auth.tsx` reset form are all working correctly (auth log shows the recovery link does its job on first click).

## File to touch

- `src/pages/ResetPassword.tsx` — rewrite the `useEffect` validation block as described.

## Out of scope

- No edge function changes.
- No DB / SQL changes.
- Magic-link flow is unrelated.
