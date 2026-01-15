-- Database-Level Tenant Isolation Functions
-- 
-- Provides PostgreSQL functions for automatic tenant filtering,
-- reducing manual query scoping errors and ensuring consistent isolation.
-- 
-- Based on industry best practices from Salesforce and Microsoft.

-- ============================================================================
-- BOOKINGS FUNCTIONS
-- ============================================================================

-- Get bookings for a user (as client or provider)
CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  event_type_id UUID,
  user_id UUID,
  dietitian_id UUID,
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
    b.dietitian_id,
    b.meeting_link,
    b.created_at,
    b.updated_at
  FROM bookings b
  WHERE (b.user_id = p_user_id OR b.dietitian_id = p_user_id)
  AND auth.uid() = p_user_id; -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get bookings for a provider (dietitian/therapist)
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
  dietitian_id UUID,
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
    b.dietitian_id,
    b.meeting_link,
    b.created_at,
    b.updated_at
  FROM bookings b
  WHERE b.dietitian_id = p_provider_id
  AND (
    auth.uid() = p_provider_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('DIETITIAN', 'THERAPIST')
      AND id = p_provider_id
    )
  ); -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SESSION REQUESTS FUNCTIONS
-- ============================================================================

-- Get session requests for a provider
CREATE OR REPLACE FUNCTION get_provider_session_requests(p_provider_id UUID)
RETURNS TABLE (
  id UUID,
  request_type TEXT,
  client_name TEXT,
  client_email TEXT,
  dietitian_id UUID,
  message TEXT,
  status TEXT,
  event_type_id UUID,
  meal_plan_type TEXT,
  price DECIMAL,
  currency TEXT,
  original_booking_id UUID,
  requested_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.request_type,
    sr.client_name,
    sr.client_email,
    sr.dietitian_id,
    sr.message,
    sr.status,
    sr.event_type_id,
    sr.meal_plan_type,
    sr.price,
    sr.currency,
    sr.original_booking_id,
    sr.requested_date,
    sr.created_at,
    sr.updated_at
  FROM session_requests sr
  WHERE sr.dietitian_id = p_provider_id
  AND (
    auth.uid() = p_provider_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('DIETITIAN', 'THERAPIST')
      AND id = p_provider_id
    )
  ); -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get session requests for a client
CREATE OR REPLACE FUNCTION get_client_session_requests(p_client_email TEXT)
RETURNS TABLE (
  id UUID,
  request_type TEXT,
  client_name TEXT,
  client_email TEXT,
  dietitian_id UUID,
  message TEXT,
  status TEXT,
  event_type_id UUID,
  meal_plan_type TEXT,
  price DECIMAL,
  currency TEXT,
  original_booking_id UUID,
  requested_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.request_type,
    sr.client_name,
    sr.client_email,
    sr.dietitian_id,
    sr.message,
    sr.status,
    sr.event_type_id,
    sr.meal_plan_type,
    sr.price,
    sr.currency,
    sr.original_booking_id,
    sr.requested_date,
    sr.created_at,
    sr.updated_at
  FROM session_requests sr
  WHERE LOWER(TRIM(sr.client_email)) = LOWER(TRIM(p_client_email))
  AND (
    auth.uid() = (SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_client_email))) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND LOWER(TRIM(email)) = LOWER(TRIM(p_client_email))
    )
  ); -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EVENT TYPES FUNCTIONS
-- ============================================================================

-- Get event types for a provider
CREATE OR REPLACE FUNCTION get_provider_event_types(p_provider_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  length INTEGER,
  price DECIMAL,
  currency TEXT,
  user_id UUID,
  active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.id,
    et.title,
    et.slug,
    et.description,
    et.length,
    et.price,
    et.currency,
    et.user_id,
    et.active,
    et.created_at,
    et.updated_at
  FROM event_types et
  WHERE et.user_id = p_provider_id
  AND (
    auth.uid() = p_provider_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('DIETITIAN', 'THERAPIST')
      AND id = p_provider_id
    ) OR
    et.active = true -- Public access for active event types
  ); -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SESSION NOTES FUNCTIONS
-- ============================================================================

-- Get session notes for a therapist
CREATE OR REPLACE FUNCTION get_therapist_session_notes(p_therapist_id UUID)
RETURNS TABLE (
  id UUID,
  booking_id UUID,
  therapist_id UUID,
  client_id UUID,
  client_name TEXT,
  session_number INTEGER,
  session_date TIMESTAMPTZ,
  session_time TEXT,
  therapist_name TEXT,
  location TEXT,
  patient_complaint TEXT,
  personal_history TEXT,
  family_history TEXT,
  presentation TEXT,
  formulation_and_diagnosis TEXT,
  treatment_plan TEXT,
  assignments TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.booking_id,
    sn.therapist_id,
    sn.client_id,
    sn.client_name,
    sn.session_number,
    sn.session_date,
    sn.session_time,
    sn.therapist_name,
    sn.location,
    sn.patient_complaint,
    sn.personal_history,
    sn.family_history,
    sn.presentation,
    sn.formulation_and_diagnosis,
    sn.treatment_plan,
    sn.assignments,
    sn.status,
    sn.created_at,
    sn.updated_at,
    sn.completed_at
  FROM session_notes sn
  WHERE sn.therapist_id = p_therapist_id
  AND (
    auth.uid() = p_therapist_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'THERAPIST'
      AND id = p_therapist_id
    )
  ); -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get session notes for a client
CREATE OR REPLACE FUNCTION get_client_session_notes(p_client_id UUID)
RETURNS TABLE (
  id UUID,
  booking_id UUID,
  therapist_id UUID,
  client_id UUID,
  client_name TEXT,
  session_number INTEGER,
  session_date TIMESTAMPTZ,
  session_time TEXT,
  therapist_name TEXT,
  location TEXT,
  patient_complaint TEXT,
  personal_history TEXT,
  family_history TEXT,
  presentation TEXT,
  formulation_and_diagnosis TEXT,
  treatment_plan TEXT,
  assignments TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.booking_id,
    sn.therapist_id,
    sn.client_id,
    sn.client_name,
    sn.session_number,
    sn.session_date,
    sn.session_time,
    sn.therapist_name,
    sn.location,
    sn.patient_complaint,
    sn.personal_history,
    sn.family_history,
    sn.presentation,
    sn.formulation_and_diagnosis,
    sn.treatment_plan,
    sn.assignments,
    sn.status,
    sn.created_at,
    sn.updated_at,
    sn.completed_at
  FROM session_notes sn
  WHERE sn.client_id = p_client_id
  AND auth.uid() = p_client_id; -- RLS enforcement
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MEAL PLANS FUNCTIONS (if table exists)
-- ============================================================================

-- Get meal plans for a dietitian
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION get_dietitian_meal_plans(p_dietitian_id UUID)
    RETURNS TABLE (
      id UUID,
      dietitian_id UUID,
      user_id UUID,
      title TEXT,
      description TEXT,
      pdf_url TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        mp.id,
        mp.dietitian_id,
        mp.user_id,
        mp.title,
        mp.description,
        mp.pdf_url,
        mp.created_at,
        mp.updated_at
      FROM meal_plans mp
      WHERE mp.dietitian_id = p_dietitian_id
      AND (
        auth.uid() = p_dietitian_id OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role = ''DIETITIAN''
          AND id = p_dietitian_id
        )
      );
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;';

    EXECUTE 'CREATE OR REPLACE FUNCTION get_client_meal_plans(p_client_id UUID)
    RETURNS TABLE (
      id UUID,
      dietitian_id UUID,
      user_id UUID,
      title TEXT,
      description TEXT,
      pdf_url TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        mp.id,
        mp.dietitian_id,
        mp.user_id,
        mp.title,
        mp.description,
        mp.pdf_url,
        mp.created_at,
        mp.updated_at
      FROM meal_plans mp
      WHERE mp.user_id = p_client_id
      AND auth.uid() = p_client_id;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_user_bookings(UUID) IS 'Get bookings for a user (as client or provider) with RLS enforcement';
COMMENT ON FUNCTION get_provider_bookings(UUID) IS 'Get bookings for a provider (dietitian/therapist) with RLS enforcement';
COMMENT ON FUNCTION get_provider_session_requests(UUID) IS 'Get session requests for a provider with RLS enforcement';
COMMENT ON FUNCTION get_client_session_requests(TEXT) IS 'Get session requests for a client by email with RLS enforcement';
COMMENT ON FUNCTION get_provider_event_types(UUID) IS 'Get event types for a provider with RLS enforcement';
COMMENT ON FUNCTION get_therapist_session_notes(UUID) IS 'Get session notes for a therapist with RLS enforcement';
COMMENT ON FUNCTION get_client_session_notes(UUID) IS 'Get session notes for a client with RLS enforcement';

