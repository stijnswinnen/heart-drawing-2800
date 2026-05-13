## Context

Supabase is changing the default for the Data API:
- **New projects** (after 30 May): tables in `public` are no longer auto-exposed.
- **Existing projects** (this one included) get the same behaviour on **30 Oct**.
- Existing tables keep their current grants — nothing breaks today.
- Only **new** tables created in `public` after the cutover need explicit `GRANT` statements before `supabase-js` / PostgREST / GraphQL can read or write them.

This project's current 8 tables (`profiles`, `locations`, `drawings`, `location_likes`, `categories`, `security_logs`, `video_jobs`, `video_generation`) already have the legacy grants and will continue to work.

## Plan

The fix is a **convention change**, not a code change to existing files. From now on, every migration that creates a table in `public` must:

1. Create the table.
2. `GRANT` the appropriate verbs to `anon`, `authenticated`, `service_role`.
3. Enable RLS.
4. Add RLS policies.

### Standard template to use in every future `CREATE TABLE` migration

```sql
create table public.example (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ...
  created_at timestamptz not null default now()
);

-- Data API exposure (required from 30 Oct 2026)
grant select                         on public.example to anon;
grant select, insert, update, delete on public.example to authenticated;
grant select, insert, update, delete on public.example to service_role;

alter table public.example enable row level security;

create policy "..." on public.example for select to authenticated using (...);
-- etc.
```

Pick the verb set per table:
- **Public read-only reference data** → `grant select` to `anon` + `authenticated`.
- **User-owned data** → `select` to `anon` only if rows are public; full CRUD to `authenticated`; full CRUD to `service_role` for edge functions.
- **Admin-only / internal** → grants only to `service_role`; revoke from `anon`/`authenticated`.

### What does NOT need to change now

- No backfill migration. Existing tables keep their grants.
- No edge-function or client code changes.
- No action required before 30 Oct.

### Optional safety net (recommended but not required)

Add a one-line note at the top of `supabase/migrations/` (e.g. a `README.md`) reminding future contributors and the AI agent to include the `GRANT` block whenever creating a new public table. This prevents a silent `42501` error later.

## Out of scope

- The other open security findings in the panel (set_admin_role, hearts bucket, open edge functions, etc.) — those are tracked separately and are unrelated to this Data API change.
