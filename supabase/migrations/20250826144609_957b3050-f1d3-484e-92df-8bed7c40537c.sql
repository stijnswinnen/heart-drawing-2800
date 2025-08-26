-- Privacy hardening for public.location_likes
-- Restrict reads and mutations to the owning user (or admins), removing public visibility

-- Ensure RLS is enabled (no-op if already)
ALTER TABLE public.location_likes ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Everyone can view likes" ON public.location_likes;
DROP POLICY IF EXISTS "Anyone can create likes" ON public.location_likes;

-- Allow authenticated users to see only their own likes (including heart_user_id linkage if used)
CREATE POLICY "Users can view own likes"
ON public.location_likes
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = heart_user_id
);

-- Allow authenticated users to create likes only for themselves
CREATE POLICY "Users can insert own likes"
ON public.location_likes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Allow authenticated users to update their own likes (toggle active/removed)
CREATE POLICY "Users can update own likes"
ON public.location_likes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Optional: let admins manage likes across the board
CREATE POLICY "Admins can manage likes"
ON public.location_likes
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());