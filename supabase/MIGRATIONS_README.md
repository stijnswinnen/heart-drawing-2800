# Supabase migrations conventions

## Data API grants (required from 30 Oct 2026)

Supabase no longer auto-exposes `public` tables to the Data API (supabase-js,
PostgREST, GraphQL). Every migration that creates a new table in `public` MUST
include explicit `GRANT` statements, otherwise clients get a `42501` error.

Use this template for every new table:

```sql
create table public.example (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now()
);

-- Data API exposure (required)
grant select                         on public.example to anon;
grant select, insert, update, delete on public.example to authenticated;
grant select, insert, update, delete on public.example to service_role;

alter table public.example enable row level security;

-- then add RLS policies
```

Verb sets per table type:
- **Public read-only reference data** → `grant select` to `anon` + `authenticated`.
- **User-owned data** → `select` to `anon` only if rows are public; full CRUD to `authenticated`; full CRUD to `service_role` for edge functions.
- **Admin-only / internal** → grants only to `service_role`.

Existing tables created before this convention keep their legacy grants and do
not need backfilling.
