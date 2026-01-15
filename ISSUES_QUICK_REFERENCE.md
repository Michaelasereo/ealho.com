# Issues Quick Reference

## 🔴 Critical Issues

### 1. Profile API Returns 401 (FIXED - Needs Testing)
**File:** `app/api/therapists/profile/route.ts`  
**Fix:** Changed to query by `auth_user_id` instead of `id`, added robust session handling  
**Test:** Navigate to `/therapist-dashboard/settings/profile` and verify data loads

### 2. Onboarding Button Stuck (FIXED - Needs Testing)
**File:** `app/api/onboarding/complete/route.ts`  
**Fix:** Changed user lookup to use `auth_user_id`, added session token in request  
**Test:** Complete onboarding flow and verify button works

## ⚠️ Potential Issues

### 3. Sidebar Navigation Redirects (Needs Investigation)
**Files:** `middleware.ts`, `app/therapist-dashboard/session-request/page.tsx`  
**Issue:** Some links redirect to login - specific links not identified  
**Action:** Test all sidebar links and identify which ones fail

## 📋 Key Code Changes

### Authentication Pattern (Use This)
```typescript
// Get session
const cookieHeader = getCookieHeader(request);
const supabase = createRouteHandlerClientFromRequest(cookieHeader);

// Try getSession first
const { data: { session } } = await supabase.auth.getSession();
if (session?.access_token) {
  const { data: { user } } = await supabase.auth.getUser(session.access_token);
}

// Query by auth_user_id (for new users)
.eq("auth_user_id", authUser.id)
.eq("role", "THERAPIST")
```

### User Lookup Pattern (Use This)
```typescript
// Primary: Query by auth_user_id
.eq("auth_user_id", authUser.id)
.eq("role", "THERAPIST")

// Fallback: Query by id (backward compatibility)
if (!profile) {
  .eq("id", authUser.id)
  .eq("role", "THERAPIST")
}
```

## 🗂️ Files Modified

1. ✅ `app/api/therapists/profile/route.ts` - Fixed auth & user lookup
2. ✅ `app/api/onboarding/complete/route.ts` - Fixed auth & user lookup  
3. ✅ `components/onboarding/OnboardingModal.tsx` - Added session token

## 🧪 Testing Checklist

- [ ] Profile settings loads data
- [ ] Onboarding completes successfully
- [ ] All sidebar links work (no redirects)
- [ ] No 401 errors in console

