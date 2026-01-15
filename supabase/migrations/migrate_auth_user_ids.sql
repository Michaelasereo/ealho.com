-- Migration: Ensure all users have auth_user_id populated
-- This fixes the dual identity mapping issue
-- Run this during a maintenance window

-- Step 1: Identify users missing auth_user_id or where it equals id (needs update)
DO $$
DECLARE
  missing_count INTEGER;
  needs_update_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM users 
  WHERE auth_user_id IS NULL;
  
  SELECT COUNT(*) INTO needs_update_count
  FROM users 
  WHERE auth_user_id = id;
  
  RAISE NOTICE 'Users missing auth_user_id: %', missing_count;
  RAISE NOTICE 'Users where auth_user_id = id (needs update): %', needs_update_count;
END $$;

-- Step 2: Update users by matching email with auth.users
-- This works for users who signed up via OAuth (Google, etc.)
UPDATE users u
SET auth_user_id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE LOWER(au.email) = LOWER(u.email)
  LIMIT 1
)
WHERE u.auth_user_id IS NULL
  AND EXISTS (
    SELECT 1 
    FROM auth.users au 
    WHERE LOWER(au.email) = LOWER(u.email)
  );

-- Step 3: For remaining users where auth_user_id = id, verify they match
-- If they don't match auth.users, we need to handle them differently
-- For now, we'll leave them as-is since they might be legacy test users

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id_role 
ON users(auth_user_id, role) 
WHERE auth_user_id IS NOT NULL;

-- Step 5: Add constraint to ensure auth_user_id is set for new users
-- (This is informational - actual enforcement happens in application code)
COMMENT ON COLUMN users.auth_user_id IS 
'Links to Supabase Auth user ID. Must be set for all new users. Legacy users may have this equal to id.';

-- Step 6: Log migration results
DO $$
DECLARE
  updated_count INTEGER;
  remaining_null INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM users 
  WHERE auth_user_id IS NOT NULL 
    AND auth_user_id != id;
  
  SELECT COUNT(*) INTO remaining_null
  FROM users 
  WHERE auth_user_id IS NULL;
  
  RAISE NOTICE 'Migration complete. Users with proper auth_user_id: %', updated_count;
  RAISE NOTICE 'Users still missing auth_user_id: %', remaining_null;
  
  IF remaining_null > 0 THEN
    RAISE WARNING 'Some users still have NULL auth_user_id. These may be test users or need manual review.';
  END IF;
END $$;

