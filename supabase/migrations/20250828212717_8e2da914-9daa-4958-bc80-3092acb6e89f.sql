-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Seed the video_generation table with an initial row if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.video_generation) THEN
    INSERT INTO public.video_generation DEFAULT VALUES;
  END IF;
END $$;

-- Create RPC to setup the cron job that invokes the generate-video function every 15 minutes
CREATE OR REPLACE FUNCTION public.setup_video_generation_cron()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _job_id bigint;
  _job_name text := 'generate-approved-hearts-video';
BEGIN
  -- Remove existing job with same name to avoid duplicates
  PERFORM cron.unschedule(_job_name);

  -- Schedule the job (every 15 minutes)
  SELECT cron.schedule(
    _job_name,
    '*/15 * * * *',
    'SELECT net.http_post(
      url => ''https://webocybzloqwnyxpquam.supabase.co/functions/v1/generate-video'',
      headers => ''{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYm9jeWJ6bG9xd255eHBxdWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDczNDMsImV4cCI6MjA0OTE4MzM0M30.mi3mWYq3hk2CqpFf8Ba9x5VT-Jv2H8pxv3np7MDOKXQ"}''::jsonb,
      body => ''{"source":"cron"}''::jsonb
    )'
  ) INTO _job_id;

  RETURN json_build_object(
    'status', 'scheduled',
    'job_name', _job_name,
    'job_id', _job_id
  );
END;
$$;