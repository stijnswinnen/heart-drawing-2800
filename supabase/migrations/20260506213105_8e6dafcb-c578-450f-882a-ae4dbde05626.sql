-- Tighten drawings INSERT policy
DROP POLICY IF EXISTS "Allow drawing submissions" ON public.drawings;

CREATE POLICY "Allow drawing submissions"
ON public.drawings
FOR INSERT
WITH CHECK (
  -- status must be 'new' on insert (no self-approval)
  status = 'new'::drawing_status
  AND (
    -- Anonymous insert: no user_id, heart_user_id must reference a profile with no auth user
    (
      auth.uid() IS NULL
      AND user_id IS NULL
      AND heart_user_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = heart_user_id AND p.user_id IS NULL
      )
    )
    OR
    -- Authenticated insert: user_id must match caller, heart_user_id (if set) must reference a profile owned by caller
    (
      auth.uid() IS NOT NULL
      AND user_id = auth.uid()
      AND (
        heart_user_id IS NULL
        OR heart_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = heart_user_id AND (p.user_id = auth.uid() OR p.id = auth.uid())
        )
      )
    )
  )
);