-- Fix infinite recursion in profiles policies by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies and recreate them
DROP POLICY IF EXISTS "Authenticated admins can view all drawings" ON public.drawings;
DROP POLICY IF EXISTS "Authenticated admins can update drawing status" ON public.drawings;  
DROP POLICY IF EXISTS "Authenticated admins can delete drawings" ON public.drawings;
DROP POLICY IF EXISTS "Authenticated admins can insert drawings" ON public.drawings;

-- Recreate admin policies using the security definer function
CREATE POLICY "Authenticated admins can view all drawings" ON public.drawings
FOR SELECT USING (
  auth.role() = 'authenticated' AND public.get_current_user_role() = 'admin'
);

CREATE POLICY "Authenticated admins can update drawing status" ON public.drawings
FOR UPDATE USING (
  auth.role() = 'authenticated' AND public.get_current_user_role() = 'admin'
);

CREATE POLICY "Authenticated admins can delete drawings" ON public.drawings  
FOR DELETE USING (
  auth.role() = 'authenticated' AND public.get_current_user_role() = 'admin'
);

CREATE POLICY "Authenticated admins can insert drawings" ON public.drawings
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND public.get_current_user_role() = 'admin'
);