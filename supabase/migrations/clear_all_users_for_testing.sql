-- ============================================================================
-- CLEAR ALL USERS FOR TESTING
-- ============================================================================
-- This script deletes ALL users (USER, DIETITIAN, THERAPIST roles) 
-- and all related data for testing enrollment and signup flows.
--
-- WARNING: This will permanently delete:
-- - All users with roles: USER, DIETITIAN, THERAPIST
-- - All bookings
-- - All event_types
-- - All payments
-- - All session_requests
-- - All session_notes
-- - All meal_plans
-- - All google_oauth_tokens
-- - All availability_schedules
-- - All availability_overrides
-- - All out_of_office_periods
-- - All onboarding_progress records
-- - All audit_logs (if they reference users)
--
-- NOTE: ADMIN users are NOT deleted for safety.
-- 
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Show counts before deletion
DO $$
DECLARE
  user_count INTEGER;
  therapist_count INTEGER;
  dietitian_count INTEGER;
  regular_user_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO therapist_count FROM users WHERE role = 'THERAPIST';
  SELECT COUNT(*) INTO dietitian_count FROM users WHERE role = 'DIETITIAN';
  SELECT COUNT(*) INTO regular_user_count FROM users WHERE role = 'USER';
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'ADMIN';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'BEFORE DELETION:';
  RAISE NOTICE '  Total users: %', user_count;
  RAISE NOTICE '  Therapists: %', therapist_count;
  RAISE NOTICE '  Dietitians: %', dietitian_count;
  RAISE NOTICE '  Regular users: %', regular_user_count;
  RAISE NOTICE '  Admins (will NOT be deleted): %', admin_count;
  RAISE NOTICE '========================================';
END $$;

-- Step 2: Delete all users except ADMIN
-- This will cascade delete all related data due to foreign key constraints:
-- - event_types (ON DELETE CASCADE from users)
-- - bookings (ON DELETE CASCADE from event_types and users)
-- - payments (ON DELETE CASCADE from bookings)
-- - session_notes (ON DELETE CASCADE from users)
-- - session_requests (ON DELETE CASCADE from users)
-- - meal_plans (ON DELETE CASCADE from users)
-- - google_oauth_tokens (ON DELETE CASCADE from users)
-- - availability_schedules (ON DELETE CASCADE from users)
-- - availability_overrides (ON DELETE CASCADE from users)
-- - out_of_office_periods (ON DELETE CASCADE from users)
-- - onboarding_progress (ON DELETE CASCADE from users)
DELETE FROM users
WHERE role IN ('USER', 'DIETITIAN', 'THERAPIST');

-- Step 3: Clean up any orphaned records (safety measure)
-- Delete any bookings that might not have been cascade deleted
DELETE FROM bookings
WHERE user_id NOT IN (SELECT id FROM users)
   OR dietitian_id NOT IN (SELECT id FROM users);

-- Delete any event_types that might not have been cascade deleted
DELETE FROM event_types
WHERE user_id NOT IN (SELECT id FROM users);

-- Delete any session_requests that might not have been cascade deleted
-- Note: session_requests doesn't have user_id, only dietitian_id
DELETE FROM session_requests
WHERE dietitian_id NOT IN (SELECT id FROM users);

-- Delete any meal_plans that might not have been cascade deleted
DELETE FROM meal_plans
WHERE user_id NOT IN (SELECT id FROM users)
   OR dietitian_id NOT IN (SELECT id FROM users);

-- Delete any session_notes that might not have been cascade deleted
DELETE FROM session_notes
WHERE client_id NOT IN (SELECT id FROM users)
   OR therapist_id NOT IN (SELECT id FROM users);

-- Delete any google_oauth_tokens that might not have been cascade deleted
DELETE FROM google_oauth_tokens
WHERE user_id NOT IN (SELECT id FROM users);

-- Step 4: Verify deletion
DO $$
DECLARE
  remaining_user_count INTEGER;
  remaining_therapist_count INTEGER;
  remaining_dietitian_count INTEGER;
  remaining_regular_user_count INTEGER;
  admin_count INTEGER;
  booking_count INTEGER;
  event_type_count INTEGER;
  session_request_count INTEGER;
  meal_plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_user_count FROM users;
  SELECT COUNT(*) INTO remaining_therapist_count FROM users WHERE role = 'THERAPIST';
  SELECT COUNT(*) INTO remaining_dietitian_count FROM users WHERE role = 'DIETITIAN';
  SELECT COUNT(*) INTO remaining_regular_user_count FROM users WHERE role = 'USER';
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'ADMIN';
  SELECT COUNT(*) INTO booking_count FROM bookings;
  SELECT COUNT(*) INTO event_type_count FROM event_types;
  SELECT COUNT(*) INTO session_request_count FROM session_requests;
  SELECT COUNT(*) INTO meal_plan_count FROM meal_plans;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AFTER DELETION:';
  RAISE NOTICE '  Total users remaining: %', remaining_user_count;
  RAISE NOTICE '  Therapists remaining: %', remaining_therapist_count;
  RAISE NOTICE '  Dietitians remaining: %', remaining_dietitian_count;
  RAISE NOTICE '  Regular users remaining: %', remaining_regular_user_count;
  RAISE NOTICE '  Admins (preserved): %', admin_count;
  RAISE NOTICE '  Bookings remaining: %', booking_count;
  RAISE NOTICE '  Event types remaining: %', event_type_count;
  RAISE NOTICE '  Session requests remaining: %', session_request_count;
  RAISE NOTICE '  Meal plans remaining: %', meal_plan_count;
  RAISE NOTICE '========================================';
  
  IF remaining_therapist_count = 0 AND remaining_dietitian_count = 0 AND remaining_regular_user_count = 0 THEN
    RAISE NOTICE '✅ Successfully deleted all USER, DIETITIAN, and THERAPIST accounts';
  ELSE
    RAISE WARNING '⚠️  Warning: Some users still remain';
  END IF;
END $$;

-- Step 5: Show final summary
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- ============================================================================
-- IMPORTANT: Delete from Supabase Auth
-- ============================================================================
-- The users table deletion above handles database records,
-- but Supabase Auth users are separate and MUST be deleted to clear sessions.
--
-- Option 1: Use Supabase Dashboard (RECOMMENDED)
--   1. Go to Authentication > Users
--   2. Select all users (or filter by email)
--   3. Click "Delete" to remove them
--   4. This will clear all active sessions
--
-- Option 2: Run this SQL (requires admin/service role privileges):
--   DELETE FROM auth.users 
--   WHERE id IN (
--     SELECT DISTINCT auth_user_id 
--     FROM users 
--     WHERE role IN ('USER', 'DIETITIAN', 'THERAPIST')
--     AND auth_user_id IS NOT NULL
--   );
--
--   OR delete ALL auth users (if you want a complete reset):
--   DELETE FROM auth.users;
--
-- Option 3: Use Supabase Admin API
--   - Call DELETE /auth/v1/admin/users/{user_id} for each user
--
-- NOTE: After deleting auth users, you may need to:
--   1. Clear browser cookies for localhost:3000 (or use the /clear-session page)
--   2. Or visit http://localhost:3000/clear-session to automatically sign out
--
-- WARNING: Deleting from auth.users will clear all sessions. Users will need
-- to sign up again even with the same email. This is what you want for testing!
-- ============================================================================

