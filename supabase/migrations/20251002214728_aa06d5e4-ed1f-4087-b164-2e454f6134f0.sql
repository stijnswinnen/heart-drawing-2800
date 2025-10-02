-- Fix foreign key constraint issue to allow anonymous profile creation
-- This removes the constraint that profiles.id must match auth.users.id
-- and adds a nullable user_id to optionally link to authenticated users

-- Step 1: Drop the foreign key constraint on profiles.id
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Add a nullable user_id column to link to auth.users when authenticated
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: For existing profiles where id matches an auth user, set user_id
UPDATE public.profiles 
SET user_id = id 
WHERE id IN (SELECT id FROM auth.users) 
AND user_id IS NULL;

-- Step 4: Update the handle_new_user trigger to properly set user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with user_id linking to auth.users
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    name,
    marketing_consent,
    role,
    email_verified
  ) VALUES (
    NEW.id,
    NEW.id,  -- Set user_id to link to auth.users
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
    'user',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$function$;

-- Step 5: Update RLS policies to work with both anonymous and authenticated profiles
DROP POLICY IF EXISTS "Users can view own profile securely" ON public.profiles;
CREATE POLICY "Users can view own profile securely" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can view their own profile (linked by user_id)
  auth.uid() = user_id
  OR
  -- Or their profile by id (for backward compatibility)
  auth.uid() = id
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id
  OR 
  auth.uid() = id
  OR 
  get_current_user_role() = 'admin'
  OR
  auth.uid() IS NULL
)
WITH CHECK (
  auth.uid() = user_id
  OR 
  auth.uid() = id
  OR 
  get_current_user_role() = 'admin'
  OR
  auth.uid() IS NULL
);