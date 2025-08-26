-- Final Security Cleanup Migration
-- Fix critical security definer view issue

-- Drop the security definer view that was flagged
DROP VIEW IF EXISTS public.secure_profiles;

-- Create proper is_admin function to avoid recursive RLS issues  
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  );
$function$;

-- Update all admin policies to use the secure function
DROP POLICY IF EXISTS "Admins can view all profiles securely" ON public.profiles;
CREATE POLICY "Authenticated admins can view all profiles" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Tighten remaining anonymous policies where appropriate
-- Keep public access for approved content but restrict sensitive operations

-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view own profile securely" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated' AND auth.uid() = id
);

-- Update drawings policies - keep public read for approved, restrict others
DROP POLICY IF EXISTS "Users can view their own drawings" ON public.drawings;
CREATE POLICY "Authenticated users can view own drawings" ON public.drawings
FOR SELECT USING (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

-- Update locations policies - keep public read for approved, restrict others  
DROP POLICY IF EXISTS "Users can view their own locations" ON public.locations;
CREATE POLICY "Authenticated users can view own locations" ON public.locations
FOR SELECT USING (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

-- Ensure all admin policies use the is_admin function consistently
UPDATE pg_policy 
SET polqual = replace(polqual::text, 
  'EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ''admin''::user_role)))',
  'public.is_admin()')
WHERE polname LIKE '%admin%';