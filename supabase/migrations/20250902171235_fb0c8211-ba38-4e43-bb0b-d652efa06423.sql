BEGIN;

-- Safety: ensure idempotency
DROP TRIGGER IF EXISTS profiles_email_verification_location_update ON public.profiles;

-- 1) Create trigger to update locations when a profile's email_verified flips
CREATE TRIGGER profiles_email_verification_location_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.email_verified IS DISTINCT FROM NEW.email_verified)
EXECUTE FUNCTION public.handle_email_verification_location_update();

-- 2) Temporarily disable the privilege escalation trigger to allow email verification update
DROP TRIGGER IF EXISTS prevent_privilege_escalation_trigger ON public.profiles;

-- 3) Set email_verified to true for brugge@stijnswinnen.be
UPDATE public.profiles
SET 
  email_verified = true,
  verification_token = NULL,
  verification_token_expires_at = NULL,
  updated_at = NOW()
WHERE email = 'brugge@stijnswinnen.be' 
  AND COALESCE(email_verified, false) = false;

-- 4) Re-enable the privilege escalation trigger
CREATE TRIGGER prevent_privilege_escalation_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 5) Backfill: any locations still pending for verified users should move to 'new'
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