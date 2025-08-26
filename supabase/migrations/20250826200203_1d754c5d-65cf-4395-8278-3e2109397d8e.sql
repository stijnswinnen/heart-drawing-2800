-- Fix infinite recursion in profiles RLS policies by using security definer functions

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile securely" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles securely" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;

-- Create new policies using the security definer function we already have
CREATE POLICY "Users can view own profile securely" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles securely" ON public.profiles  
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can update own profile" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id AND auth.role() = 'authenticated')
WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');