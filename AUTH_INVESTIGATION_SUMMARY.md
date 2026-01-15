# Authentication Investigation Summary

## Current Status

After testing all therapist dashboard sidebar items and applying fixes, authentication is still failing for API routes.

## Issues Found

### 1. Event Types API (`/api/event-types`)
- **Status**: 403 Forbidden
- **Error**: "Authentication required. Please log in to view event types."
- **Root Cause**: `getCurrentUserFromRequest` is returning `null` for API routes

### 2. Session Request API (`/api/session-request`)
- **Status**: 401 Unauthorized
- **Root Cause**: Same as above - authentication failing

### 3. Meal Plans API (`/api/meal-plans`)
- **Status**: 500 Internal Server Error
- **Root Cause**: Likely same authentication issue

## Fixes Applied

1. ✅ **Updated `getCurrentUserFromRequest`** (`lib/auth-helpers.ts`):
   - Added referer header checking for API routes
   - Added fallback to try both DIETITIAN and THERAPIST roles
   - Added fallback to try by `id` (not just `auth_user_id`)
   - Added detailed logging for debugging

2. ✅ **Updated Session Request API** (`app/api/session-request/route.ts`):
   - Added THERAPIST role support in dev mode fallback

## Root Cause Analysis

The authentication is failing because:

1. **Session Not Found**: Console shows "No session found" and "Session fetch timed out"
   - This suggests either:
     - The user isn't actually authenticated (but they can access `/therapist-dashboard` page)
     - The cookies aren't being passed correctly to API routes
     - The Supabase client in API routes isn't reading cookies properly

2. **User Lookup Failing**: `getCurrentUserFromRequest` returns `null` even when:
   - The user can access the dashboard page (which uses the same auth system)
   - The referer header approach should work

## Debugging Steps Taken

1. ✅ Added detailed logging to `getCurrentUserFromRequest`
2. ✅ Added logging for API route authentication attempts
3. ✅ Added fallback logic for both roles
4. ✅ Updated session-request API to support THERAPIST

## Next Steps to Resolve

### Immediate Actions Needed

1. **Check Server Logs**:
   - Look at the terminal where `npm run dev` is running
   - Check for `[AUTH]` log messages to see where authentication is failing
   - Verify if `supabase.auth.getUser()` is returning a user

2. **Verify User Record in Database**:
   - Check if the user exists in the `users` table
   - Verify `auth_user_id` is set correctly
   - Verify `role = 'THERAPIST'`
   - Check if there are multiple records for the same email

3. **Check Cookie Passing**:
   - Verify cookies are being sent with fetch requests (check Network tab)
   - Verify the Supabase client is reading cookies correctly
   - Check if there's a CORS or cookie domain issue

4. **Test Authentication Flow**:
   - Try logging out and logging back in
   - Check if the session is created correctly
   - Verify the session cookie is being set

### Code Changes to Consider

1. **Add More Logging**:
   - Log cookie headers in API routes
   - Log the result of `supabase.auth.getUser()`
   - Log database query results

2. **Alternative Approach**:
   - Instead of relying on referer header, pass role as a query parameter or header
   - Or use a custom header like `X-User-Role` to identify the role

3. **Check Middleware**:
   - Verify middleware isn't blocking the requests
   - Check if middleware is setting cookies correctly

## Files Modified

1. `lib/auth-helpers.ts` - Added referer checking and role fallback logic
2. `app/api/session-request/route.ts` - Added THERAPIST support in dev mode

## Testing Checklist

- [ ] Check server terminal logs for `[AUTH]` messages
- [ ] Verify user record exists in database with correct role
- [ ] Test cookie passing in browser Network tab
- [ ] Try logging out and back in
- [ ] Check if session cookie is being set correctly
- [ ] Verify Supabase client is reading cookies in API routes

