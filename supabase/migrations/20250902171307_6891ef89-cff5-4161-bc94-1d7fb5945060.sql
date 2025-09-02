BEGIN;

-- Safety: ensure idempotency
DROP TRIGGER IF EXISTS profiles_email_verification_location_update ON public.profiles;

-- 1) Create trigger to update locations when a profile's email_verified flips
CREATE TRIGGER profiles_email_verification_location_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.email_verified IS DISTINCT FROM NEW.email_verified)
EXECUTE FUNCTION public.handle_email_verification_location_update();

-- 2) Temporarily modify the function to allow admin role to change email_verified
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service role and admin role to make privileged changes
  IF coalesce(auth.role(), '') = 'service_role' OR public.is_admin() THEN
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

-- 3) Set email_verified to true for brugge@stijnswinnen.be
UPDATE public.profiles
SET 
  email_verified = true,
  verification_token = NULL,
  verification_token_expires_at = NULL,
  updated_at = NOW()
WHERE email = 'brugge@stijnswinnen.be' 
  AND COALESCE(email_verified, false) = false;

-- 4) Restore the original function
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' AND NOT public.is_admin() THEN
    -- Block attempts to change privileged fields
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
  END IF;
  RETURN NEW;
END;
$$;

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