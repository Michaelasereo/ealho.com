# Supabase Storage Bucket Setup for AI Notes

This guide explains how to create the `session-recordings` storage bucket in Supabase for storing therapy session audio recordings.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `session-recordings`
   - **Public bucket**: **Unchecked** (Keep private for security)
   - **File size limit**: 26214400 (25MB - OpenAI Whisper limit)
   - **Allowed MIME types**: `audio/webm,audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,audio/ogg`

6. Click **Create bucket**

## Step 2: Set Up Row Level Security (RLS) Policies

The bucket should only be accessible by authenticated therapists. Create RLS policies in Supabase:

1. Go to **Storage** → **Policies** → **session-recordings**
2. Click **New Policy**

### Policy 1: Allow therapists to upload files

**Policy Name**: `Therapists can upload audio recordings`

**Policy Definition** (SQL):
```sql
CREATE POLICY "Therapists can upload audio recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-recordings' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM users WHERE role = 'THERAPIST'
  )
);
```

### Policy 2: Allow therapists to read their own files

**Policy Name**: `Therapists can read their own audio recordings`

**Policy Definition** (SQL):
```sql
CREATE POLICY "Therapists can read their own audio recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'session-recordings' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM users WHERE role = 'THERAPIST'
  )
);
```

### Policy 3: Allow service role to manage all files

**Policy Name**: `Service role can manage all audio recordings`

**Policy Definition** (SQL):
```sql
CREATE POLICY "Service role can manage all audio recordings"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'session-recordings');
```

## Step 3: Verify Bucket Setup

1. Check that the bucket appears in **Storage** → **Buckets**
2. Verify that the bucket is **Private** (not public)
3. Test upload access (should only work for authenticated therapists)

## Step 4: Test Upload (Optional)

You can test the upload functionality using the API endpoint:

```bash
curl -X POST http://localhost:3000/api/session-notes/upload-audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test-audio.webm" \
  -F "sessionNoteId=YOUR_NOTE_ID"
```

## File Structure

Files are stored with the following structure:
```
session-recordings/
  {therapist_id}/
    {timestamp}-{session_note_id}.{extension}
```

Example:
```
session-recordings/
  a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/
    1704067200000-123e4567-e89b-12d3-a456-426614174000.webm
```

## Security Considerations

1. **Private Bucket**: The bucket should remain private (not public) to protect patient data
2. **RLS Policies**: Only therapists can upload/read files in their own folder
3. **File Size Limit**: 25MB limit prevents oversized uploads
4. **MIME Type Validation**: Only audio files are allowed
5. **Service Role**: The service role (used by API routes) has full access for processing

## Troubleshooting

### Error: "Bucket does not exist"
- Verify the bucket name is exactly `session-recordings`
- Check that the bucket was created successfully

### Error: "Access denied"
- Verify RLS policies are correctly configured
- Check that the user has the THERAPIST role
- Ensure the service role key is being used for API routes

### Error: "File size exceeds limit"
- Check that the file is under 25MB
- Verify the bucket's file size limit is set correctly

### Error: "Invalid file type"
- Verify the file is one of the supported formats: webm, mp3, wav, m4a, ogg
- Check that the MIME type validation is correct
