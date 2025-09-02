BEGIN;

-- 1) Create/replace privilege escalation guard to allow system contexts (no JWT)
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _jwt_sub text;
BEGIN
  -- Read JWT subject if present; when absent, we're in a system context (migrations, background jobs)
  BEGIN
    _jwt_sub := nullif(current_setting('request.jwt.claim.sub', true), '');
  EXCEPTION WHEN others THEN
    _jwt_sub := NULL;
  END;

  -- Allow in these cases: service_role, admin, or no JWT (system context)
  IF coalesce(auth.role(), '') = 'service_role' OR public.is_admin() OR _jwt_sub IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Block attempts to change privileged fields for regular users
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Not allowed to change role';
  END IF;
  IF NEW.email_verified IS DISTINCT FROM OLD.email_verified THEN
    RAISE EXCEPTION 'Not allowed to change email_verified';
  END IF;
  IF NEW.verification_token IS DISTINCT FROM OLD.verification_token
     OR NEW.verification_token_expires_at IS DISTINCT FROM OLD.verification_token_expires_at
     OR NEW.last_verification_email_sent_at IS DISTINCT FROM OLD.last_verification_email_sent_at
  THEN
    RAISE EXCEPTION 'Not allowed to change verification token fields';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Not allowed to change email directly';
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Ensure trigger exists to update locations when email_verified flips
DROP TRIGGER IF EXISTS profiles_email_verification_location_update ON public.profiles;
CREATE TRIGGER profiles_email_verification_location_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.email_verified IS DISTINCT FROM NEW.email_verified)
EXECUTE FUNCTION public.handle_email_verification_location_update();

-- 3) Verify email for the specified user (idempotent)
UPDATE public.profiles
SET 
  email_verified = true,
  verification_token = NULL,
  verification_token_expires_at = NULL,
  updated_at = NOW()
WHERE email = 'brugge@stijnswinnen.be' 
  AND COALESCE(email_verified, false) = false;

-- 4) Backfill locations pending_verification -> new for verified users
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