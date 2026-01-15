-- Rename dietitian_id to provider_id
-- 
-- Standardizes field naming across the codebase.
-- dietitian_id is used for both dietitians and therapists,
-- so provider_id is more accurate.
-- 
-- This migration:
-- 1. Adds provider_id column
-- 2. Migrates data from dietitian_id
-- 3. Updates foreign keys
-- 4. Drops old column (after code deployment)

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

-- Add provider_id column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Migrate data from dietitian_id to provider_id
UPDATE bookings 
SET provider_id = dietitian_id 
WHERE provider_id IS NULL AND dietitian_id IS NOT NULL;

-- Create index on provider_id
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);

-- ============================================================================
-- SESSION_REQUESTS TABLE
-- ============================================================================

-- Add provider_id column
ALTER TABLE session_requests 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Migrate data
UPDATE session_requests 
SET provider_id = dietitian_id 
WHERE provider_id IS NULL AND dietitian_id IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_session_requests_provider_id ON session_requests(provider_id);

-- ============================================================================
-- MEAL_PLANS TABLE (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    -- Add provider_id column
    EXECUTE 'ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE CASCADE';
    
    -- Migrate data
    EXECUTE 'UPDATE meal_plans SET provider_id = dietitian_id WHERE provider_id IS NULL AND dietitian_id IS NOT NULL';
    
    -- Create index
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_meal_plans_provider_id ON meal_plans(provider_id)';
  END IF;
END $$;

-- ============================================================================
-- AVAILABILITY TABLES
-- ============================================================================

-- Availability schedules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability_schedules') THEN
    EXECUTE 'ALTER TABLE availability_schedules ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE CASCADE';
    EXECUTE 'UPDATE availability_schedules SET provider_id = dietitian_id WHERE provider_id IS NULL AND dietitian_id IS NOT NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_availability_schedules_provider_id ON availability_schedules(provider_id)';
  END IF;
END $$;

-- Availability overrides
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability_overrides') THEN
    EXECUTE 'ALTER TABLE availability_overrides ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES users(id) ON DELETE CASCADE';
    EXECUTE 'UPDATE availability_overrides SET provider_id = dietitian_id WHERE provider_id IS NULL AND dietitian_id IS NOT NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_availability_overrides_provider_id ON availability_overrides(provider_id)';
  END IF;
END $$;

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================

-- Update bookings policies to use provider_id
DO $$
BEGIN
  -- Drop old policies
  EXECUTE 'DROP POLICY IF EXISTS "Providers can view own bookings" ON bookings';
  EXECUTE 'DROP POLICY IF EXISTS "Providers can update own bookings" ON bookings';
  
  -- Create new policies with provider_id
  EXECUTE 'CREATE POLICY "Providers can view own bookings"
    ON bookings FOR SELECT
    USING (
      (provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      )) OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = ''ADMIN''
      )
    )';
  
  EXECUTE 'CREATE POLICY "Providers can update own bookings"
    ON bookings FOR UPDATE
    USING (
      provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      )
    )
    WITH CHECK (
      provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      )
    )';
END $$;

-- Update session_requests policies
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Providers can view own session requests" ON session_requests';
  
  EXECUTE 'CREATE POLICY "Providers can view own session requests"
    ON session_requests FOR SELECT
    USING (
      provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      ) OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = ''ADMIN''
      )
    )';
  
  EXECUTE 'DROP POLICY IF EXISTS "Providers can update own session requests" ON session_requests';
  
  EXECUTE 'CREATE POLICY "Providers can update own session requests"
    ON session_requests FOR UPDATE
    USING (
      provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      )
    )
    WITH CHECK (
      provider_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN (''DIETITIAN'', ''THERAPIST'')
      )
    )';
END $$;

-- ============================================================================
-- UPDATE DATABASE FUNCTIONS
-- ============================================================================

-- Update get_provider_bookings function
CREATE OR REPLACE FUNCTION get_provider_bookings(p_provider_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  event_type_id UUID,
  user_id UUID,
  provider_id UUID,
  meeting_link TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.description,
    b.start_time,
    b.end_time,
    b.status,
    b.event_type_id,
    b.user_id,
    COALESCE(b.provider_id, b.dietitian_id) as provider_id, -- Support both during migration
    b.meeting_link,
    b.created_at,
    b.updated_at
  FROM bookings b
  WHERE COALESCE(b.provider_id, b.dietitian_id) = p_provider_id
  AND (
    auth.uid() = p_provider_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('DIETITIAN', 'THERAPIST')
      AND id = p_provider_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN bookings.provider_id IS 'Provider ID (replaces dietitian_id, supports both DIETITIAN and THERAPIST roles)';
COMMENT ON COLUMN session_requests.provider_id IS 'Provider ID (replaces dietitian_id, supports both DIETITIAN and THERAPIST roles)';

-- ============================================================================
-- NOTES
-- ============================================================================

-- IMPORTANT: 
-- 1. This migration adds provider_id but keeps dietitian_id for backward compatibility
-- 2. After code deployment, create a follow-up migration to:
--    a. Drop dietitian_id column
--    b. Remove old indexes
-- 3. Update all application code to use provider_id
-- 4. Test thoroughly before dropping dietitian_id

