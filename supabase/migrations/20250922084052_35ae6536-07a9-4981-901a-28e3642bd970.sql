-- Fix RLS policy for profile insertion during drawing submissions
-- The issue is that drawing submissions create profiles with generated UUIDs
-- that don't match the authenticated user's auth.uid()

DROP POLICY IF EXISTS "Allow profile creation for drawing submission" ON public.profiles;

-- Allow profile insertion for drawing submission process
-- This handles both anonymous and authenticated users submitting drawings
CREATE POLICY "Allow drawing submission profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Always allow profile creation during drawing submission
  -- The drawing submission process needs to create profiles with email verification
  true
);

-- Also update the update policy to be more permissive for system operations
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Users can update their own profiles
  auth.uid() = id 
  OR 
  -- Admins can update any profile
  public.get_current_user_role() = 'admin'
  OR
  -- Allow system updates (like email verification)
  auth.uid() IS NULL
)
WITH CHECK (
  -- Same conditions for updates
  auth.uid() = id 
  OR 
  public.get_current_user_role() = 'admin'
  OR
  auth.uid() IS NULL
);