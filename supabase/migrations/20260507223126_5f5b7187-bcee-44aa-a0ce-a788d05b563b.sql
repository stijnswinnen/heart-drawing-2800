-- Tighten anonymous drawing INSERT policy: only allow attaching to unverified profiles.
-- Rationale: anonymous submissions create/use unverified profiles. Once a profile is
-- verified (email confirmed), it represents a real owner — attaching new drawings
-- anonymously would amount to impersonation. Authenticated users continue via the
-- auth.uid() branch.

DROP POLICY IF EXISTS "Allow drawing submissions" ON public.drawings;

CREATE POLICY "Allow drawing submissions"
ON public.drawings
FOR INSERT
WITH CHECK (
  status = 'new'::drawing_status
  AND (
    -- Anonymous submission: must target an existing unverified anonymous profile
    (
      auth.uid() IS NULL
      AND user_id IS NULL
      AND heart_user_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = drawings.heart_user_id
          AND p.user_id IS NULL
          AND COALESCE(p.email_verified, false) = false
      )
    )
    OR
    -- Authenticated submission: must own the profile referenced
    (
      auth.uid() IS NOT NULL
      AND user_id = auth.uid()
      AND (
        heart_user_id IS NULL
        OR heart_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = drawings.heart_user_id
            AND (p.user_id = auth.uid() OR p.id = auth.uid())
        )
      )
    )
  )
);