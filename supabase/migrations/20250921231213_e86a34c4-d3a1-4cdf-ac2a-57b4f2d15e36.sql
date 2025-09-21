-- Fix RLS policy for profile insertion to allow drawing submissions
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Allow profile creation during drawing submission process
-- This enables anonymous users to create profiles when submitting hearts
CREATE POLICY "Allow profile creation for drawing submission" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow insertion if no authenticated user (anonymous drawing submission)
  auth.uid() IS NULL 
  OR 
  -- Allow if authenticated user is creating their own profile
  auth.uid() = id
);

-- Also ensure we can update profiles during the same process
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id 
  OR 
  -- Allow system updates for profile management
  auth.uid() IS NULL
)
WITH CHECK (
  auth.uid() = id 
  OR 
  auth.uid() IS NULL
);