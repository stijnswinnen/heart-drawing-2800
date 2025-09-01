-- Create admin function to manually verify user emails (bypassing security restrictions)
CREATE OR REPLACE FUNCTION public.admin_verify_user_email(p_user_id uuid)
RETURNS json AS $$
DECLARE
  _updated_count integer;
BEGIN
  -- Only allow this function to be called by admins or service role
  IF NOT (coalesce(auth.role(), '') = 'service_role' OR public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can manually verify emails';
  END IF;

  -- Update the user's email verification status
  UPDATE public.profiles
  SET 
    email_verified = true,
    verification_token = NULL,
    verification_token_expires_at = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  GET DIAGNOSTICS _updated_count = ROW_COUNT;

  RETURN json_build_object(
    'success', _updated_count > 0,
    'message', CASE 
      WHEN _updated_count > 0 THEN 'User email verified successfully'
      ELSE 'User not found or already verified'
    END,
    'updated_count', _updated_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Use the admin function to verify the specific user
SELECT public.admin_verify_user_email('56009b28-5e3c-4329-983c-8cca1118940b');