-- Enhanced Audit Logging with Retention Policies
-- 
-- Adds comprehensive audit logging with tenant context tracking
-- and automatic retention policies for compliance.
-- 
-- Based on industry best practices from Salesforce and Microsoft.

-- ============================================================================
-- ENHANCE AUDIT_LOGS TABLE
-- ============================================================================

-- Add additional columns if they don't exist
DO $$
BEGIN
  -- Add tenant_role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'tenant_role'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN tenant_role TEXT;
  END IF;

  -- Add account_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN account_status TEXT;
  END IF;

  -- Add resource_type column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'resource_type'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_type TEXT;
  END IF;

  -- Add resource_id column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'resource_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_id UUID;
  END IF;

  -- Add retention_date column for automatic cleanup
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'retention_date'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN retention_date TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_role 
  ON audit_logs(tenant_id, tenant_role, created_at DESC);

-- Index for resource-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource 
  ON audit_logs(resource_type, resource_id, created_at DESC);

-- Index for event-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_tenant 
  ON audit_logs(event, tenant_id, created_at DESC);

-- Index for retention cleanup
CREATE INDEX IF NOT EXISTS idx_audit_logs_retention 
  ON audit_logs(retention_date) WHERE retention_date IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_event_date 
  ON audit_logs(tenant_id, event, created_at DESC);

-- ============================================================================
-- FUNCTION TO SET RETENTION DATE
-- ============================================================================

-- Function to automatically set retention date based on event type
CREATE OR REPLACE FUNCTION set_audit_log_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention date based on event type
  -- Security events: 7 years (HIPAA requirement)
  -- Data access: 1 year
  -- Other events: 90 days
  NEW.retention_date := CASE
    WHEN NEW.event IN ('SECURITY_EVENT', 'USER_LOGIN', 'USER_LOGOUT', 'PASSWORD_RESET', 'ACCOUNT_STATUS_CHANGE') THEN
      NEW.created_at + INTERVAL '7 years'
    WHEN NEW.event IN ('DATA_ACCESS', 'DATA_MODIFIED', 'API_ACCESS') THEN
      NEW.created_at + INTERVAL '1 year'
    ELSE
      NEW.created_at + INTERVAL '90 days'
  END;

  -- Populate tenant_role and account_status from metadata if available
  IF NEW.metadata ? 'user_role' THEN
    NEW.tenant_role := NEW.metadata->>'user_role';
  END IF;

  IF NEW.metadata ? 'account_status' THEN
    NEW.account_status := NEW.metadata->>'account_status';
  END IF;

  -- Populate resource_type and resource_id from metadata if available
  IF NEW.metadata ? 'resource_type' THEN
    NEW.resource_type := NEW.metadata->>'resource_type';
  END IF;

  IF NEW.metadata ? 'resource_id' THEN
    NEW.resource_id := (NEW.metadata->>'resource_id')::UUID;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set retention date
DROP TRIGGER IF EXISTS set_audit_log_retention_trigger ON audit_logs;
CREATE TRIGGER set_audit_log_retention_trigger
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_log_retention();

-- ============================================================================
-- FUNCTION TO CLEANUP EXPIRED AUDIT LOGS
-- ============================================================================

-- Function to delete expired audit logs
CREATE OR REPLACE FUNCTION cleanup_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete logs where retention_date has passed
  WITH deleted AS (
    DELETE FROM audit_logs
    WHERE retention_date IS NOT NULL
    AND retention_date < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED CLEANUP JOB
-- ============================================================================

-- Create a scheduled job to run cleanup daily
-- Note: This requires pg_cron extension (available in Supabase)
DO $$
BEGIN
  -- Check if pg_cron is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule daily cleanup at 2 AM
    PERFORM cron.schedule(
      'cleanup-expired-audit-logs',
      '0 2 * * *', -- Daily at 2 AM
      $$SELECT cleanup_expired_audit_logs()$$
    );
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Manual cleanup required.';
  END IF;
END $$;

-- ============================================================================
-- FUNCTION TO GET AUDIT LOGS FOR TENANT
-- ============================================================================

-- Function to get audit logs for a specific tenant with pagination
CREATE OR REPLACE FUNCTION get_tenant_audit_logs(
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_event_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  event TEXT,
  user_id UUID,
  tenant_id UUID,
  tenant_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.event,
    al.user_id,
    al.tenant_id,
    al.tenant_role,
    al.ip_address,
    al.user_agent,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE al.tenant_id = p_tenant_id
  AND (p_event_type IS NULL OR al.event = p_event_type)
  AND (p_start_date IS NULL OR al.created_at >= p_start_date)
  AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION TO GET DATA ACCESS LOGS
-- ============================================================================

-- Function to get all data access logs for a resource
CREATE OR REPLACE FUNCTION get_resource_access_logs(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  event TEXT,
  user_id UUID,
  tenant_id UUID,
  tenant_role TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.event,
    al.user_id,
    al.tenant_id,
    al.tenant_role,
    al.ip_address,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE al.resource_type = p_resource_type
  AND al.resource_id = p_resource_id
  AND al.event IN ('DATA_ACCESS', 'DATA_MODIFIED')
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION set_audit_log_retention() IS 'Automatically sets retention date based on event type';
COMMENT ON FUNCTION cleanup_expired_audit_logs() IS 'Deletes expired audit logs based on retention_date';
COMMENT ON FUNCTION get_tenant_audit_logs(UUID, INTEGER, INTEGER, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Gets audit logs for a tenant with filtering and pagination';
COMMENT ON FUNCTION get_resource_access_logs(TEXT, UUID, INTEGER) IS 'Gets all data access logs for a specific resource';

