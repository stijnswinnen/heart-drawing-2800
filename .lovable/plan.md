## Why /admin keeps refreshing

The console shows `Auth state changed: SIGNED_IN anendel@gmail.com` once every second. Only `src/pages/Auth.tsx` and `src/components/auth/AuthDialogContent.tsx` log that exact message (with the email). Neither belongs on `/admin`, so something is bouncing the user between `/admin` and `/auth` continuously.

Looking at `src/pages/Admin.tsx`:

```ts
useEffect(() => {
  if (!session) navigate("/auth");
}, [session, navigate]);

useEffect(() => {
  if (profile && profile.role !== "admin") {
    toast.error("You don't have permission to access this page");
    navigate("/auth");
  }
}, [profile, navigate]);
```

And `src/pages/Auth.tsx`:

```ts
useEffect(() => {
  if (session) navigate('/admin');
}, [session, navigate]);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    toast.success('Succesvol ingelogd!');
    navigate('/admin');
  }
});
```

The loop:

1. `Admin` mounts. `useSession()` from `@supabase/auth-helpers-react` initially returns `null` for one tick while it reads storage → first effect fires → `navigate('/auth')`.
2. `Auth` mounts. Its `onAuthStateChange` subscription is attached. Supabase replays the current session as a `SIGNED_IN` event → toast + `navigate('/admin')`.
3. Back on `/admin`, `useSession()` is `null` again on the first render after the route change → step 1 repeats.

Each loop emits one `SIGNED_IN` log + toast — exactly what the console shows.

Two compounding issues:

- `Admin` decides to redirect before knowing whether `session` and `profile` are still loading.
- `Auth` redirects on every `SIGNED_IN` event, including the synthetic one Supabase fires when the listener is attached for an already-signed-in user.

## Fix

### 1. `src/pages/Admin.tsx` — wait for auth + profile to finish loading

- Replace the bare `useSession()` check with the loading-aware pattern:
  - Use `useSessionContext()` from `@supabase/auth-helpers-react` to get `{ session, isLoading: isSessionLoading }`.
  - Track the profile query's `isLoading` / `isFetched` from `useQuery`.
- Render a small loading state (or `null`) while `isSessionLoading` is true OR the profile query hasn't settled.
- Only run the redirect effects after loading has finished:
  - `if (!isSessionLoading && !session) navigate('/auth')`
  - `if (profileQuery.isFetched && profile && profile.role !== 'admin') { toast.error(...); navigate('/auth') }`
- Remove the `navigate('/')` side-effect that lives inside the `queryFn` — query functions should not navigate.

### 2. `src/pages/Auth.tsx` — don't redirect on the replayed SIGNED_IN

- Remove the `navigate('/admin')` (and the toast) from inside the `onAuthStateChange` handler. The separate `useEffect` that watches `session` already handles redirecting an already-signed-in user to `/admin`. Keeping both causes a redirect every time the listener replays the current session.
- Keep the toast only for an actual fresh sign-in. Easiest: track `prevSession` with a ref and only show the toast + navigate when transitioning from no session → session.

### 3. (Defensive) Reduce noisy `Auth state changed` logs

Lower these to `console.debug` (or remove the email from the log) in `Auth.tsx`, `AuthDialogContent.tsx`, and `useAuthStateChange.ts` so future loops are easier to spot and to avoid leaking the email address to the console.

## Out of scope

- No changes to FFmpeg/video pipeline.
- No changes to `DrawingGrid` rendering or storage URL helpers.
- No schema/RLS changes.

## Verification

After implementing:
1. Sign in as the admin and land on `/admin`.
2. Confirm `Auth state changed: SIGNED_IN` appears at most once (on the actual sign-in), not every second.
3. Refresh `/admin` while signed in — page should render without flicker, no toast spam.
4. Visit `/admin` while signed out — should redirect to `/auth` exactly once.
