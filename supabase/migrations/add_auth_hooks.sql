-- Supabase Auth Hooks for Tenant Context in JWT
-- 
-- Adds tenant_id and role to JWT claims via Supabase Auth hooks.
-- This simplifies role detection and eliminates pathname/referer dependency.
-- 
-- Based on industry best practices from AWS Cognito and Auth0.

-- ============================================================================
-- FUNCTION TO GET USER ROLE FROM DATABASE
-- ============================================================================

-- Function to get user role and tenant info for JWT claims
CREATE OR REPLACE FUNCTION get_user_tenant_info(p_auth_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  account_status TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.role,
    u.account_status,
    u.email
  FROM users u
  WHERE u.auth_user_id = p_auth_user_id
  OR u.id = p_auth_user_id
  ORDER BY 
    CASE u.role
      WHEN 'ADMIN' THEN 1
      WHEN 'DIETITIAN' THEN 2
      WHEN 'THERAPIST' THEN 3
      WHEN 'USER' THEN 4
    END
  LIMIT 1; -- Return first match (prioritized by role)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTH HOOK FUNCTION
-- ============================================================================

-- Function to add tenant context to JWT claims
-- This is called by Supabase Auth hooks when generating JWTs
CREATE OR REPLACE FUNCTION add_tenant_to_jwt()
RETURNS TRIGGER AS $$
DECLARE
  v_user_info RECORD;
BEGIN
  -- Get user info from database
  SELECT * INTO v_user_info
  FROM get_user_tenant_info(NEW.id);

  -- Add tenant context to JWT claims
  IF v_user_info.user_id IS NOT NULL THEN
    NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'tenant_id', v_user_info.user_id::text,
      'user_role', v_user_info.role,
      'account_status', v_user_info.account_status,
      'app_user_id', v_user_info.user_id::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FOR AUTH.USERS
-- ============================================================================

-- Note: Supabase Auth hooks are configured via the Supabase dashboard
-- or API, not via SQL triggers. This migration provides the function
-- that should be called by the webhook.

-- For Supabase, you need to:
-- 1. Create a webhook that calls this function on auth.users INSERT/UPDATE
-- 2. Or use Supabase Edge Functions to modify JWT claims
-- 3. Or use Supabase Auth hooks (if available in your plan)

-- This SQL provides the database function that the webhook/function will call.

-- ============================================================================
-- ALTERNATIVE: EDGE FUNCTION APPROACH
-- ============================================================================

-- If using Supabase Edge Functions, create a function that:
-- 1. Listens to auth.users changes
-- 2. Updates user_metadata with tenant info
-- 3. This metadata is automatically included in JWT claims

-- Example Edge Function (TypeScript) would be:
-- ```typescript
-- import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
-- 
-- serve(async (req) => {
--   const { record } = await req.json()
--   const userId = record.id
//   
//   // Get user info from database
//   const { data } = await supabaseAdmin
//     .from('users')
//     .select('id, role, account_status, email')
//     .or(`id.eq.${userId},auth_user_id.eq.${userId}`)
//     .single()
//   
//   // Update auth.users metadata
//   await supabaseAdmin.auth.admin.updateUserById(userId, {
//     user_metadata: {
//       tenant_id: data.id,
//       user_role: data.role,
//       account_status: data.account_status
//     }
//   })
// })
-- ```

-- ============================================================================
-- HELPER FUNCTION FOR EDGE FUNCTIONS
-- ============================================================================

-- Function that Edge Functions can call to get tenant info
CREATE OR REPLACE FUNCTION get_tenant_info_for_auth_user(p_auth_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'tenant_id', u.id::text,
    'user_role', u.role,
    'account_status', u.account_status,
    'email', u.email
  ) INTO v_result
  FROM users u
  WHERE u.auth_user_id = p_auth_user_id
  OR u.id = p_auth_user_id
  ORDER BY 
    CASE u.role
      WHEN 'ADMIN' THEN 1
      WHEN 'DIETITIAN' THEN 2
      WHEN 'THERAPIST' THEN 3
      WHEN 'USER' THEN 4
    END
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_user_tenant_info(UUID) IS 'Gets user role and tenant info for JWT claims';
COMMENT ON FUNCTION add_tenant_to_jwt() IS 'Adds tenant context to JWT claims (called by auth hooks)';
COMMENT ON FUNCTION get_tenant_info_for_auth_user(UUID) IS 'Helper function for Edge Functions to get tenant info';

