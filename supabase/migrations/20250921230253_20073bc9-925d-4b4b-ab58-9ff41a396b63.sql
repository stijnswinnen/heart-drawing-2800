-- Create function to cleanup unverified profiles
CREATE OR REPLACE FUNCTION public.cleanup_unverified_profiles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _count integer := 0;
  _profile_record RECORD;
BEGIN
  -- Log the start of cleanup
  INSERT INTO public.security_logs (event_type, details)
  VALUES (
    'cleanup_start',
    jsonb_build_object(
      'action', 'unverified_profiles_cleanup',
      'timestamp', NOW()
    )
  );

  -- Find and delete unverified profiles older than 48 hours with no associated drawings
  FOR _profile_record IN
    SELECT p.id, p.email, p.created_at
    FROM public.profiles p
    LEFT JOIN public.drawings d ON p.id = d.heart_user_id
    WHERE p.email_verified = false
      AND p.created_at < NOW() - INTERVAL '48 hours'
      AND d.id IS NULL -- No associated drawings
  LOOP
    -- Log what we're about to delete
    INSERT INTO public.security_logs (event_type, details)
    VALUES (
      'profile_cleanup',
      jsonb_build_object(
        'profile_id', _profile_record.id,
        'email', _profile_record.email,
        'created_at', _profile_record.created_at,
        'reason', 'unverified_older_than_48h_no_drawings'
      )
    );

    -- Delete the profile
    DELETE FROM public.profiles WHERE id = _profile_record.id;
    _count := _count + 1;
  END LOOP;

  -- Log the completion
  INSERT INTO public.security_logs (event_type, details)
  VALUES (
    'cleanup_complete',
    jsonb_build_object(
      'action', 'unverified_profiles_cleanup',
      'profiles_removed', _count,
      'timestamp', NOW()
    )
  );

  RETURN _count;
END;
$$;

-- Schedule the cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-unverified-profiles-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://webocybzloqwnyxpquam.supabase.co/functions/v1/cleanup-unverified-profiles',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYm9jeWJ6bG9xd255eHBxdWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDczNDMsImV4cCI6MjA0OTE4MzM0M30.mi3mWYq3hk2CqpFf8Ba9x5VT-Jv2H8pxv3np7MDOKXQ"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);