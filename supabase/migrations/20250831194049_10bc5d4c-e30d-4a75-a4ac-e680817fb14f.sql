-- Add image_path and category fields to locations table
ALTER TABLE public.locations 
ADD COLUMN image_path text,
ADD COLUMN category text;