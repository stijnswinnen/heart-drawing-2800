
-- Switch verification_token from plaintext UUID to SHA-256 hex hash storage
ALTER TABLE public.profiles
  ALTER COLUMN verification_token TYPE text USING verification_token::text;

-- Invalidate any existing plaintext tokens (force re-issue)
UPDATE public.profiles
  SET verification_token = NULL,
      verification_token_expires_at = NULL
  WHERE verification_token IS NOT NULL;

-- Recreate verify_user_email to accept plaintext token, hash, then compare
DROP FUNCTION IF EXISTS public.verify_user_email(text, uuid);
CREATE OR REPLACE FUNCTION public.verify_user_email(p_email text, p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _profile_id uuid;
  _verified boolean := false;
  _hash text;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 THEN
    RETURN json_build_object('success', false, 'message', 'Invalid token');
  END IF;

  _hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT id INTO _profile_id
  FROM public.profiles
  WHERE email = p_email
    AND verification_token = _hash
    AND verification_token_expires_at > NOW()
    AND NOT COALESCE(email_verified, false);

  IF _profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET email_verified = true,
        verification_token = NULL,
        verification_token_expires_at = NULL,
        updated_at = NOW()
    WHERE id = _profile_id;
    _verified := true;
  END IF;

  RETURN json_build_object(
    'success', _verified,
    'message', CASE WHEN _verified THEN 'Email verified successfully'
                    ELSE 'Invalid or expired verification token' END
  );
END;
$function$;

-- Recreate verify_profile_secure with text token signature
DROP FUNCTION IF EXISTS public.verify_profile_secure(text, uuid);
CREATE OR REPLACE FUNCTION public.verify_profile_secure(p_email text, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _result json;
  _success boolean;
BEGIN
  _result := public.verify_user_email(p_email, p_token);
  _success := (_result->>'success')::boolean;

  INSERT INTO public.security_logs (event_type, details)
  VALUES (
    'email_verification_attempt',
    json_build_object('email', p_email, 'success', _success, 'timestamp', NOW())
  );

  RETURN _success;
END;
$function$;

-- Ensure pgcrypto/digest is available (extensions schema)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop the auto-generate trigger function side effect: trigger generated UUID tokens.
-- Replace it to no longer auto-set the token (edge function controls token issuance).
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Token is now issued and hashed by the send-verification-email edge function.
  -- Keep timestamp behaviour for backward compatibility.
  NEW.last_verification_email_sent_at := NOW();
  RETURN NEW;
END;
$function$;
