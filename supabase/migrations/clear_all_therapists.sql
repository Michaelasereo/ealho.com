-- Clear all therapists from the database
-- This script deletes all users with role = 'THERAPIST' and all related data
-- 
-- WARNING: This will permanently delete:
-- - All therapist users
-- - All event_types created by therapists
-- - All bookings with therapists
-- - All payments for those bookings
-- - All session_notes for therapist sessions
-- - All session_requests for therapists
-- - All google_oauth_tokens for therapists
--
-- Run this in Supabase SQL Editor

-- Step 1: Get count of therapists before deletion
DO $$
DECLARE
  therapist_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO therapist_count
  FROM users
  WHERE role = 'THERAPIST';
  
  RAISE NOTICE 'Found % therapist(s) to delete', therapist_count;
END $$;

-- Step 2: Delete all therapists from users table
-- This will cascade delete all related data due to foreign key constraints:
-- - event_types (ON DELETE CASCADE from users)
-- - bookings (ON DELETE CASCADE from event_types and users)
-- - payments (ON DELETE CASCADE from bookings)
-- - session_notes (ON DELETE CASCADE from users via therapist_id)
-- - session_requests (ON DELETE CASCADE from users via dietitian_id)
-- - google_oauth_tokens (ON DELETE CASCADE from users)
DELETE FROM users
WHERE role = 'THERAPIST';

-- Step 3: Also delete from Supabase Auth
-- Note: This requires admin privileges and may need to be done via Supabase Dashboard
-- or using the Supabase Admin API
-- The users table deletion above will handle the database records,
-- but you may want to manually delete auth users from the Supabase Dashboard
-- under Authentication > Users

-- Step 4: Verify deletion
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM users
  WHERE role = 'THERAPIST';
  
  IF remaining_count = 0 THEN
    RAISE NOTICE '✅ Successfully deleted all therapists';
  ELSE
    RAISE NOTICE '⚠️  Warning: % therapist(s) still remain', remaining_count;
  END IF;
END $$;

-- Show summary
SELECT 
  'Therapists deleted' as action,
  COUNT(*) as remaining_therapists
FROM users
WHERE role = 'THERAPIST';

