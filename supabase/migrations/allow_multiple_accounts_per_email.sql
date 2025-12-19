-- Migration: Allow multiple accounts per email (different roles)
-- This allows the same email to have separate DIETITIAN and THERAPIST accounts

-- Step 1: Add auth_user_id column to link user records to Supabase Auth accounts
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- Step 2: Remove the UNIQUE constraint on email
-- First, drop the existing unique constraint if it exists
DO $$ 
BEGIN
  -- Check if unique constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- Step 3: Add composite UNIQUE constraint on (email, role)
-- This prevents duplicate accounts with the same email+role combination
ALTER TABLE users 
ADD CONSTRAINT users_email_role_unique UNIQUE (email, role);

-- Step 4: Add index on (email, role) for performance
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

-- Step 5: Add index on auth_user_id for lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Step 6: For existing users, set auth_user_id to their id (backward compatibility)
-- This assumes existing users have their id matching their auth user id
UPDATE users 
SET auth_user_id = id 
WHERE auth_user_id IS NULL;

