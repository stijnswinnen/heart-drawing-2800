-- Create trigger to automatically update location status when email is verified
CREATE OR REPLACE FUNCTION public.handle_email_verification_location_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if email_verified changed from false to true
  IF OLD.email_verified = false AND NEW.email_verified = true THEN
    -- Update all locations with this heart_user_id from pending_verification to new
    UPDATE public.locations
    SET status = 'new'::location_status,
        updated_at = NOW()
    WHERE heart_user_id = NEW.id 
      AND status = 'pending_verification'::location_status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table
CREATE TRIGGER trigger_location_verification_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_verification_location_update();

-- Manually verify the specific user email to fix the stuck location
UPDATE public.profiles 
SET email_verified = true,
    verification_token = NULL,
    verification_token_expires_at = NULL,
    updated_at = NOW()
WHERE id = '56009b28-5e3c-4329-983c-8cca1118940b';

-- Log this manual verification for audit purposes
INSERT INTO public.security_logs (event_type, user_id, details)
VALUES (
  'manual_email_verification',
  '56009b28-5e3c-4329-983c-8cca1118940b',
  jsonb_build_object(
    'reason', 'Fix stuck location submission',
    'location_id', '072595e5-6db4-4274-983b-331c6a2b0ccb',
    'timestamp', NOW()
  )
);