-- Security hardening migration: prevent role escalation, add admin update policy, audit logging, input validation, and fix storage delete policy

-- 1) Allow admins to update any profile (not just their own)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- 2) Prevent privilege escalation on profiles by blocking sensitive field changes from non-admins/non-service
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

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 3) Audit logging for role changes
CREATE OR REPLACE FUNCTION public.log_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor uuid := NULL;
BEGIN
  -- Try to capture the actor from the JWT if available
  BEGIN
    actor := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  EXCEPTION WHEN others THEN
    actor := NULL;
  END;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.security_logs (event_type, user_id, details)
    VALUES (
      'profile_role_change',
      actor,
      jsonb_build_object(
        'profile_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'timestamp', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_profile_role_changes ON public.profiles;
CREATE TRIGGER trg_log_profile_role_changes
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_role_changes();

-- 4) Input validation for locations (coordinates and text lengths)
CREATE OR REPLACE FUNCTION public.validate_locations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Coordinates required
  IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
    RAISE EXCEPTION 'Latitude and longitude are required';
  END IF;

  -- Coordinate ranges
  IF NEW.latitude::numeric < -90 OR NEW.latitude::numeric > 90 THEN
    RAISE EXCEPTION 'Latitude must be between -90 and 90';
  END IF;
  IF NEW.longitude::numeric < -180 OR NEW.longitude::numeric > 180 THEN
    RAISE EXCEPTION 'Longitude must be between -180 and 180';
  END IF;

  -- Length limits
  IF length(coalesce(NEW.name, '')) > 120 THEN
    RAISE EXCEPTION 'Name too long (max 120)';
  END IF;
  IF length(coalesce(NEW.description, '')) > 2000 THEN
    RAISE EXCEPTION 'Description too long (max 2000)';
  END IF;
  IF length(coalesce(NEW.recommendation, '')) > 2000 THEN
    RAISE EXCEPTION 'Recommendation too long (max 2000)';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_locations_insupd ON public.locations;
CREATE TRIGGER trg_validate_locations_insupd
BEFORE INSERT OR UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.validate_locations();

-- 5) Storage policy hardening: prevent anonymous deletes from hearts bucket
DROP POLICY IF EXISTS "Allow anonymous deletes from hearts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hearts objects" ON storage.objects;
CREATE POLICY "Admins can delete hearts objects"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hearts' AND public.is_admin());

-- 6) Ensure secure_profiles is not publicly accessible (defense-in-depth)
ALTER TABLE IF EXISTS public.secure_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No direct access to secure_profiles" ON public.secure_profiles;
CREATE POLICY "No direct access to secure_profiles"
ON public.secure_profiles
FOR ALL
USING (false)
WITH CHECK (false);
