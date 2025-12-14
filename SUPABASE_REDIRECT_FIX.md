# Supabase OAuth Redirect Fix

## Issue
Getting `{"code":500,"error_code":"unexpected_failure","msg":"Unexpected failure, please check server logs for more information"}` when trying to log in with Google.

## Root Cause
**Redirect URL Mismatch**: The redirect URL configured in Supabase doesn't match the URL your app is using.

## Solution: Update Supabase Redirect URLs

### Steps:
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**
3. Check the **Redirect URLs** section

### Required Configuration:

**For Local Development:**
- **Site URL**: `http://localhost:3000` (or leave as is)
- **Redirect URLs** must include:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**` (wildcard for all routes)

**For Production:**
- **Site URL**: `https://daiyet.store` (or your production domain)
- **Redirect URLs** must include:
  - `https://daiyet.store/auth/callback`
  - `https://daiyet.store/**` (wildcard for all routes)

### Recommended: Add BOTH URLs

To support both local development and production, add **ALL** of these to the Redirect URLs list:

```
http://localhost:3000/auth/callback
http://localhost:3000/**
https://daiyet.store/auth/callback
https://daiyet.store/**
```

### Example Supabase Configuration:

```
Site URL: https://daiyet.store

Redirect URLs:
- http://localhost:3000/auth/callback
- http://localhost:3000/**
- https://daiyet.store/auth/callback
- https://daiyet.store/**
```

4. **Save** the changes
5. **Wait 1-2 minutes** for changes to propagate
6. Clear browser cache and cookies
7. Try logging in again

## Environment Variables

### Local Development (`.env.local`):
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Netlify/Deployment):
```env
NEXT_PUBLIC_SITE_URL=https://daiyet.store
```

## Verification

After updating Supabase configuration:

1. **Check browser console** when clicking "Continue with Google":
   - Should see: `🔐 OAuth redirect URL: http://localhost:3000/auth/callback` (for local)
   - Or: `🔐 OAuth redirect URL: https://daiyet.store/auth/callback` (for production)

2. **Check the actual redirect**:
   - After Google authentication, you should be redirected to `/auth/callback?code=...`
   - If you see an error or get redirected elsewhere, the URL mismatch is still present

3. **Check server logs**:
   - Look for `AuthCallbackFatalError` or `AuthCallbackSessionError`
   - These will show the actual error details

## Common Issues

### Issue 1: Only Production URL in Supabase
**Symptom**: Works in production, fails locally with 500 error
**Fix**: Add `http://localhost:3000/auth/callback` to Supabase redirect URLs

### Issue 2: Only Localhost URL in Supabase
**Symptom**: Works locally, fails in production
**Fix**: Add `https://daiyet.store/auth/callback` to Supabase redirect URLs

### Issue 3: Wrong Protocol (http vs https)
**Symptom**: Always fails
**Fix**: Ensure protocol matches (http for localhost, https for production)

### Issue 4: Missing Wildcard
**Symptom**: Works sometimes, fails other times
**Fix**: Add `/**` wildcard patterns to catch all routes

## Additional Check: Google Cloud Console

Also verify in Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Check **Authorized redirect URIs**:
   - Should include: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - (This is for Supabase's OAuth flow, not your app directly)

## Quick Test

After making changes, test with:

1. **Local Test**:
   ```bash
   # Make sure .env.local has:
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Then try logging in at:
   http://localhost:3000/login
   ```

2. **Check Console**:
   - Open browser DevTools → Console
   - Click "Continue with Google"
   - Should see: `🔐 OAuth redirect URL: http://localhost:3000/auth/callback`
   - If it shows a different URL, check your environment variable

3. **Check Network Tab**:
   - After Google redirects back, check the `/auth/callback` request
   - Should return 302 redirect (not 500 error)
   - If 500, check server logs for detailed error
