ALTER TABLE public.locations ADD COLUMN summary text;
ALTER TABLE public.locations ADD CONSTRAINT locations_summary_length CHECK (summary IS NULL OR char_length(summary) <= 200);