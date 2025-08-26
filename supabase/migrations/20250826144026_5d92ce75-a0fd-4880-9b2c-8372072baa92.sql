-- Secure the insecure view flagged by linter 0010 (Security Definer View)
-- Switch the view to invoker semantics so it respects the querying user's RLS
ALTER VIEW IF EXISTS public.secure_profiles SET (security_invoker = true);

-- Optional hardening: prevent data leakage through functions by using a barrier view
ALTER VIEW IF EXISTS public.secure_profiles SET (security_barrier = true);
