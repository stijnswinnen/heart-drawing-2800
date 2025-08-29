-- Create video_jobs table for tracking Rendi.dev video generation jobs
CREATE TABLE public.video_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('daily', 'archive')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  rendi_job_id TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  max_frames INTEGER NOT NULL,
  fps INTEGER NOT NULL,
  video_path TEXT,
  error_message TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_jobs
CREATE POLICY "Authenticated admins can view all video jobs" 
ON public.video_jobs 
FOR SELECT 
USING ((auth.role() = 'authenticated'::text) AND (get_current_user_role() = 'admin'::text));

CREATE POLICY "Authenticated admins can create video jobs" 
ON public.video_jobs 
FOR INSERT 
WITH CHECK ((auth.role() = 'authenticated'::text) AND (get_current_user_role() = 'admin'::text));

CREATE POLICY "Authenticated admins can update video jobs" 
ON public.video_jobs 
FOR UPDATE 
USING ((auth.role() = 'authenticated'::text) AND (get_current_user_role() = 'admin'::text));

CREATE POLICY "Authenticated admins can delete video jobs" 
ON public.video_jobs 
FOR DELETE 
USING ((auth.role() = 'authenticated'::text) AND (get_current_user_role() = 'admin'::text));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_jobs_updated_at
BEFORE UPDATE ON public.video_jobs
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime();

-- Enable Supabase Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_jobs;