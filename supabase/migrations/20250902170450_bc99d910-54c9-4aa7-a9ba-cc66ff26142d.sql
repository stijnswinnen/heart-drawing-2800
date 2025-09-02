
BEGIN;

-- 1) Create trigger to update locations when a profile’s email_verified flips
CREATE TRIGGER profiles_email_verification_location_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.email_verified IS DISTINCT FROM NEW.email_verified)
EXECUTE FUNCTION public.handle_email_verification_location_update();

-- 2) Try verifying the reported email using the stored token (only succeeds if valid and unexpired)
--    This mirrors the intended behavior of the verification link.
SELECT public.verify_user_email(
  'brugge@stijnswinnen.be',
  (SELECT verification_token FROM public.profiles WHERE email = 'brugge@stijnswinnen.be')::uuid
);

-- 3) Backfill: any locations still pending for verified users should move to 'new'
UPDATE public.locations l
SET status = 'new'::location_status,
    updated_at = NOW()
WHERE l.status = 'pending_verification'::location_status
  AND l.heart_user_id IN (
    SELECT p.id
    FROM public.profiles p
    WHERE COALESCE(p.email_verified, false) = true
  );

COMMIT;
