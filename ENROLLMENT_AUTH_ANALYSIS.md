# Therapist & Dietitian Enrollment & Authentication Analysis

## Overview

This document explains how therapists and dietitians enroll, how their accounts are separated, how authentication works, and identifies issues with enrollment submission and dashboard fetching.

---

## 1. How Therapists and Dietitians Enroll

### Enrollment Flow

#### Step 1: Initial Authentication (OAuth)
- User visits `/therapist-enrollment` or `/dietitian-enrollment`
- These pages render `AuthScreen` component
- User clicks "Continue with Google"
- OAuth redirects to Google, then back to `/auth/callback?source=therapist-enrollment` or `source=dietitian-enrollment`

#### Step 2: Auth Callback Processing
**File:** `app/auth/callback/route.ts`

The callback handler:
1. Exchanges OAuth code for session
2. Creates/updates user in database with initial role:
   - `therapist-enrollment` → Creates user with `role: "THERAPIST"` (or `"USER"` if not found)
   - `dietitian-enrollment` → Creates user with `role: "DIETITIAN"`
3. Sets `onboarding_completed: false` for enrollment flows
4. Redirects based on role and source:
   - If already enrolled → Dashboard
   - If not enrolled → Back to enrollment page

**Key Code (lines 525-553):**
```typescript
if (cameFromTherapistEnrollment) {
  if (finalRole === "THERAPIST") {
    // Already enrolled, redirect to dashboard
    redirect("/therapist-dashboard");
  } else {
    // Not enrolled yet, redirect back to enrollment form
    redirect("/therapist-enrollment?connected=true");
  }
}
```

#### Step 3: Onboarding Form
**File:** `components/onboarding/OnboardingModal.tsx`

After OAuth, user sees onboarding modal with 3 steps:
1. **Step 1:** Personal info (fullName, age, gender, state)
2. **Step 2:** Professional info (bio, licenseNumber, experience, specialization)
3. **Step 3:** Terms acceptance

**Submission (lines 172-190):**
```typescript
const response = await fetch("/api/onboarding/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    role,
    fullName,
    age: parseInt(age),
    gender,
    state,
    bio,
    licenseNumber,
    qualifications,
    experience,
    specialization,
    termsAccepted,
  }),
});
```

#### Step 4: Onboarding Completion API
**File:** `app/api/onboarding/complete/route.ts`

This endpoint:
1. Validates authentication
2. Finds user by `auth_user_id` and role
3. Updates user record with onboarding data
4. Sets `onboarding_completed: true`
5. Returns success

**Note:** This endpoint does NOT create a new user - it only updates existing users created during OAuth callback.

---

## 2. How Accounts Are Separated

### Database Schema

The `users` table has:
- `id` (UUID) - Primary key, generated UUID (NOT auth user ID)
- `auth_user_id` (UUID) - Links to Supabase Auth user ID
- `email` (string) - User email
- `role` (enum) - "USER", "DIETITIAN", "THERAPIST", "ADMIN"
- **Unique constraint:** `(email, role)` - Same email can have multiple accounts with different roles

### Account Separation Strategy

**Key Design:** One email can have **multiple accounts** with different roles.

Example:
- `user@example.com` can have:
  - `users` record with `role: "DIETITIAN"` and `id: uuid1`
  - `users` record with `role: "THERAPIST"` and `id: uuid2`
  - `users` record with `role: "USER"` and `id: uuid3`

All three accounts share the same `auth_user_id` (same Google account), but are separate records in the database.

### User Lookup Logic

**File:** `lib/auth/user-lookup.ts`

The `findUserByAuthId` function:
1. Tries to find user by `auth_user_id` + `role` filter
2. Falls back to finding by `id` (legacy support)
3. Auto-migrates legacy users to have `auth_user_id` set

**Usage:**
```typescript
const { user, error } = await findUserByAuthId(
  authUser.id,
  "THERAPIST", // Role filter
  supabaseAdmin
);
```

---

## 3. How Authentication Works

### Authentication Flow

1. **OAuth Initiation** (`components/auth/AuthScreen.tsx`)
   - User clicks "Continue with Google"
   - Calls `supabase.auth.signInWithOAuth()`
   - Redirects to Google OAuth

2. **OAuth Callback** (`app/auth/callback/route.ts`)
   - Google redirects back with `code`
   - Exchanges code for session using `supabase.auth.exchangeCodeForSession(code)`
   - Session stored in HttpOnly cookies by Supabase

3. **Session Management**
   - Supabase manages sessions automatically
   - Cookies are HttpOnly (XSS protection)
   - Secure in production (HTTPS only)
   - SameSite: strict (CSRF protection)

4. **Role-Based Access Control**
   - Middleware (`middleware.ts`) checks user role
   - Routes protected by role:
     - `/dashboard` → Only `DIETITIAN`
     - `/therapist-dashboard` → Only `THERAPIST`
     - `/user-dashboard` → Only `USER`
     - `/admin` → Only `ADMIN`

### Authentication in API Routes

**Pattern used in enrollment APIs:**

```typescript
// Get session from cookies or Authorization header
const cookieHeader = getCookieHeader(request);
const supabase = createRouteHandlerClientFromRequest(cookieHeader);

// Try Authorization header first
const authHeader = request.headers.get("authorization");
let authUser = null;

if (authHeader?.startsWith("Bearer ")) {
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  authUser = user;
} else {
  // Fall back to cookies
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    authUser = user;
  } else {
    const { data: { user }, error } = await supabase.auth.getUser();
    authUser = user;
  }
}
```

---

## 4. Issues Identified

### Issue 1: Therapist Enrollment Form Submission

**Problem:** The therapist enrollment page (`app/therapist-enrollment/page.tsx`) only shows `AuthScreen` - there's no actual enrollment form visible.

**Current Flow:**
1. User visits `/therapist-enrollment`
2. Sees `AuthScreen` (Google OAuth button)
3. After OAuth, callback redirects to `/therapist-enrollment?connected=true`
4. But there's no form on that page - user should see onboarding modal

**Root Cause:** The enrollment page doesn't check for `connected=true` query param to show the onboarding form. The onboarding modal only appears when accessing the dashboard.

**Expected Flow:**
- After OAuth, user should be redirected to `/therapist-dashboard` (not back to enrollment page)
- Dashboard layout checks `onboarding_completed` flag
- If `false`, shows `OnboardingModal`

**Current Issue:** If user is redirected back to `/therapist-enrollment?connected=true`, there's no component to show the onboarding form.

### Issue 2: Enrollment API Endpoint Mismatch

**Problem:** There are TWO different enrollment endpoints:

1. **`/api/therapists/enroll`** - Full enrollment endpoint with all fields
   - Expects: fullName, email, phone, dob, location, profilePicture, licenseNumber, experience, specialization, bio
   - Creates/updates user with THERAPIST role
   - Used by: ??? (Not found in codebase)

2. **`/api/onboarding/complete`** - Onboarding completion endpoint
   - Expects: role, fullName, age, gender, state, bio, licenseNumber, qualifications, experience, specialization, termsAccepted
   - Updates existing user (doesn't create)
   - Used by: `OnboardingModal` component

**Issue:** The `OnboardingModal` uses `/api/onboarding/complete`, but this endpoint expects the user to already exist. If the user doesn't exist (e.g., OAuth callback failed to create user), onboarding will fail.

### Issue 3: Auth Callback Role Creation Logic

**File:** `app/auth/callback/route.ts` (lines 309-406)

**Problem:** When user comes from `therapist-enrollment`:
- If `targetRole = "THERAPIST"` and user doesn't exist, it creates user with `role: "THERAPIST"`
- But if user already exists with `role: "USER"`, it doesn't create a new THERAPIST account

**Code (lines 230-242):**
```typescript
if (targetRole && fetchedUserByAuthId.role !== targetRole) {
  // User exists with different role - will create new account below
  console.info("AuthCallbackUserExistsWithDifferentRole", {...});
} else {
  dbUser = fetchedUserByAuthId;
}
```

**Issue:** The code logs that it will create a new account, but then checks `if (!dbUser)` later. If `dbUser` was set above, it won't create a new account.

**Fix Needed:** When user exists with different role and `targetRole` is set, should create new account with `targetRole`.

### Issue 4: Fetching Therapists After Enrollment

**File:** `app/api/therapists/route.ts`

**Current Implementation:**
```typescript
const { data: therapists, error } = await supabaseAdmin
  .from("users")
  .select(`id, name, email, bio, image, role, account_status`)
  .eq("role", "THERAPIST")
  .or("account_status.eq.ACTIVE,account_status.is.null")
  .order("name", { ascending: true });
```

**Potential Issues:**
1. **Missing `onboarding_completed` filter:** Therapists who haven't completed onboarding are still returned
2. **No profile picture handling:** If therapist hasn't uploaded profile picture, `image` is null
3. **Metadata not included:** Specialization, experience, etc. are in `metadata` JSONB column but not selected

**Fix Needed:**
```typescript
.select(`
  id,
  name,
  email,
  bio,
  image,
  role,
  account_status,
  metadata,
  onboarding_completed
`)
.eq("role", "THERAPIST")
.eq("onboarding_completed", true) // Only show completed therapists
.or("account_status.eq.ACTIVE,account_status.is.null")
```

### Issue 5: Dashboard Layout User Lookup

**File:** `app/therapist-dashboard/layout.tsx` (lines 32-36)

**Current Code:**
```typescript
const { user: dbUser, error: userError, source } = await findUserByAuthId(
  user.id,
  "THERAPIST",
  supabaseAdmin
);

if (userError || !dbUser) {
  redirect("/therapist-enrollment");
}
```

**Issue:** If user doesn't have THERAPIST role yet (e.g., just completed OAuth but not onboarding), they get redirected to enrollment page. But enrollment page only shows AuthScreen, not the onboarding form.

**Better Flow:**
- If user exists but `onboarding_completed: false` → Show onboarding modal (current behavior)
- If user doesn't exist with THERAPIST role → Check if they have USER role, if so, redirect to enrollment with message

---

## 5. Recommended Fixes

### Fix 1: Ensure Onboarding Modal Shows After OAuth

**File:** `app/auth/callback/route.ts`

**Change (lines 540-552):**
```typescript
if (cameFromTherapistEnrollment) {
  if (finalRole === "THERAPIST" && dbUser?.onboarding_completed) {
    // Already enrolled and completed onboarding
    redirect("/therapist-dashboard");
  } else {
    // Not enrolled or not completed onboarding - redirect to dashboard to show onboarding modal
    redirect("/therapist-dashboard");
  }
}
```

**Reason:** Dashboard layout will check `onboarding_completed` and show modal if needed.

### Fix 2: Create New Account When Role Mismatch

**File:** `app/auth/callback/route.ts`

**Change (lines 230-242):**
```typescript
if (targetRole && fetchedUserByAuthId.role !== targetRole) {
  // User exists with different role - create new account with targetRole
  console.info("AuthCallbackUserExistsWithDifferentRole", {
    userId: user.id,
    existingRole: fetchedUserByAuthId.role,
    targetRole,
    timestamp: new Date().toISOString(),
  });
  // Don't set dbUser - let it create new account below
  dbUser = null; // Force creation of new account
} else {
  dbUser = fetchedUserByAuthId;
}
```

### Fix 3: Add Onboarding Check to Therapists API

**File:** `app/api/therapists/route.ts`

**Change:**
```typescript
const { data: therapists, error } = await supabaseAdmin
  .from("users")
  .select(`
    id,
    name,
    email,
    bio,
    image,
    role,
    account_status,
    metadata
  `)
  .eq("role", "THERAPIST")
  .eq("onboarding_completed", true) // Only show completed therapists
  .or("account_status.eq.ACTIVE,account_status.is.null")
  .order("name", { ascending: true });
```

### Fix 4: Improve Error Handling in Onboarding API

**File:** `app/api/onboarding/complete/route.ts`

**Change (lines 116-127):**
```typescript
if (findError || !existingUser) {
  // If user doesn't exist, try to create one
  if (!existingUser && role) {
    // Create new user with target role
    const newUserId = randomUUID();
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert({
        id: newUserId,
        auth_user_id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split("@")[0],
        role: role,
        account_status: "ACTIVE",
        onboarding_completed: false,
        // ... other fields
      })
      .select()
      .single();
    
    if (createError || !newUser) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
    
    existingUser = newUser;
  } else {
    return NextResponse.json(
      { error: "User not found. Please ensure you're signed in with the correct account." },
      { status: 404 }
    );
  }
}
```

---

## 6. Testing Checklist

- [ ] Therapist can sign up via `/therapist-enrollment`
- [ ] After OAuth, user is redirected to dashboard (not enrollment page)
- [ ] Onboarding modal appears if `onboarding_completed: false`
- [ ] Onboarding form submission works
- [ ] After onboarding, therapist appears in `/api/therapists` list
- [ ] Therapist dashboard loads correctly after enrollment
- [ ] Same email can have both DIETITIAN and THERAPIST accounts
- [ ] Auth callback creates new account when role mismatch
- [ ] Dashboard layout handles missing user gracefully

---

## Summary

**Key Points:**
1. **Separate Accounts:** Same email can have multiple accounts with different roles (unique constraint on `email + role`)
2. **Enrollment Flow:** OAuth → Callback creates user → Dashboard shows onboarding modal → Onboarding API completes enrollment
3. **Authentication:** Supabase Auth with Google OAuth, sessions in HttpOnly cookies
4. **Issues:** Enrollment form visibility, role mismatch handling, therapist API filtering, onboarding API user creation

**Critical Fixes Needed:**
1. Ensure onboarding modal shows after OAuth (redirect to dashboard, not enrollment page)
2. Create new account when role mismatch in auth callback
3. Filter therapists API to only show completed onboarding
4. Improve onboarding API to handle missing users

