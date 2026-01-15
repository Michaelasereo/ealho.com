-- Storage policies for session-recordings bucket
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql

-- Policy 1: Allow therapists to upload files
CREATE POLICY "Therapists can upload audio recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-recordings' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM users WHERE role = 'THERAPIST'
  )
);

-- Policy 2: Allow therapists to read their own files
CREATE POLICY "Therapists can read their own audio recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'session-recordings' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM users WHERE role = 'THERAPIST'
  )
);

-- Policy 3: Allow service role to manage all files
CREATE POLICY "Service role can manage all audio recordings"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'session-recordings');
