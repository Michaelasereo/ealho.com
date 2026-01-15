-- Migration: Create Onboarding Progress Table
-- Tracks onboarding progress with state machine pattern
-- Allows users to save progress and resume from any stage

CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL DEFAULT 'STARTED' CHECK (current_stage IN ('STARTED', 'PERSONAL_INFO', 'PROFESSIONAL_INFO', 'TERMS', 'COMPLETED')),
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_stage ON onboarding_progress(current_stage);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- Add comments
COMMENT ON TABLE onboarding_progress IS 'Tracks onboarding progress with state machine pattern';
COMMENT ON COLUMN onboarding_progress.current_stage IS 'Current stage: STARTED, PERSONAL_INFO, PROFESSIONAL_INFO, TERMS, COMPLETED';
COMMENT ON COLUMN onboarding_progress.data IS 'JSONB field storing partial form data for resume capability';

