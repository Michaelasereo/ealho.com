-- Enhanced Row-Level Security (RLS) Policies
-- Replaces permissive policies with strict tenant-scoped policies
-- Based on industry best practices from Stripe, Vercel, and Supabase

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (role = 'ADMIN' OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is provider (DIETITIAN or THERAPIST)
CREATE OR REPLACE FUNCTION is_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('DIETITIAN', 'THERAPIST')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Service role full access to users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Service role bypass (for admin client)
CREATE POLICY "Service role full access to users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR
    is_admin()
  );

-- Users can update their own profile
-- Note: Role, account_status, and is_admin changes should be prevented by triggers or application logic
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all users (for user management)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

-- ============================================================================
-- EVENT_TYPES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on event_types" ON event_types;
DROP POLICY IF EXISTS "Service role full access to event_types" ON event_types;
DROP POLICY IF EXISTS "Anyone can view active event types" ON event_types;
DROP POLICY IF EXISTS "Dietitians can manage own event types" ON event_types;

-- Service role bypass
CREATE POLICY "Service role full access to event_types"
  ON event_types FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Anyone can view active event types (for public booking pages)
CREATE POLICY "Anyone can view active event types"
  ON event_types FOR SELECT
  USING (active = true);

-- Providers (DIETITIAN/THERAPIST) can view their own event types (including inactive)
CREATE POLICY "Providers can view own event types"
  ON event_types FOR SELECT
  USING (
    user_id = auth.uid() AND is_provider() OR
    is_admin()
  );

-- Providers can create their own event types
CREATE POLICY "Providers can create own event types"
  ON event_types FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND is_provider()
  );

-- Providers can update their own event types
CREATE POLICY "Providers can update own event types"
  ON event_types FOR UPDATE
  USING (
    user_id = auth.uid() AND is_provider()
  )
  WITH CHECK (
    user_id = auth.uid() AND is_provider()
  );

-- Providers can delete their own event types
CREATE POLICY "Providers can delete own event types"
  ON event_types FOR DELETE
  USING (
    user_id = auth.uid() AND is_provider()
  );

-- ============================================================================
-- BOOKINGS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on bookings" ON bookings;
DROP POLICY IF EXISTS "Service role full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Dietitians can update own bookings" ON bookings;

-- Service role bypass
CREATE POLICY "Service role full access to bookings"
  ON bookings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own bookings (as client)
CREATE POLICY "Users can view own bookings as client"
  ON bookings FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Providers can view bookings for their events
CREATE POLICY "Providers can view own bookings"
  ON bookings FOR SELECT
  USING (
    (dietitian_id = auth.uid() AND is_provider()) OR
    is_admin()
  );

-- Users can create bookings (as client)
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM event_types
      WHERE event_types.id = bookings.event_type_id
      AND event_types.active = true
    )
  );

-- Providers can update bookings for their events
CREATE POLICY "Providers can update own bookings"
  ON bookings FOR UPDATE
  USING (
    dietitian_id = auth.uid() AND is_provider()
  )
  WITH CHECK (
    dietitian_id = auth.uid() AND is_provider()
  );

-- Users can cancel their own bookings (within 24 hours)
CREATE POLICY "Users can cancel own bookings"
  ON bookings FOR UPDATE
  USING (
    user_id = auth.uid() AND
    status = 'CONFIRMED' AND
    (NOW() - created_at) < INTERVAL '24 hours'
  )
  WITH CHECK (
    user_id = auth.uid() AND
    NEW.status = 'CANCELLED'
  );

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Service role full access to payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payment records" ON payments;

-- Service role bypass
CREATE POLICY "Service role full access to payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view payments for their bookings
CREATE POLICY "Users can view own payment records"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND (bookings.user_id = auth.uid() OR bookings.dietitian_id = auth.uid())
    ) OR
    is_admin()
  );

-- Only service role can create/update payments (via API)
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- SESSION_REQUESTS TABLE POLICIES
-- ============================================================================

-- Drop permissive policy
DROP POLICY IF EXISTS "Allow all operations on session_requests" ON session_requests;

-- Service role bypass
CREATE POLICY "Service role full access to session_requests"
  ON session_requests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own session requests (as client)
CREATE POLICY "Users can view own session requests as client"
  ON session_requests FOR SELECT
  USING (
    auth.uid() = (SELECT id FROM users WHERE LOWER(TRIM(users.email)) = LOWER(TRIM(session_requests.client_email))) OR
    is_admin()
  );

-- Providers can view session requests for them
CREATE POLICY "Providers can view own session requests"
  ON session_requests FOR SELECT
  USING (
    dietitian_id = auth.uid() AND is_provider() OR
    is_admin()
  );

-- Users can create session requests
CREATE POLICY "Users can create session requests"
  ON session_requests FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT id FROM users WHERE LOWER(TRIM(users.email)) = LOWER(TRIM(session_requests.client_email)))
  );

-- Providers can update session requests for them
CREATE POLICY "Providers can update own session requests"
  ON session_requests FOR UPDATE
  USING (
    dietitian_id = auth.uid() AND is_provider()
  )
  WITH CHECK (
    dietitian_id = auth.uid() AND is_provider()
  );

-- ============================================================================
-- SESSION_NOTES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Therapists can view their notes" ON session_notes;
DROP POLICY IF EXISTS "Clients can view their notes" ON session_notes;
DROP POLICY IF EXISTS "Therapists can update their notes" ON session_notes;

-- Service role bypass
CREATE POLICY "Service role full access to session_notes"
  ON session_notes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Therapists can view their own notes
CREATE POLICY "Therapists can view own notes"
  ON session_notes FOR SELECT
  USING (
    therapist_id = auth.uid() OR
    is_admin()
  );

-- Clients can view their own notes
CREATE POLICY "Clients can view own notes"
  ON session_notes FOR SELECT
  USING (
    client_id = auth.uid() OR
    is_admin()
  );

-- Only therapists can update their notes
CREATE POLICY "Therapists can update own notes"
  ON session_notes FOR UPDATE
  USING (
    therapist_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'THERAPIST'
    )
  )
  WITH CHECK (
    therapist_id = auth.uid()
  );

-- Only service role can create notes (via API)
CREATE POLICY "Service role can create session notes"
  ON session_notes FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- MEAL_PLANS TABLE POLICIES (if exists)
-- ============================================================================

-- Check if meal_plans table exists and add policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Dietitians can view their own meal plans" ON meal_plans;
    DROP POLICY IF EXISTS "Dietitians can insert their own meal plans" ON meal_plans;
    DROP POLICY IF EXISTS "Dietitians can update their own meal plans" ON meal_plans;
    DROP POLICY IF EXISTS "Dietitians can delete their own meal plans" ON meal_plans;
    DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;

    -- Service role bypass
    EXECUTE 'CREATE POLICY "Service role full access to meal_plans"
      ON meal_plans FOR ALL
      USING (auth.jwt() ->> ''role'' = ''service_role'')
      WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'')';

    -- Dietitians can view their own meal plans
    EXECUTE 'CREATE POLICY "Dietitians can view own meal plans"
      ON meal_plans FOR SELECT
      USING (
        dietitian_id = auth.uid() AND EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = ''DIETITIAN''
        ) OR
        is_admin()
      )';

    -- Users can view their own meal plans
    EXECUTE 'CREATE POLICY "Users can view own meal plans"
      ON meal_plans FOR SELECT
      USING (
        user_id = auth.uid() OR
        is_admin()
      )';

    -- Dietitians can manage their own meal plans
    EXECUTE 'CREATE POLICY "Dietitians can manage own meal plans"
      ON meal_plans FOR ALL
      USING (
        dietitian_id = auth.uid() AND EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = ''DIETITIAN''
        )
      )
      WITH CHECK (
        dietitian_id = auth.uid() AND EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = ''DIETITIAN''
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- GOOGLE_OAUTH_TOKENS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on google_oauth_tokens" ON google_oauth_tokens;
DROP POLICY IF EXISTS "Service role full access to google_oauth_tokens" ON google_oauth_tokens;
DROP POLICY IF EXISTS "Users can view own google tokens" ON google_oauth_tokens;

-- Service role bypass
CREATE POLICY "Service role full access to google_oauth_tokens"
  ON google_oauth_tokens FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own tokens
CREATE POLICY "Users can view own google tokens"
  ON google_oauth_tokens FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Only service role can manage tokens (via API)
CREATE POLICY "Service role can manage google tokens"
  ON google_oauth_tokens FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- AVAILABILITY TABLES POLICIES (if exist)
-- ============================================================================

-- Availability schedules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability_schedules') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can view their own OOO periods" ON availability_schedules';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can insert their own OOO periods" ON availability_schedules';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can update their own OOO periods" ON availability_schedules';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can delete their own OOO periods" ON availability_schedules';

    EXECUTE 'CREATE POLICY "Service role full access to availability_schedules"
      ON availability_schedules FOR ALL
      USING (auth.jwt() ->> ''role'' = ''service_role'')
      WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'')';

    EXECUTE 'CREATE POLICY "Providers can manage own availability"
      ON availability_schedules FOR ALL
      USING (
        dietitian_id = auth.uid() AND is_provider()
      )
      WITH CHECK (
        dietitian_id = auth.uid() AND is_provider()
      )';
  END IF;
END $$;

-- Availability overrides
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability_overrides') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can view their own overrides" ON availability_overrides';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can insert their own overrides" ON availability_overrides';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can update their own overrides" ON availability_overrides';
    EXECUTE 'DROP POLICY IF EXISTS "Dietitians can delete their own overrides" ON availability_overrides';

    EXECUTE 'CREATE POLICY "Service role full access to availability_overrides"
      ON availability_overrides FOR ALL
      USING (auth.jwt() ->> ''role'' = ''service_role'')
      WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'')';

    EXECUTE 'CREATE POLICY "Providers can manage own overrides"
      ON availability_overrides FOR ALL
      USING (
        dietitian_id = auth.uid() AND is_provider()
      )
      WITH CHECK (
        dietitian_id = auth.uid() AND is_provider()
      )';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_admin() IS 'Checks if the authenticated user is an admin';
COMMENT ON FUNCTION get_user_role() IS 'Returns the role of the authenticated user';
COMMENT ON FUNCTION is_provider() IS 'Checks if the authenticated user is a provider (DIETITIAN or THERAPIST)';

