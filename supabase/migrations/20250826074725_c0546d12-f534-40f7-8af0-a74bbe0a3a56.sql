-- Tighten profiles table access and add helper functions

-- 1) Helper function to check admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- 2) Restrict profiles SELECT; remove overly-permissive policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- (Optional) keep existing UPDATE-by-id policy as-is; ensure it exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Enable update for users based on id'
  ) THEN
    CREATE POLICY "Enable update for users based on id"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3) Public-safe RPC to fetch only non-sensitive profile info for display
CREATE OR REPLACE FUNCTION public.get_public_profile(p_id uuid)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name
  FROM public.profiles
  WHERE id = p_id;
$$;

-- 4) Minimal lookup by email for submission flows (returns only id and email_verified)
CREATE OR REPLACE FUNCTION public.get_profile_minimal_by_email(p_email text)
RETURNS TABLE (id uuid, email_verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, coalesce(email_verified, false) AS email_verified
  FROM public.profiles
  WHERE email = p_email
  LIMIT 1;
$$;

-- 5) Safe email verification RPC that performs the check + update server-side
CREATE OR REPLACE FUNCTION public.verify_profile(p_email text, p_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ok boolean := false;
BEGIN
  -- Only verify when token matches and (optionally) not already verified
  UPDATE public.profiles
  SET email_verified = true,
      verification_token = NULL,
      verification_token_expires_at = NULL,
      updated_at = timezone('utc', now())
  WHERE email = p_email
    AND verification_token = p_token
  RETURNING true INTO _ok;

  RETURN COALESCE(_ok, false);
END;
$$;

-- 6) Ensure callers can execute the RPCs
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_minimal_by_email(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_profile(text, uuid) TO anon, authenticated;