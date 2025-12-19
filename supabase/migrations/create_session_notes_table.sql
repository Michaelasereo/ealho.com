-- Create session_notes table for therapist session documentation
-- This table stores session notes that therapists fill out after client sessions

CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Maps to bookings.dietitian_id (therapist's user ID)
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Maps to bookings.user_id (client's user ID)
  
  -- Auto-filled biodata (read-only)
  client_name TEXT NOT NULL,
  session_number INTEGER NOT NULL, -- e.g., 1, 2, 3 (counts sessions with same client)
  session_date TIMESTAMPTZ NOT NULL,
  session_time TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  location TEXT DEFAULT 'Virtual',
  
  -- Therapist-filled sections
  patient_complaint TEXT,
  personal_history TEXT,
  family_history TEXT,
  presentation TEXT,
  formulation_and_diagnosis TEXT,
  treatment_plan TEXT,
  assignments TEXT,
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Ensure one note per booking
  UNIQUE(booking_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_id ON session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_id ON session_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_booking_id ON session_notes(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_status ON session_notes(status);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_therapist ON session_notes(client_id, therapist_id);

-- Trigger for updated_at
CREATE TRIGGER update_session_notes_updated_at 
  BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

