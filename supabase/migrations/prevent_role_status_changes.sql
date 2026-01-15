-- Trigger to Prevent Unauthorized Role and Status Changes
-- 
-- RLS policies cannot compare OLD vs NEW values, so we use a trigger
-- to prevent users from changing their own role, account_status, or is_admin flag.

-- Function to prevent role/status changes
CREATE OR REPLACE FUNCTION prevent_unauthorized_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow if user is admin or service role
    IF NOT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (role = 'ADMIN' OR is_admin = true)
    ) AND auth.jwt() ->> 'role' != 'service_role' THEN
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
  END IF;

  -- Prevent users from changing their own account_status
  IF OLD.account_status IS DISTINCT FROM NEW.account_status THEN
    -- Only allow if user is admin or service role
    IF NOT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (role = 'ADMIN' OR is_admin = true)
    ) AND auth.jwt() ->> 'role' != 'service_role' THEN
      RAISE EXCEPTION 'Users cannot change their own account status';
    END IF;
  END IF;

  -- Prevent users from changing their own is_admin flag
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Only allow service role
    IF auth.jwt() ->> 'role' != 'service_role' THEN
      RAISE EXCEPTION 'Only service role can change is_admin flag';
    END IF;
  END IF;

  -- Prevent users from changing their own auth_user_id
  IF OLD.auth_user_id IS DISTINCT FROM NEW.auth_user_id THEN
    -- Only allow service role
    IF auth.jwt() ->> 'role' != 'service_role' THEN
      RAISE EXCEPTION 'Only service role can change auth_user_id';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_unauthorized_user_changes_trigger ON users;
CREATE TRIGGER prevent_unauthorized_user_changes_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_user_changes();

COMMENT ON FUNCTION prevent_unauthorized_user_changes() IS 'Prevents users from changing their own role, account_status, is_admin, or auth_user_id';


