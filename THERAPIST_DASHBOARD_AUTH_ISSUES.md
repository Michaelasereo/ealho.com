# Therapist Dashboard Auth Issues Summary

## Issues Found During Sidebar Navigation Testing

### 1. Event Types Page (`/therapist-dashboard/event-types`)
**Status:** ❌ Auth Error
**Error:** "Authentication required. Please log in to view event types."
**API Route:** `/api/event-types`
**Issue:** The API route uses `requireDietitianFromRequest` which should support THERAPIST, but `getCurrentUserFromRequest` may not be correctly identifying therapist users when called from API routes.

**Console Error:**
```
EventTypesClient: Error fetching event types: Error: Authentication required. Please log in to view event types.
```

### 2. Session Request Page (`/therapist-dashboard/session-request`)
**Status:** ❌ Auth Error (401 Unauthorized)
**API Route:** `/api/session-request`
**Issue:** API returns 401 Unauthorized. The route uses `requireDietitianFromRequest` which should work for therapists, but authentication is failing.

**Network Request:**
- URL: `http://localhost:3000/api/session-request`
- Status: 401
- Method: GET

### 3. Meal Plans/Assessment Tests Page (`/therapist-dashboard/meal-plan`)
**Status:** ❌ Server Error (500)
**API Route:** `/api/meal-plans`
**Issue:** API returns 500 Internal Server Error. The route uses `requireDietitianFromRequest` which should work for therapists, but something is failing.

**Network Request:**
- URL: `http://localhost:3000/api/meal-plans`
- Status: 500
- Method: GET

### 4. Bookings Pages
**Status:** ⚠️ 404 Not Found
**Routes:**
- `/therapist-dashboard/bookings` - 404
- `/therapist-dashboard/bookings/upcoming` - 404
- `/therapist-dashboard/bookings/past` - 404
- `/therapist-dashboard/bookings/canceled` - 404

**Issue:** These routes don't exist or are not properly configured.

### 5. Availability Page (`/therapist-dashboard/availability`)
**Status:** ✅ Working
**Issue:** No auth errors detected.

### 6. Session Notes Page (`/therapist-dashboard/session-notes`)
**Status:** ⚠️ Needs Testing
**Issue:** Page loads but needs to check if data fetching works correctly.

## Root Cause Analysis

The main issue appears to be in `getCurrentUserFromRequest` function in `lib/auth-helpers.ts`. When called from API routes:

1. **Pathname-based role detection fails**: The function checks `pathname.startsWith("/therapist-dashboard")` to determine target role, but API routes have paths like `/api/event-types`, not `/therapist-dashboard/...`.

2. **User lookup may fail**: When the pathname doesn't match `/therapist-dashboard`, the function may not correctly identify that it should look for a THERAPIST role user.

3. **API routes need context**: API routes don't have the dashboard pathname context, so they can't determine which role to look for based on the URL.

## Recommended Fixes

### Fix 1: Update API Routes to Accept Role Parameter
Modify API routes to accept an optional role parameter or check for both DIETITIAN and THERAPIST roles when the pathname doesn't provide context.

### Fix 2: Improve `getCurrentUserFromRequest` for API Routes
When called from API routes, try both DIETITIAN and THERAPIST roles if the pathname doesn't provide clear context.

### Fix 3: Create Therapist-Specific API Routes
Alternatively, create separate API routes for therapists (e.g., `/api/therapist/event-types`) that explicitly handle THERAPIST role.

### Fix 4: Fix Bookings Routes
Create the missing bookings pages for the therapist dashboard.

## Testing Checklist

- [ ] Event Types page loads without auth errors
- [ ] Session Request page loads without auth errors
- [ ] Meal Plans page loads without auth errors
- [ ] Bookings pages exist and work correctly
- [ ] Availability page continues to work
- [ ] Session Notes page loads and fetches data correctly

