
-- Fix 1: Restrict profile UPDATE policy (remove anonymous-can-update-anything branch)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.uid() = id))
  OR get_current_user_role() = 'admin'
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.uid() = id))
  OR get_current_user_role() = 'admin'
);

-- Fix 2: Restrict profile INSERT policy to prevent privileged role on creation
DROP POLICY IF EXISTS "Allow drawing submission profile creation" ON public.profiles;
CREATE POLICY "Allow drawing submission profile creation"
ON public.profiles
FOR INSERT
WITH CHECK (
  (role IS NULL OR role = 'user'::user_role)
  AND (
    -- Anonymous submission: must not link to an auth user
    (auth.uid() IS NULL AND user_id IS NULL)
    -- Authenticated user creating their own profile row
    OR (auth.uid() IS NOT NULL AND (id = auth.uid() OR user_id = auth.uid()))
  )
);

-- Fix 3: Remove video_jobs from supabase_realtime publication so updates aren't broadcast to all clients
ALTER PUBLICATION supabase_realtime DROP TABLE public.video_jobs;

-- Fix 4: Add fixed search_path to get_current_user_role to prevent schema injection
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;
