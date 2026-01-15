-- Migration: Create Audit Logs Table
-- Comprehensive audit logging for security, compliance, and debugging

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist (in case table was created without them in a previous migration)
DO $$ 
BEGIN
  -- Only proceed if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_logs'
  ) THEN
    -- Add event column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'event'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN event TEXT;
      UPDATE audit_logs SET event = 'MIGRATION_PLACEHOLDER' WHERE event IS NULL;
      ALTER TABLE audit_logs ALTER COLUMN event SET NOT NULL;
    END IF;

    -- Add user_id column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'user_id'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Add tenant_id column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'tenant_id'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN tenant_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Add ip_address column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'ip_address'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN ip_address INET;
    END IF;

    -- Add user_agent column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'user_agent'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    END IF;

    -- Add metadata column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'metadata'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::JSONB;
    END IF;

    -- Add created_at column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'created_at'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_created_at ON audit_logs(event, created_at DESC);

-- Add composite index for user event queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event ON audit_logs(user_id, event, created_at DESC);

-- Add GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- Add partition by month for better performance (optional, for high-volume systems)
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for security, compliance, and debugging';
COMMENT ON COLUMN audit_logs.event IS 'Event type: USER_LOGIN, USER_LOGOUT, ONBOARDING_COMPLETED, etc.';
COMMENT ON COLUMN audit_logs.metadata IS 'JSONB field for additional event-specific data';

-- Add RLS policy (read-only for admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
  );

