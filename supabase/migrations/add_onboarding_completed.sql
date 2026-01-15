-- Add onboarding_completed field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add age and gender fields if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INTEGER;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add qualifications array field if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS qualifications TEXT[];

-- Create index for onboarding_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- Set onboarding_completed to true for existing users (they've already completed enrollment)
UPDATE users 
SET onboarding_completed = true 
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

COMMENT ON COLUMN users.onboarding_completed IS 'Whether the user has completed the onboarding process';

