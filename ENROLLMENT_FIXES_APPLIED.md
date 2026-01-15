# Enrollment & Authentication Fixes Applied

## Summary

Fixed critical issues with therapist and dietitian enrollment, authentication, and dashboard access.

---

## Fixes Applied

### Fix 1: Auth Callback - Role Mismatch Handling ✅

**File:** `app/auth/callback/route.ts`

**Issue:** When a user with an existing account (e.g., USER role) tried to enroll as a therapist, the system would find the existing user but not create a new THERAPIST account.

**Fix:** Explicitly set `dbUser = null` when role mismatch is detected, forcing creation of a new account with the target role.

**Code Change:**
```typescript
if (targetRole && fetchedUserByAuthId.role !== targetRole) {
  // Don't set dbUser so it creates a new account with targetRole
  dbUser = null; // Force creation of new account
}
```

**Result:** Users can now have multiple accounts (e.g., both DIETITIAN and THERAPIST) with the same email.

---

### Fix 2: Therapist Enrollment Redirect ✅

**File:** `app/auth/callback/route.ts`

**Issue:** After OAuth, users were redirected back to `/therapist-enrollment?connected=true`, but that page only shows the AuthScreen component (no enrollment form).

**Fix:** Always redirect to `/therapist-dashboard` after therapist enrollment OAuth. The dashboard layout checks `onboarding_completed` and shows the onboarding modal if needed.

**Code Change:**
```typescript
if (cameFromTherapistEnrollment) {
  if (finalRole === "THERAPIST" && dbUser?.onboarding_completed) {
    // Already completed - go to dashboard
    redirect("/therapist-dashboard");
  } else {
    // Not completed - go to dashboard (will show onboarding modal)
    redirect("/therapist-dashboard");
  }
}
```

**Result:** Users are properly redirected to dashboard where onboarding modal appears.

---

### Fix 3: Therapists API - Filter by Onboarding Status ✅

**File:** `app/api/therapists/route.ts`

**Issue:** The API returned all therapists, including those who hadn't completed onboarding. This could show incomplete profiles to users.

**Fix:** Added filter to only return therapists with `onboarding_completed: true`. Also added `metadata` to the select query to include specialization, experience, etc.

**Code Changes:**
1. Added `onboarding_completed` filter:
```typescript
.eq("onboarding_completed", true) // Only show therapists who completed onboarding
```

2. Added `metadata` to select:
```typescript
.select(`
  id,
  name,
  email,
  bio,
  image,
  role,
  account_status,
  metadata  // Added to include specialization, experience, etc.
`)
```

3. Enhanced response formatting to include metadata fields:
```typescript
const formattedTherapists = (therapists || []).map((therapist: any) => {
  const metadata = therapist.metadata || {};
  return {
    // ... existing fields
    specialization: metadata.specialization || [],
    experience: metadata.experience || "",
    licenseNumber: metadata.licenseNumber || "",
  };
});
```

**Result:** Only fully enrolled therapists appear in the therapists list, with complete profile information.

---

### Fix 4: Onboarding API - Handle Missing Users ✅

**File:** `app/api/onboarding/complete/route.ts`

**Issue:** If the OAuth callback failed to create a user record, the onboarding API would return 404 "User not found", leaving users stuck.

**Fix:** Added fallback logic to create the user account if it doesn't exist during onboarding submission.

**Code Change:**
```typescript
if (findError || !existingUser) {
  // If user doesn't exist but we have a role, try to create the user account
  if (!existingUser && role) {
    const newUserId = randomUUID();
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert({
        id: newUserId,
        auth_user_id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || ...,
        role: role,
        account_status: "ACTIVE",
        onboarding_completed: false,
        // ... other fields
      })
      .select()
      .single();
    
    if (createError || !newUser) {
      return NextResponse.json(
        { error: "Failed to create user account. Please try signing in again." },
        { status: 500 }
      );
    }
    
    existingUser = newUser;
  }
}
```

**Result:** Onboarding can now complete even if OAuth callback didn't create the user record (edge case recovery).

---

## How It Works Now

### Complete Enrollment Flow

1. **User visits `/therapist-enrollment`**
   - Sees AuthScreen with "Continue with Google" button

2. **OAuth Authentication**
   - User authenticates with Google
   - Redirected to `/auth/callback?source=therapist-enrollment`

3. **Auth Callback Processing**
   - Exchanges OAuth code for session
   - Checks if user exists with THERAPIST role
   - If not, creates new user with `role: "THERAPIST"`, `onboarding_completed: false`
   - If user exists with different role, creates new THERAPIST account
   - Redirects to `/therapist-dashboard`

4. **Dashboard Layout**
   - Checks if user has THERAPIST role
   - Checks `onboarding_completed` flag
   - If `false`, shows `OnboardingModal`

5. **Onboarding Form**
   - User completes 3-step onboarding form
   - Submits to `/api/onboarding/complete`
   - API updates user with enrollment data
   - Sets `onboarding_completed: true`

6. **Dashboard Access**
   - User can now access full dashboard
   - Therapist appears in `/api/therapists` list

---

## Account Separation

### How Multiple Accounts Work

**Database Design:**
- Unique constraint on `(email, role)` allows same email to have multiple accounts
- Each account has its own `id` (UUID)
- All accounts share the same `auth_user_id` (same Google account)

**Example:**
```
Email: user@example.com
Auth User ID: auth-123

Account 1:
  id: uuid-1
  email: user@example.com
  role: DIETITIAN
  auth_user_id: auth-123

Account 2:
  id: uuid-2
  email: user@example.com
  role: THERAPIST
  auth_user_id: auth-123
```

**User Lookup:**
- `findUserByAuthId(authUserId, "THERAPIST")` finds the THERAPIST account
- `findUserByAuthId(authUserId, "DIETITIAN")` finds the DIETITIAN account
- Both accounts are separate but linked to the same Google account

---

## Testing Checklist

After these fixes, verify:

- [ ] User can enroll as therapist via `/therapist-enrollment`
- [ ] After OAuth, user is redirected to `/therapist-dashboard` (not enrollment page)
- [ ] Onboarding modal appears if `onboarding_completed: false`
- [ ] Onboarding form submission works correctly
- [ ] After onboarding, therapist appears in `/api/therapists` list
- [ ] Therapist dashboard loads correctly after enrollment
- [ ] Same email can have both DIETITIAN and THERAPIST accounts
- [ ] Auth callback creates new account when role mismatch
- [ ] Dashboard layout handles missing user gracefully
- [ ] Only completed therapists appear in therapists list

---

## Files Modified

1. `app/auth/callback/route.ts` - Fixed role mismatch handling and redirect logic
2. `app/api/therapists/route.ts` - Added onboarding filter and metadata
3. `app/api/onboarding/complete/route.ts` - Added user creation fallback

---

## Related Documentation

- See `ENROLLMENT_AUTH_ANALYSIS.md` for detailed architecture explanation
- See `AUTHENTICATION_CONCEPT_REVIEW.md` for authentication flow details

