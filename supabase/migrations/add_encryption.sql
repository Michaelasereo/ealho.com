-- Data Encryption at Rest
-- 
-- Implements column-level encryption for sensitive data (PII, health data).
-- Uses PostgreSQL's pgcrypto extension for encryption.
-- 
-- Based on industry best practices from Vercel and Supabase.
-- 
-- Note: Supabase handles encryption at the infrastructure level,
-- but this adds application-level encryption for extra security.

-- ============================================================================
-- ENABLE PGPCRYPTO EXTENSION
-- ============================================================================

-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENCRYPTION KEY MANAGEMENT
-- ============================================================================

-- Create a table to store encryption keys (rotated periodically)
-- In production, use a key management service (AWS KMS, HashiCorp Vault, etc.)
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  encrypted_key BYTEA NOT NULL, -- Key encrypted with master key
  algorithm TEXT DEFAULT 'aes-256-gcm',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Index for active keys
CREATE INDEX IF NOT EXISTS idx_encryption_keys_active 
  ON encryption_keys(is_active, created_at DESC) 
  WHERE is_active = true;

-- Function to get current encryption key
CREATE OR REPLACE FUNCTION get_encryption_key(p_key_name TEXT DEFAULT 'default')
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- In production, decrypt the key using master key from environment
  -- For now, use a key derived from environment variable
  -- This should be replaced with proper key management
  SELECT encode(decrypt(
    encrypted_key,
    current_setting('app.encryption_master_key', true),
    'aes'
  ), 'hex') INTO v_key
  FROM encryption_keys
  WHERE key_name = p_key_name
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Fallback: use environment variable directly (for development)
  IF v_key IS NULL THEN
    v_key := current_setting('app.encryption_key', true);
  END IF;

  RETURN v_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENCRYPTION FUNCTIONS
-- ============================================================================

-- Function to encrypt sensitive text data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(
  p_data TEXT,
  p_key_name TEXT DEFAULT 'default'
)
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
BEGIN
  v_key := get_encryption_key(p_key_name);
  
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found: %', p_key_name;
  END IF;

  -- Encrypt using AES-256-GCM
  RETURN encode(
    encrypt(
      p_data::bytea,
      decode(v_key, 'hex'),
      'aes-256-gcm'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive text data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(
  p_encrypted_data TEXT,
  p_key_name TEXT DEFAULT 'default'
)
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
BEGIN
  v_key := get_encryption_key(p_key_name);
  
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found: %', p_key_name;
  END IF;

  -- Decrypt using AES-256-GCM
  RETURN convert_from(
    decrypt(
      decode(p_encrypted_data, 'base64'),
      decode(v_key, 'hex'),
      'aes-256-gcm'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENCRYPTED COLUMNS
-- ============================================================================

-- Add encrypted columns to users table for sensitive PII
DO $$
BEGIN
  -- Add encrypted_email column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'encrypted_email'
  ) THEN
    ALTER TABLE users ADD COLUMN encrypted_email TEXT;
  END IF;

  -- Add encrypted_phone column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'encrypted_phone'
  ) THEN
    ALTER TABLE users ADD COLUMN encrypted_phone TEXT;
  END IF;
END $$;

-- Add encrypted columns to session_notes for health data
DO $$
BEGIN
  -- Add encrypted_patient_complaint column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_notes' AND column_name = 'encrypted_patient_complaint'
  ) THEN
    ALTER TABLE session_notes ADD COLUMN encrypted_patient_complaint TEXT;
  END IF;

  -- Add encrypted_personal_history column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_notes' AND column_name = 'encrypted_personal_history'
  ) THEN
    ALTER TABLE session_notes ADD COLUMN encrypted_personal_history TEXT;
  END IF;

  -- Add encrypted_family_history column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_notes' AND column_name = 'encrypted_family_history'
  ) THEN
    ALTER TABLE session_notes ADD COLUMN encrypted_family_history TEXT;
  END IF;

  -- Add encrypted_formulation column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_notes' AND column_name = 'encrypted_formulation'
  ) THEN
    ALTER TABLE session_notes ADD COLUMN encrypted_formulation TEXT;
  END IF;
END $$;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC ENCRYPTION
-- ============================================================================

-- Function to encrypt sensitive data before insert/update
CREATE OR REPLACE FUNCTION encrypt_user_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Encrypt email if provided (for extra security layer)
  -- Note: Email is already stored in plain text for authentication
  -- This is an additional encrypted copy for compliance
  IF NEW.encrypted_email IS NULL AND NEW.email IS NOT NULL THEN
    NEW.encrypted_email := encrypt_sensitive_data(NEW.email);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS encrypt_user_data_trigger ON users;
CREATE TRIGGER encrypt_user_data_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_user_sensitive_data();

-- Function to encrypt session notes sensitive data
CREATE OR REPLACE FUNCTION encrypt_session_notes_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Encrypt patient complaint
  IF NEW.patient_complaint IS NOT NULL AND NEW.encrypted_patient_complaint IS NULL THEN
    NEW.encrypted_patient_complaint := encrypt_sensitive_data(NEW.patient_complaint);
  END IF;

  -- Encrypt personal history
  IF NEW.personal_history IS NOT NULL AND NEW.encrypted_personal_history IS NULL THEN
    NEW.encrypted_personal_history := encrypt_sensitive_data(NEW.personal_history);
  END IF;

  -- Encrypt family history
  IF NEW.family_history IS NOT NULL AND NEW.encrypted_family_history IS NULL THEN
    NEW.encrypted_family_history := encrypt_sensitive_data(NEW.family_history);
  END IF;

  -- Encrypt formulation and diagnosis
  IF NEW.formulation_and_diagnosis IS NOT NULL AND NEW.encrypted_formulation IS NULL THEN
    NEW.encrypted_formulation := encrypt_sensitive_data(NEW.formulation_and_diagnosis);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session_notes table
DROP TRIGGER IF EXISTS encrypt_session_notes_trigger ON session_notes;
CREATE TRIGGER encrypt_session_notes_trigger
  BEFORE INSERT OR UPDATE ON session_notes
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_session_notes_data();

-- ============================================================================
-- KEY ROTATION FUNCTION
-- ============================================================================

-- Function to rotate encryption keys
CREATE OR REPLACE FUNCTION rotate_encryption_key(
  p_key_name TEXT DEFAULT 'default',
  p_new_key TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_key_id UUID;
  v_new_key TEXT;
BEGIN
  -- Generate new key if not provided
  IF p_new_key IS NULL THEN
    v_new_key := encode(gen_random_bytes(32), 'hex');
  ELSE
    v_new_key := p_new_key;
  END IF;

  -- Encrypt new key with master key
  INSERT INTO encryption_keys (
    key_name,
    encrypted_key,
    algorithm,
    is_active
  ) VALUES (
    p_key_name,
    encrypt(
      decode(v_new_key, 'hex'),
      current_setting('app.encryption_master_key', true),
      'aes'
    ),
    'aes-256-gcm',
    true
  )
  RETURNING id INTO v_new_key_id;

  -- Deactivate old keys
  UPDATE encryption_keys
  SET is_active = false,
      expires_at = NOW()
  WHERE key_name = p_key_name
  AND id != v_new_key_id
  AND is_active = true;

  RETURN v_new_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE encryption_keys IS 'Stores encryption keys for column-level encryption';
COMMENT ON FUNCTION encrypt_sensitive_data(TEXT, TEXT) IS 'Encrypts sensitive text data using AES-256-GCM';
COMMENT ON FUNCTION decrypt_sensitive_data(TEXT, TEXT) IS 'Decrypts sensitive text data';
COMMENT ON FUNCTION rotate_encryption_key(TEXT, TEXT) IS 'Rotates encryption keys for security';

-- ============================================================================
-- NOTES
-- ============================================================================

-- IMPORTANT: 
-- 1. Set app.encryption_master_key in PostgreSQL configuration
-- 2. In production, use a key management service (AWS KMS, HashiCorp Vault)
-- 3. Rotate keys periodically (quarterly recommended)
-- 4. Keep old keys for decryption of historical data
-- 5. Monitor encryption/decryption performance

