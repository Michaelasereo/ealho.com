-- Row Level Security (RLS) Policies for session_notes table

-- Enable RLS
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Therapists can view their own notes
CREATE POLICY "Therapists can view their notes"
  ON session_notes FOR SELECT
  USING (
    therapist_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
  );

-- Clients can view their own notes
CREATE POLICY "Clients can view their notes"
  ON session_notes FOR SELECT
  USING (
    client_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN')
  );

-- Only therapists can update their notes
CREATE POLICY "Therapists can update their notes"
  ON session_notes FOR UPDATE
  USING (therapist_id::text = auth.uid()::text);

-- Only system can create notes (via API with admin client)
-- No INSERT policy needed (uses admin client)

