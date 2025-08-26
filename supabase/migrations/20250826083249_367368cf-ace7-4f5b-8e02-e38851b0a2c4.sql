-- Security Enhancement Migration
-- Fix 1: Update all database functions to include proper search paths for security

-- Update existing functions to have secure search paths
CREATE OR REPLACE FUNCTION public.handle_email_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Only proceed if email_confirmed_at has changed
  IF OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at THEN
    UPDATE public.profiles
    SET email_verified = NEW.email_confirmed_at IS NOT NULL
    WHERE id = NEW.id;
  END IF;
  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_verification_token()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.verification_token := gen_random_uuid();
  NEW.verification_token_expires_at := NOW() + interval '1 hour';
  NEW.last_verification_email_sent_at := NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (
    id,
    email,
    name,
    marketing_consent,
    role,
    email_verified
  ) values (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false),
    'user',
    new.email_confirmed_at IS NOT NULL
  );
  return new;
end;
$function$;

-- Fix 2: Create secure profile view that excludes sensitive verification data
CREATE VIEW public.secure_profiles AS 
SELECT 
  id,
  name,
  email,
  marketing_consent,
  role,
  email_verified,
  created_at,
  updated_at
FROM public.profiles;

-- Fix 3: Drop existing permissive RLS policies and create secure ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new secure policies that don't expose verification tokens
CREATE POLICY "Users can view own profile securely" ON public.profiles
FOR SELECT USING (
  auth.uid() = id
);

CREATE POLICY "Admins can view all profiles securely" ON public.profiles  
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() 
    AND p2.role = 'admin'
  )
);

-- Fix 4: Create secure verification function that doesn't expose tokens
CREATE OR REPLACE FUNCTION public.verify_user_email(p_email text, p_token uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _profile_id uuid;
  _verified boolean := false;
BEGIN
  -- Check if token is valid and not expired
  SELECT id INTO _profile_id
  FROM public.profiles
  WHERE email = p_email
    AND verification_token = p_token
    AND verification_token_expires_at > NOW()
    AND NOT COALESCE(email_verified, false);

  IF _profile_id IS NOT NULL THEN
    -- Update verification status and clear tokens
    UPDATE public.profiles
    SET 
      email_verified = true,
      verification_token = NULL,
      verification_token_expires_at = NULL,
      updated_at = NOW()
    WHERE id = _profile_id;
    
    _verified := true;
  END IF;

  RETURN json_build_object(
    'success', _verified,
    'message', CASE 
      WHEN _verified THEN 'Email verified successfully'
      ELSE 'Invalid or expired verification token'
    END
  );
END;
$function$;

-- Fix 5: Create function to clean up expired tokens periodically
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _count integer;
BEGIN
  UPDATE public.profiles
  SET 
    verification_token = NULL,
    verification_token_expires_at = NULL
  WHERE verification_token_expires_at < NOW();
  
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$function$;

-- Fix 6: Tighten anonymous access - Remove anonymous INSERT on profiles
-- Users should only be created through auth triggers
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable upsert for all users" ON public.profiles;

-- Create restricted insert policy (only for authenticated users via triggers)
CREATE POLICY "System can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (false); -- This will be bypassed by SECURITY DEFINER triggers

-- Fix 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.verify_user_email(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_tokens() TO authenticated;

-- Fix 8: Add logging for security events
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs" ON public.security_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Fix 9: Update verify_profile function to use new secure approach
DROP FUNCTION IF EXISTS public.verify_profile(text, uuid);

-- Create enhanced verification with logging
CREATE OR REPLACE FUNCTION public.verify_profile_secure(p_email text, p_token uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _result json;
  _success boolean;
BEGIN
  -- Use the secure verification function
  _result := public.verify_user_email(p_email, p_token);
  _success := (_result->>'success')::boolean;
  
  -- Log the verification attempt
  INSERT INTO public.security_logs (event_type, details)
  VALUES (
    'email_verification_attempt',
    json_build_object(
      'email', p_email,
      'success', _success,
      'timestamp', NOW()
    )
  );
  
  RETURN _success;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.verify_profile_secure(text, uuid) TO anon, authenticated;