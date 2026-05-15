CREATE TABLE public.hearts_loop_video (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_path text NOT NULL,
  video_job_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enforce singleton
CREATE UNIQUE INDEX hearts_loop_video_singleton ON public.hearts_loop_video ((true));

ALTER TABLE public.hearts_loop_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hearts loop video"
ON public.hearts_loop_video FOR SELECT
USING (true);

CREATE POLICY "Admins can insert hearts loop video"
ON public.hearts_loop_video FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update hearts loop video"
ON public.hearts_loop_video FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete hearts loop video"
ON public.hearts_loop_video FOR DELETE
USING (is_admin());

GRANT SELECT ON public.hearts_loop_video TO anon, authenticated;
GRANT ALL ON public.hearts_loop_video TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.hearts_loop_video TO authenticated;

CREATE TRIGGER set_hearts_loop_video_updated_at
BEFORE UPDATE ON public.hearts_loop_video
FOR EACH ROW EXECUTE FUNCTION public.moddatetime();