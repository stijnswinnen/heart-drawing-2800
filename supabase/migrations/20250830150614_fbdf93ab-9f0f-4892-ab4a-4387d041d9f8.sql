-- Add sorting column to video_jobs table
ALTER TABLE public.video_jobs 
ADD COLUMN sorting text DEFAULT 'new_to_old';