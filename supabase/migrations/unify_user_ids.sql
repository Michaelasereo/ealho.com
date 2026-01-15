-- Migration: Unify User IDs (Phase 1 - Safe Migration)
-- This migration prepares for unified user system while maintaining backward compatibility
--
-- IMPORTANT: This is a safe migration that doesn't break existing functionality.
-- It adds the create_unified_user function and ensures consistency.
-- Full consolidation can be done in a later phase after testing.

-- Step 1: Create PostgreSQL function for atomic user creation
-- This ensures users.id always matches auth.users.id
CREATE OR REPLACE FUNCTION create_unified_user(
  p_auth_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_image TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'USER',
  p_account_status TEXT DEFAULT 'ACTIVE',
  p_email_verified BOOLEAN DEFAULT FALSE,
  p_onboarding_completed BOOLEAN DEFAULT FALSE,
  p_signup_source TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  image TEXT,
  role TEXT,
  account_status TEXT,
  email_verified BOOLEAN,
  onboarding_completed BOOLEAN,
  signup_source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Use auth user ID as the primary key (single source of truth)
  v_user_id := p_auth_user_id;
  
  -- Insert user with id = auth_user_id
  INSERT INTO users (
    id,
    email,
    name,
    image,
    role,
    account_status,
    email_verified,
    onboarding_completed,
    signup_source,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    LOWER(TRIM(p_email)),
    p_name,
    p_image,
    p_role::user_role,
    p_account_status::account_status,
    p_email_verified,
    p_onboarding_completed,
    p_signup_source,
    p_metadata,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    image = COALESCE(EXCLUDED.image, users.image),
    updated_at = NOW()
  RETURNING * INTO v_user_id;
  
  -- Return the created/updated user
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.image,
    u.role::TEXT,
    u.account_status::TEXT,
    u.email_verified,
    u.onboarding_completed,
    u.signup_source,
    u.metadata,
    u.created_at,
    u.updated_at,
    u.last_sign_in_at
  FROM users u
  WHERE u.id = v_user_id;
END;
$$;

-- Step 2: Ensure auth_user_id is set for all users (safe update)
-- This doesn't change IDs, just ensures consistency
UPDATE users
SET auth_user_id = id
WHERE auth_user_id IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = users.id);

-- Step 3: Add constraint to ensure consistency going forward
-- This ensures that auth_user_id is always set
-- But allows id != auth_user_id for multi-account scenarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_auth_user_id_consistency'
  ) THEN
    ALTER TABLE users 
      ADD CONSTRAINT users_auth_user_id_consistency 
      CHECK (auth_user_id IS NOT NULL);
  END IF;
END $$;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id_role ON users(auth_user_id, role);

-- Step 5: Add comments documenting the unified system
COMMENT ON TABLE users IS 'Unified user system: Uses auth_user_id for lookups, supports multiple accounts per email (one per role)';
COMMENT ON COLUMN users.id IS 'Primary key - can be auth_user_id (first account) or separate UUID (multi-account)';
COMMENT ON COLUMN users.auth_user_id IS 'Links to auth.users.id - used for all lookups and multi-account support';

