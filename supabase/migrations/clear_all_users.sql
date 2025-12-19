-- WARNING: This will delete ALL users and cascade delete all related data
-- (bookings, event_types, payments, session_requests, session_notes, etc.)
-- Use with caution!

-- Delete all users (this will cascade delete related records due to foreign key constraints)
DELETE FROM users;

-- Reset any sequences if needed (optional, for clean slate)
-- Note: UUIDs don't use sequences, but if you have any serial columns, reset them here

-- Verify deletion
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  IF user_count > 0 THEN
    RAISE NOTICE 'Warning: % users still exist after deletion', user_count;
  ELSE
    RAISE NOTICE 'Success: All users have been deleted';
  END IF;
END $$;

