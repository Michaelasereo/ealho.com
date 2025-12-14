# Fix Supabase URL Configuration for Local Development

## Current Issue
Your Supabase configuration only has the production URL, but you're testing locally. This causes the 500 error.

## Current Configuration (from screenshot):
- **Site URL**: `https://daiyet.store` ✅ (Keep this)
- **Redirect URLs**: Only `https://daiyet.store/auth/callback` ❌ (Missing localhost)

## Fix: Add Localhost URLs

### Step-by-Step:

1. **In the Supabase dashboard** (where you see the screenshot):
   - Click the green **"Add URL"** button in the Redirect URLs section

2. **Add these URLs one by one**:
   ```
   http://localhost:3000/auth/callback
   ```
   Click "Add URL" again and add:
   ```
   http://localhost:3000/**
   ```

3. **Your final Redirect URLs list should have**:
   - ✅ `https://daiyet.store/auth/callback` (keep existing)
   - ✅ `http://localhost:3000/auth/callback` (add this)
   - ✅ `http://localhost:3000/**` (add this - wildcard for all localhost routes)

4. **Click "Save changes"** (the green button at the top)

5. **Wait 1-2 minutes** for changes to propagate

6. **Clear your browser cache/cookies** and try logging in again

## Why This Works

- **Production**: Uses `https://daiyet.store/auth/callback` ✅
- **Local Development**: Uses `http://localhost:3000/auth/callback` ✅
- Both URLs are now allowed, so authentication works in both environments

## Verification

After adding the URLs:
1. Open browser console (F12)
2. Go to `http://localhost:3000/login` (or your login page)
3. Click "Continue with Google"
4. Check console - should see: `🔐 OAuth redirect URL: http://localhost:3000/auth/callback`
5. After Google auth, should redirect to `/auth/callback?code=...` (not 500 error)

## Optional: Keep Production as Primary

You can keep `https://daiyet.store` as the Site URL (which is correct for production). The redirect URLs list allows multiple URLs, so adding localhost won't affect production.
