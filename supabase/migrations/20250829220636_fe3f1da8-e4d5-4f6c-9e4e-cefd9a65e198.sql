-- Disable legacy cron jobs that invoke old video generation edge functions
-- Safely enable required extensions (no-op if already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Unschedule any known job names
do $$
begin
  -- Unschedule by common jobnames used previously
  if exists (select 1 from pg_catalog.pg_namespace where nspname = 'cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname in (
      'generate_daily_video',
      'generate_archive_video',
      'setup_video_generation_cron',
      'invoke_generate_daily_video',
      'invoke_generate_video'
    );

    -- Unschedule by command pattern (edge function URLs)
    perform cron.unschedule(jobid)
    from cron.job
    where command ilike '%functions/v1/generate-daily-video%'
       or command ilike '%functions/v1/generate-video%'
       or command ilike '%setup-video-cron%';
  end if;
exception when others then
  -- Ignore any errors to keep migration idempotent
  null;
end$$;

-- Optionally drop obsolete RPC if it exists (no-op otherwise)
drop function if exists public.setup_video_generation_cron();