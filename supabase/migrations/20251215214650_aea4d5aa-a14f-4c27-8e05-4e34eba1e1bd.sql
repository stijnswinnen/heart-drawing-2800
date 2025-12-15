-- Update policy to allow users to view locations linked via heart_user_id
DROP POLICY IF EXISTS "Users can view their own locations" ON locations;
CREATE POLICY "Users can view their own locations" ON locations
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = heart_user_id);

-- Also allow users to update their own locations (for resubmission of rejected)
DROP POLICY IF EXISTS "Users can update their own locations" ON locations;
CREATE POLICY "Users can update their own locations" ON locations
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = heart_user_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = heart_user_id);