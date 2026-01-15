-- Migration: Add Performance Indexes for Tenant Queries
-- Optimizes queries that filter by tenant (user_id, dietitian_id, therapist_id, etc.)

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_dietitian_id ON bookings(dietitian_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dietitian_status ON bookings(dietitian_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time DESC);

-- Session notes indexes
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_id ON session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_id ON session_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_status ON session_notes(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_status ON session_notes(client_id, status);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_date ON session_notes(session_date DESC);

-- Event types indexes
CREATE INDEX IF NOT EXISTS idx_event_types_dietitian_id ON event_types(dietitian_id);
CREATE INDEX IF NOT EXISTS idx_event_types_dietitian_active ON event_types(dietitian_id, active);

-- Availability schedules indexes
CREATE INDEX IF NOT EXISTS idx_availability_schedules_dietitian_id ON availability_schedules(dietitian_id);
CREATE INDEX IF NOT EXISTS idx_availability_schedules_dietitian_day ON availability_schedules(dietitian_id, day_of_week);

-- Meal plans indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_dietitian_id ON meal_plans(dietitian_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dietitian_created ON meal_plans(dietitian_id, created_at DESC);

-- Session requests indexes
CREATE INDEX IF NOT EXISTS idx_session_requests_therapist_id ON session_requests(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_requests_user_id ON session_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_session_requests_therapist_status ON session_requests(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_session_requests_user_status ON session_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_session_requests_created_at ON session_requests(created_at DESC);

-- Users indexes (already have some, but ensure these exist)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, account_status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_dietitian_start_time ON bookings(dietitian_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_session_date ON session_notes(therapist_id, session_date DESC);

-- Add comments
COMMENT ON INDEX idx_bookings_dietitian_id IS 'Optimizes queries filtering bookings by dietitian';
COMMENT ON INDEX idx_session_notes_therapist_id IS 'Optimizes queries filtering session notes by therapist';
COMMENT ON INDEX idx_event_types_dietitian_id IS 'Optimizes queries filtering event types by dietitian';

