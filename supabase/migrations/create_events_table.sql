-- Migration: Create Events Table
-- Event-driven architecture for decoupled, reliable event processing

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Add composite index for unprocessed events
CREATE INDEX IF NOT EXISTS idx_events_unprocessed ON events(processed, created_at) WHERE processed = FALSE;

-- Add GIN index for payload JSONB queries
CREATE INDEX IF NOT EXISTS idx_events_payload ON events USING GIN (payload);

-- Add comments
COMMENT ON TABLE events IS 'Event bus for decoupled event processing';
COMMENT ON COLUMN events.type IS 'Event type: ONBOARDING_COMPLETED, USER_CREATED, etc.';
COMMENT ON COLUMN events.payload IS 'JSONB field for event-specific data';
COMMENT ON COLUMN events.processed IS 'Whether background jobs have processed this event';

