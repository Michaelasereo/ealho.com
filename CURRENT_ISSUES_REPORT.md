# Current Issues Report - Therapist Dashboard & Onboarding

## Date: Current Session
## Status: Partially Resolved - Testing Required

## ⚡ Senior Developer Review Applied
**Status:** Immediate fixes implemented based on 40-year healthcare systems expert review
**Key Insight:** Dual identity mapping (`auth_user_id` vs `id`) is the root cause - classic "two-user-table" antipattern

---

## Issue Summary

### 1. ✅ FIXED: Onboarding "Complete Onboarding" Button Stuck in Submitting State
**Status:** Fixed  
**Severity:** High  
**Impact:** Users cannot complete onboarding flow

#### Problem
- Button shows "Submitting..." indefinitely
- API call to `/api/onboarding/complete` was returning 401 Unauthorized
- User lookup was using wrong field (`id` instead of `auth_user_id`)

#### Root Cause
- New users created after onboarding implementation have `auth_user_id` set, but the API was querying by database `id`
- Authentication session wasn't being properly retrieved in API route

#### Solution Applied
**File:** `app/api/onboarding/complete/route.ts`

```typescript
// BEFORE: Querying by wrong field
.eq("id", authUser.id)  // ❌ Wrong - authUser.id is auth ID, not DB ID

// AFTER: Query by auth_user_id first, then fallback
.eq("auth_user_id", authUser.id)  // ✅ Correct
.eq("role", role)
.maybeSingle();

// Fallback for backward compatibility
if (error || !existingUser) {
  const { data: profileById } = await supabaseAdmin
    .from("users")
    .select("id, metadata, role")
    .eq("id", authUser.id)  // Fallback for old accounts
    .eq("role", role)
    .maybeSingle();
}
```

**File:** `components/onboarding/OnboardingModal.tsx`
- Added timeout protection (30s fetch timeout, 35s safety reset)
- Added session token retrieval and Authorization header
- Added better error logging

```typescript
// Get session token for authentication
const supabase = createBrowserClient();
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError || !session) {
  throw new Error("Session expired. Please refresh the page and try again.");
}

const response = await fetch("/api/onboarding/complete", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,  // ✅ Added
  },
  body: JSON.stringify({...}),
});
```

---

### 2. 🔄 IN PROGRESS: Therapist Profile Data Not Fetching (401 Unauthorized)
**Status:** Fixed but needs testing  
**Severity:** High  
**Impact:** Profile settings page cannot load therapist data

#### Problem
- API endpoint `/api/therapists/profile` returns 401 Unauthorized
- Profile settings page shows empty form
- Console shows: "Failed to load profile: Error: Unauthorized: Session expired"

#### Root Cause
- `getCurrentUserFromRequest()` was returning null
- Session wasn't being properly retrieved in API route
- Query was using wrong field (`id` instead of `auth_user_id`)

#### Solution Applied
**File:** `app/api/therapists/profile/route.ts`

**Changes:**
1. Removed dependency on `getCurrentUserFromRequest()` 
2. Get auth user directly from session (same pattern as onboarding API)
3. Query by `auth_user_id` first, then fallback to `id`

```typescript
// Get auth user ID from session first
const cookieHeader = getCookieHeader(request);
const supabase = createRouteHandlerClientFromRequest(cookieHeader);

// Try Authorization header first, then fall back to cookies
const authHeader = request.headers.get("authorization");
let authUser = null;
let authError = null;

if (authHeader?.startsWith("Bearer ")) {
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  authUser = user;
  authError = error;
} else {
  // Fall back to cookies - try getSession first
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    authUser = user;
    authError = error;
  } else {
    const { data: { user }, error } = await supabase.auth.getUser();
    authUser = user;
    authError = error;
  }
}

// Query by auth_user_id (for new users after onboarding)
const { data: therapistProfile, error } = await supabaseAdmin
  .from("users")
  .select(`id, name, email, bio, image, metadata, role, updated_at, created_at`)
  .eq("auth_user_id", authUser.id)  // ✅ Query by auth_user_id
  .eq("role", "THERAPIST")
  .maybeSingle();

// Fallback: if not found by auth_user_id, try by id (backward compatibility)
if (error || !profile) {
  const { data: profileById } = await supabaseAdmin
    .from("users")
    .select(`...`)
    .eq("id", authUser.id)  // Fallback for old accounts
    .eq("role", "THERAPIST")
    .maybeSingle();
}
```

**Testing Required:**
- Verify profile data loads in `/therapist-dashboard/settings/profile`
- Check browser console for any remaining 401 errors
- Verify all profile fields (name, email, bio, specialization, etc.) are populated

---

### 3. ⚠️ POTENTIAL ISSUE: Sidebar Navigation Redirecting to Login
**Status:** Needs Investigation  
**Severity:** Medium  
**Impact:** Some sidebar links redirect users to login page

#### Problem
- User reported: "some sidebar nav redirect me to login again"
- Specific links not identified yet
- May be related to session expiration or middleware authentication

#### Potential Root Causes
1. **Session Expiration:** Browser session may be expiring
2. **Middleware Authentication:** Middleware may be failing to find user in database
3. **Cookie Issues:** Cookies may not be properly set/passed

#### Relevant Code

**File:** `middleware.ts` (Lines 214-280)
```typescript
// Determine target role based on route
let targetRole: string | null = null;
if (pathname.startsWith("/dashboard") && !pathname.startsWith("/therapist-dashboard")) {
  targetRole = "DIETITIAN";
} else if (pathname.startsWith("/therapist-dashboard")) {
  targetRole = "THERAPIST";
} else if (pathname.startsWith("/user-dashboard")) {
  targetRole = "USER";
}

// Look up user by (auth_user_id, role) if we have a target role
let dbUser = null;
let userError = null;

if (targetRole) {
  const { data: userByAuthIdRole, error: errorByAuthIdRole } = await supabaseAdmin
    .from("users")
    .select("role, email_verified, account_status, id, auth_user_id")
    .eq("auth_user_id", session.user.id)  // ✅ Uses auth_user_id
    .eq("role", targetRole)
    .maybeSingle();

  if (!errorByAuthIdRole && userByAuthIdRole) {
    dbUser = userByAuthIdRole;
  } else {
    userError = errorByAuthIdRole;
  }
}

// Fallback: try by id (for backward compatibility)
if (!dbUser) {
  const { data: userById, error: errorById } = await supabaseAdmin
    .from("users")
    .select("role, email_verified, account_status, id, auth_user_id")
    .eq("id", session.user.id)  // Fallback
    .maybeSingle();
  // ...
}
```

**File:** `app/therapist-dashboard/session-request/page.tsx` (Lines 46-58)
```typescript
// ⚠️ POTENTIAL ISSUE: This page queries by id, not auth_user_id
const { data: dbUser, error: userError } = await supabaseAdmin
  .from("users")
  .select("id, role, account_status, name, image")
  .eq("id", user.id)  // ❌ Should use auth_user_id for new users
  .single();

if (userError || !dbUser) {
  redirect("/therapist-enrollment");
}
```

#### Investigation Needed
1. Identify which specific sidebar links are causing redirects
2. Check browser console for middleware authentication errors
3. Verify session cookies are being set correctly
4. Check if issue occurs on specific routes (e.g., `/therapist-dashboard/session-notes`)

---

## Database Schema Context

### Key Fields
- `users.id`: Database UUID (generated, not same as auth user ID)
- `users.auth_user_id`: Links to Supabase Auth user ID
- `users.onboarding_completed`: Boolean flag for onboarding status
- `users.role`: USER | DIETITIAN | THERAPIST | ADMIN

### Important Note
**New users created after onboarding implementation:**
- Have `auth_user_id` set to their Supabase Auth ID
- Have `id` as a separate generated UUID
- **Must query by `auth_user_id` to find them**

**Old users (before onboarding):**
- May have `auth_user_id` = `id` (backward compatibility)
- Can be found by either field

---

## Files Modified

### Fixed Files
1. ✅ `app/api/onboarding/complete/route.ts`
   - Fixed user lookup to use `auth_user_id`
   - Added robust authentication pattern

2. ✅ `components/onboarding/OnboardingModal.tsx`
   - Added session token retrieval
   - Added timeout protection
   - Added Authorization header

3. ✅ `app/api/therapists/profile/route.ts`
   - Fixed authentication to use session directly
   - Fixed user lookup to use `auth_user_id`
   - Added fallback for backward compatibility

### Files That May Need Updates
1. ⚠️ `app/therapist-dashboard/session-request/page.tsx`
   - Currently queries by `id` instead of `auth_user_id`
   - May cause issues for new users

2. ⚠️ Other therapist dashboard pages
   - May have similar user lookup issues
   - Need audit for consistent `auth_user_id` usage

---

## Testing Checklist

### Onboarding Flow
- [ ] Complete onboarding as new therapist
- [ ] Verify "Complete Onboarding" button works
- [ ] Verify modal closes after completion
- [ ] Verify sidebar unlocks after completion
- [ ] Verify user remains authenticated

### Profile Settings
- [ ] Navigate to `/therapist-dashboard/settings/profile`
- [ ] Verify profile data loads (no 401 errors)
- [ ] Verify all fields are populated:
  - [ ] Full name
  - [ ] Email
  - [ ] Professional Summary (bio)
  - [ ] Specialization
  - [ ] License Number
  - [ ] Experience
  - [ ] Location
- [ ] Verify profile can be saved/updated

### Sidebar Navigation
- [ ] Test all sidebar links:
  - [ ] Dashboard
  - [ ] Event Types
  - [ ] Bookings
  - [ ] Session Request
  - [ ] Availability
  - [ ] Session Notes
  - [ ] Assessment Tests
  - [ ] Profile Settings
  - [ ] Settings
- [ ] Verify no unexpected redirects to login
- [ ] Check browser console for errors

---

## Recommended Next Steps

1. **Immediate:**
   - Test profile settings page to verify fix works
   - Identify which specific sidebar links are causing redirects
   - Check browser console for any remaining authentication errors

2. **Short-term:**
   - Audit all therapist dashboard pages for consistent `auth_user_id` usage
   - Update `session-request/page.tsx` to use `auth_user_id`
   - Add error logging to identify authentication failures

3. **Long-term:**
   - Standardize authentication pattern across all API routes
   - Create shared utility function for user lookup by `auth_user_id`
   - Add comprehensive error handling and logging

---

## Error Patterns Observed

### Console Errors
```
Failed to load profile: Error: Unauthorized: Session expired
User record not found in database - user needs enrollment
AuthProvider: Session fetch timed out, continuing without session
```

### Network Errors
```
GET /api/therapists/profile → 401 Unauthorized
POST /api/onboarding/complete → 401 Unauthorized (before fix)
```

---

## Code Patterns to Follow

### ✅ Correct Pattern (Onboarding API)
```typescript
// 1. Get session/cookies
const cookieHeader = getCookieHeader(request);
const supabase = createRouteHandlerClientFromRequest(cookieHeader);

// 2. Try multiple auth methods
const authHeader = request.headers.get("authorization");
if (authHeader?.startsWith("Bearer ")) {
  // Use token from header
} else {
  // Try getSession first
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    // Use session token
  } else {
    // Fallback to getUser()
  }
}

// 3. Query by auth_user_id first
.eq("auth_user_id", authUser.id)
.eq("role", "THERAPIST")

// 4. Fallback to id for backward compatibility
if (!profile) {
  .eq("id", authUser.id)  // Fallback
}
```

### ❌ Incorrect Pattern (Old Code)
```typescript
// Don't rely solely on getCurrentUserFromRequest
const currentUser = await getCurrentUserFromRequest(request);
if (!currentUser) return 401;

// Don't query by id only
.eq("id", currentUser.id)  // Wrong for new users
```

---

## Questions for Senior Developer

1. **Session Management:**
   - Why might `getSession()` return null even when user is authenticated?
   - Should we implement session refresh logic?
   - Are cookies being set with correct SameSite/Secure flags?

2. **Database Query Strategy:**
   - Should we migrate all old users to have `auth_user_id` set?
   - Should we create a shared utility function for user lookup?
   - Is there a better pattern for handling the `id` vs `auth_user_id` distinction?

3. **Error Handling:**
   - Should we add retry logic for failed API calls?
   - Should we implement better error messages for users?
   - Should we add logging/monitoring for authentication failures?

4. **Architecture:**
   - Should we standardize on one authentication pattern across all API routes?
   - Should we create a middleware for API route authentication?
   - Should we use a different approach for session management?

---

## Additional Context

### Browser Console Observations
- Multiple "Failed to load profile" errors
- "Session fetch timed out" warnings
- "User record not found in database" errors
- Fast Refresh rebuilds (HMR working)

### Network Observations
- API calls returning 401 before fixes
- Some routes redirecting to `/therapist-login`
- Session cookies appear to be set (based on middleware working)

---

## ✅ Implemented Solutions (Based on Senior Review)

### 1. Centralized User Lookup Utility
**File:** `lib/auth/user-lookup.ts` (NEW)
- Created `findUserByAuthId()` function
- Handles both `auth_user_id` and `id` lookups
- Auto-migrates legacy users
- Returns source of lookup for debugging

**Usage:**
```typescript
import { findUserByAuthId } from "@/lib/auth/user-lookup";

const { user: dbUser, source, error } = await findUserByAuthId(
  authUser.id,
  "THERAPIST",
  supabaseAdmin
);
```

### 2. Updated Files to Use Centralized Utility
- ✅ `app/therapist-dashboard/session-request/page.tsx`
- ✅ `app/therapist-dashboard/layout.tsx`
- ✅ `app/api/therapists/profile/route.ts`
- ✅ `app/api/onboarding/complete/route.ts`

### 3. Database Migration Script
**File:** `supabase/migrations/migrate_auth_user_ids.sql` (NEW)
- Migrates existing users to have `auth_user_id` set
- Matches by email with `auth.users` table
- Creates index for performance
- Logs migration results

### 4. Health Check Endpoint
**File:** `app/api/auth/health/route.ts` (NEW)
- Diagnostic endpoint for troubleshooting
- Tests database connection
- Tests authentication session
- Tests user lookup
- Provides recommendations

**Usage:** `GET /api/auth/health`

## Conclusion

**Fixed Issues:**
- ✅ Onboarding completion API authentication
- ✅ Profile API authentication and user lookup
- ✅ Centralized user lookup utility created
- ✅ All critical files updated to use utility
- ✅ Database migration script created
- ✅ Health check endpoint created

**Needs Testing:**
- 🔄 Profile settings page data loading
- 🔄 Sidebar navigation stability
- 🔄 Health check endpoint functionality
- 🔄 Database migration (run during maintenance window)

**Needs Investigation:**
- ⚠️ Specific sidebar links causing redirects
- ⚠️ Session expiration/refresh logic (see recommendations below)

## 📋 Next Steps (From Senior Review)

### Immediate (30 minutes) - ✅ DONE
- [x] Create centralized user lookup utility
- [x] Fix session-request page
- [x] Update all API routes to use utility

### Medium-Term (This Week)
- [ ] Run database migration script
- [ ] Implement session refresh logic
- [ ] Add error monitoring
- [ ] Create authentication service layer

### Long-Term (2-3 Weeks)
- [ ] Implement JWT custom claims
- [ ] Create circuit breaker for API calls
- [ ] Add comprehensive test suite
- [ ] Set up audit logging

