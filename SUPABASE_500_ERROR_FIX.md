# Fix: Supabase 500 Error on OAuth Callback

## Error
```
GET https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback?... 500 (Internal Server Error)
```

## Root Cause
The error is happening at **Supabase's callback endpoint**, which means:
1. ✅ Google OAuth is working (redirecting back)
2. ❌ Supabase is failing to process the callback
3. Most likely: **Google Cloud Console redirect URI mismatch**

## Fix: Google Cloud Console Configuration

### Step 1: Check Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (the one used in Supabase)
5. Click to edit it

### Step 2: Verify Authorized Redirect URIs

In the **Authorized redirect URIs** section, you **MUST** have:

```
https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback
```

**Important Notes:**
- This is Supabase's callback URL (not your app's callback)
- Must match exactly (including `https://` and no trailing slash)
- Your Supabase project ID is: `jygdjpcmcfglopktusdm`

### Step 3: Add if Missing

If the Supabase callback URL is **not** in the list:
1. Click **"Add URI"**
2. Enter: `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
3. Click **"Save"**

### Step 4: Verify Supabase Google Provider Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Click on **Google** provider
4. Verify:
   - ✅ **Enabled**: Toggle is ON
   - ✅ **Client ID**: Matches your Google Cloud Console Client ID
   - ✅ **Client Secret**: Matches your Google Cloud Console Client Secret

### Step 5: Common Issues to Check

#### Issue 1: Wrong OAuth Client
- Make sure you're using the **same** OAuth Client ID in both:
  - Google Cloud Console
  - Supabase Google Provider settings

#### Issue 2: Redirect URI Format
- Must be: `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
- ❌ NOT: `http://...` (must be HTTPS)
- ❌ NOT: `.../auth/v1/callback/` (no trailing slash)
- ❌ NOT: `.../callback` (must include `/auth/v1/`)

#### Issue 3: Multiple Google Accounts
- If you see `authuser=2` in the URL, you might be logged into multiple Google accounts
- Try using an incognito window or logging out of other Google accounts

## Verification Steps

After making changes:

1. **Wait 1-2 minutes** for Google Cloud Console changes to propagate

2. **Clear browser cache/cookies** (or use incognito)

3. **Try login again**:
   - Go to `http://localhost:3000/login`
   - Click "Continue with Google"
   - Should redirect to Google → then to Supabase → then to your app

4. **Check browser console**:
   - Should NOT see 500 error from Supabase
   - Should see successful redirect to `/auth/callback?code=...`

## Debugging

If still getting 500 error:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs → API Logs
   - Look for errors around the time of login attempt

2. **Check Google Cloud Console**:
   - Verify the redirect URI is exactly: `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
   - Check if there are any warnings or errors

3. **Verify OAuth Client**:
   - Make sure the Client ID in Supabase matches the one in Google Cloud Console
   - Make sure the Client Secret is correct

## Quick Checklist

- [ ] Google Cloud Console has: `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
- [ ] Supabase Google Provider is enabled
- [ ] Client ID matches in both places
- [ ] Client Secret matches in both places
- [ ] Waited 1-2 minutes after changes
- [ ] Cleared browser cache/cookies
- [ ] Tried in incognito window
