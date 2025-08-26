-- Additional Security Fixes Migration
-- Fix remaining function search path issues

-- Fix moddatetime function 
CREATE OR REPLACE FUNCTION public.moddatetime()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix set_admin_role function
CREATE OR REPLACE FUNCTION public.set_admin_role(user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE id = (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$function$;

-- Fix get_public_profile function
CREATE OR REPLACE FUNCTION public.get_public_profile(p_id uuid)
 RETURNS TABLE(id uuid, name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, name
  FROM public.profiles
  WHERE id = p_id;
$function$;

-- Fix get_profile_minimal_by_email function  
CREATE OR REPLACE FUNCTION public.get_profile_minimal_by_email(p_email text)
 RETURNS TABLE(id uuid, email_verified boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, coalesce(email_verified, false) AS email_verified
  FROM public.profiles
  WHERE email = p_email
  LIMIT 1;
$function$;

-- Restrict anonymous access where it's not intentionally public
-- Remove anonymous access from profiles update policy
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id AND auth.role() = 'authenticated')
WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');

-- Tighten drawings policies - remove anonymous access from admin operations  
DROP POLICY IF EXISTS "Admins can view all drawings" ON public.drawings;
DROP POLICY IF EXISTS "Admins can update drawing status" ON public.drawings;  
DROP POLICY IF EXISTS "Admins can delete drawings" ON public.drawings;
DROP POLICY IF EXISTS "Admins can insert drawings" ON public.drawings;

CREATE POLICY "Authenticated admins can view all drawings" ON public.drawings
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can update drawing status" ON public.drawings  
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can delete drawings" ON public.drawings
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles  
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can insert drawings" ON public.drawings
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Tighten locations policies - remove anonymous access from admin operations
DROP POLICY IF EXISTS "Admins can view all locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can update location status" ON public.locations;
DROP POLICY IF EXISTS "Admins can delete locations" ON public.locations;

CREATE POLICY "Authenticated admins can view all locations" ON public.locations
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can update location status" ON public.locations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can delete locations" ON public.locations  
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'  
  )
);

-- Tighten security logs access
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;

CREATE POLICY "Authenticated admins can view security logs" ON public.security_logs
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Tighten video generation access
DROP POLICY IF EXISTS "Only admins can update video generation" ON public.video_generation;

CREATE POLICY "Authenticated admins can update video generation" ON public.video_generation
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);