-- Manually verify the user's email (bypassing token validation for this special case)
UPDATE public.profiles 
SET email_verified = true,
    verification_token = NULL,
    verification_token_expires_at = NULL,
    updated_at = NOW()
WHERE id = '56009b28-5e3c-4329-983c-8cca1118940b'
  AND email = 'fons@stijnswinnen.be';