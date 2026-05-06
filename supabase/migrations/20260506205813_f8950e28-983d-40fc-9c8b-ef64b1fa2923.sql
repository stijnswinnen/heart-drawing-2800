-- Tighten location INSERT policy
DROP POLICY IF EXISTS "Allow location submissions" ON public.locations;

CREATE POLICY "Allow location submissions"
ON public.locations
FOR INSERT
TO public
WITH CHECK (
  -- user_id must match the caller (or be NULL for anonymous)
  (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  )
  -- prevent setting privileged statuses on insert
  AND status IN ('new'::location_status, 'pending_verification'::location_status)
  -- prevent setting rejection_reason on insert
  AND rejection_reason IS NULL
);