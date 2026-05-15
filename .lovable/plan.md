## Goal

Replace the cycling PNG on `/hearts` with a looping, controls-free MP4 of all approved hearts. Fall back to the current cycling behavior when no rendered video exists.

## Approach

Reuse the existing `video_jobs` pipeline — no new tables, no scheduler. Track the "current loop video" via an admin-selected job and read its `video_path` on the public page.

### 1. Database

Add a small singleton table to point at the active loop video:

```
public.hearts_loop_video
  id              uuid pk default gen_random_uuid()
  video_path      text not null      -- path inside the `videos` bucket
  video_job_id    uuid               -- reference to video_jobs.id (nullable)
  updated_at      timestamptz default now()
```

- RLS: anyone can SELECT (public page reads it); only admins can INSERT/UPDATE/DELETE.
- Explicit GRANTs to `anon`, `authenticated`, `service_role` (per project memory).
- Enforce single row via a partial unique index on a constant column, or simply upsert one row by a fixed sentinel id from the admin action.

### 2. Admin: "Rebuild loop" action

In `src/components/admin/VideoGrid.tsx`:
- Add a "Stel in als /hearts loop" button on each completed job row (rows where `status = 'completed' && video_path` exists).
- Clicking it upserts `hearts_loop_video` with that job's `video_path` + `video_job_id`.
- Show a small badge "Actief op /hearts" on the currently-selected job.
- No new edge function — direct supabase client write is fine since admin RLS already gates it.

To rebuild a fresh loop, the admin uses the existing "Generate video" flow (already in the page), waits for it to complete, then clicks "Stel in als /hearts loop". Manual, no schedule.

### 3. Public `/hearts` page

Refactor `src/components/RandomApprovedHeart.tsx` (or split into `HeartsLoopVideo.tsx` + keep current as fallback):

- On mount, query `hearts_loop_video` (single row).
- If a `video_path` exists → render `<video autoPlay muted loop playsInline>` (no `controls`) inside the existing 250×250 / 300×300 square next to the `2800` heading. Keep the current side-by-side layout.
- If query returns no row OR the video fails to load → fall back to existing cycling-PNG behavior.
- Use `getPublicUrl('videos', path)` for the source.

### 4. Out of scope

- No automated re-render on new approvals.
- No changes to `video-jobs-create` / ffmpeg pipeline.
- No changes to admin moderation, drawings RLS, or storage buckets.

## Verification

1. Run migration → confirm table + policies + grants.
2. On `/admin` Video Management, generate a loop, then click "Stel in als /hearts loop" on the completed job.
3. Open `/hearts` → video plays muted, loops, no controls visible, sits beside `2800` heading.
4. Delete the row in `hearts_loop_video` → `/hearts` reverts to cycling PNGs.
5. Network tab: only one mp4 request on page load (vs many PNG requests today).
