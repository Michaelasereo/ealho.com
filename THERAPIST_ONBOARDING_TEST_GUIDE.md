# Therapist Onboarding Flow - Comprehensive Testing Guide

## Overview
This guide covers all test scenarios for the therapist onboarding flow, including happy paths, edge cases, and error scenarios.

---

## 🎯 Test Flow 1: New Therapist - Complete Onboarding

### **Step 1: Initial Visit to Enrollment Page**
**URL:** `/therapist-enrollment`

**Expected Behavior:**
- ✅ Page shows `AuthScreen` component with "Continue with Google" button
- ✅ No enrollment form visible yet
- ✅ User is NOT authenticated

**What to Check:**
- [ ] Page loads without errors
- [ ] OAuth button is visible and clickable
- [ ] No console errors
- [ ] Network tab shows no failed requests

---

### **Step 2: OAuth Authentication**
**Action:** Click "Continue with Google"

**Expected Behavior:**
- ✅ Redirects to Google OAuth consent screen
- ✅ After consent, redirects to `/auth/callback?source=therapist-enrollment`
- ✅ Auth callback processes the OAuth code

**What to Check:**
- [ ] Google OAuth consent screen appears
- [ ] After consent, redirect happens correctly
- [ ] URL contains `source=therapist-enrollment` parameter
- [ ] No authentication errors in console

---

### **Step 3: Auth Callback Processing**
**URL:** `/auth/callback?source=therapist-enrollment`

**Expected Behavior:**
- ✅ Callback handler exchanges OAuth code for session
- ✅ Creates user record in database with:
  - `role: "THERAPIST"`
  - `onboarding_completed: false`
  - `account_status: "ACTIVE"`
- ✅ Redirects to `/therapist-enrollment?connected=true`

**What to Check:**
- [ ] User record created in `users` table
- [ ] `auth_user_id` matches Supabase Auth UUID
- [ ] `onboarding_completed` is `false`
- [ ] Redirect URL includes `connected=true`
- [ ] Audit log entry created for `AUTH_USER_CREATED`
- [ ] Event published: `AUTH_USER_CREATED`

**Database Verification:**
```sql
-- Check user was created correctly
SELECT id, email, role, onboarding_completed, account_status, auth_user_id
FROM users
WHERE email = '<test-email>'
AND role = 'THERAPIST';
```

---

### **Step 4: Enrollment Form Display**
**URL:** `/therapist-enrollment?connected=true`

**Expected Behavior:**
- ✅ Page detects user is authenticated
- ✅ Shows `TherapistEnrollmentForm` component
- ✅ `OnboardingModal` opens automatically
- ✅ Modal shows Step 1 (Personal Info)
- ✅ Progress bar shows "Step 1 of 3"

**What to Check:**
- [ ] No redirect to signup page
- [ ] Onboarding modal is visible
- [ ] Step 1 form fields are present:
  - Full Name
  - Age
  - Gender dropdown
  - State dropdown
  - Profile Image upload
- [ ] "Next" button is disabled until required fields are filled
- [ ] "Back" button is NOT visible (on first step)
- [ ] "Save & Continue Later" button is visible

---

### **Step 5: Fill Step 1 - Personal Information**
**Action:** Fill in Step 1 form fields

**Expected Behavior:**
- ✅ Form fields accept input
- ✅ Validation works:
  - Full Name: required, non-empty
  - Age: required, numeric
  - Gender: required, must select from dropdown
  - State: required, must select from dropdown
- ✅ Auto-save triggers after 2 seconds of inactivity
- ✅ Progress saved to `onboarding_progress` table

**What to Check:**
- [ ] All fields accept input
- [ ] "Next" button enables when all fields are filled
- [ ] Auto-save indicator shows "Saving..." briefly
- [ ] Network tab shows POST to `/api/onboarding/progress`
- [ ] Database has entry in `onboarding_progress` table:
  ```sql
  SELECT current_stage, data
  FROM onboarding_progress
  WHERE user_id = '<user-id>';
  ```
- [ ] `current_stage` should be `"PERSONAL_INFO"`
- [ ] `data` JSON contains form field values

**Test Cases:**
- [ ] Valid input: All fields filled correctly
- [ ] Invalid age: Non-numeric value (should show error)
- [ ] Empty required field: Try to proceed without full name (Next button disabled)
- [ ] Auto-save: Fill fields, wait 2 seconds, check database

---

### **Step 6: Navigate to Step 2**
**Action:** Click "Next" button

**Expected Behavior:**
- ✅ Progress saved before navigation
- ✅ Modal transitions to Step 2 (Professional Info)
- ✅ Progress bar shows "Step 2 of 3"
- ✅ Form fields from Step 1 are preserved
- ✅ Step 2 fields are empty (or loaded from saved progress if resuming)

**What to Check:**
- [ ] Smooth transition to Step 2
- [ ] "Back" button is now visible
- [ ] Step 2 form fields are present:
  - Bio (text area, max 100 words)
  - License Number
  - Qualifications (multi-select)
  - Experience (dropdown)
  - Specialization (multi-select, max 5)
- [ ] "Next" button is disabled until Step 2 is valid
- [ ] "Save & Continue Later" button still visible

**Step 2 Validation Rules:**
- Bio: required, max 100 words
- License Number: required
- Experience: required
- Specialization: required, 1-5 selections

---

### **Step 7: Fill Step 2 - Professional Information**
**Action:** Fill in Step 2 form fields

**Expected Behavior:**
- ✅ Form fields accept input
- ✅ Specialization shows therapist-specific options:
  - Anxiety Disorders
  - Depression
  - Trauma & PTSD
  - Relationship Issues
  - Stress Management
  - etc.
- ✅ Bio word count is tracked (max 100 words)
- ✅ Specialization limit enforced (max 5)
- ✅ Auto-save triggers after 2 seconds

**What to Check:**
- [ ] Bio accepts text input
- [ ] Word count indicator shows (e.g., "45/100 words")
- [ ] License Number accepts input
- [ ] Qualifications multi-select works
- [ ] Experience dropdown shows options
- [ ] Specialization multi-select works
- [ ] Cannot select more than 5 specializations
- [ ] Auto-save saves progress
- [ ] Database `onboarding_progress.data` contains Step 2 fields

**Test Cases:**
- [ ] Valid input: All fields filled correctly
- [ ] Bio too long: Enter >100 words (should show error)
- [ ] Too many specializations: Try to select 6+ (should be limited to 5)
- [ ] Empty required field: Try to proceed without license number (Next button disabled)

---

### **Step 8: Navigate to Step 3**
**Action:** Click "Next" button

**Expected Behavior:**
- ✅ Progress saved before navigation
- ✅ Modal transitions to Step 3 (Terms & Conditions)
- ✅ Progress bar shows "Step 3 of 3"
- ✅ Form fields from Steps 1 & 2 are preserved

**What to Check:**
- [ ] Smooth transition to Step 3
- [ ] Step 3 shows:
  - Terms of Service checkbox
  - Privacy Policy checkbox
  - "I accept" checkbox
- [ ] All checkboxes are unchecked initially
- [ ] "Complete Onboarding" button is disabled
- [ ] "Back" button is visible
- [ ] "Save & Continue Later" button is NOT visible (on final step)

---

### **Step 9: Accept Terms and Complete**
**Action:** Check all three checkboxes, click "Complete Onboarding"

**Expected Behavior:**
- ✅ All checkboxes must be checked before submission
- ✅ Form submits to `/api/onboarding/complete`
- ✅ Button shows "Submitting..." during submission
- ✅ API processes the request:
  - Updates user record with all onboarding data
  - Uploads profile image (if provided)
  - Sets `onboarding_completed: true`
  - Marks onboarding as completed in state machine
  - Creates audit log entry
  - Publishes `ONBOARDING_COMPLETED` event

**What to Check:**
- [ ] All checkboxes can be checked
- [ ] "Complete Onboarding" button enables when all checked
- [ ] Submission shows loading state
- [ ] Network tab shows POST to `/api/onboarding/complete`
- [ ] Response status is 200
- [ ] Response includes `success: true` and `imageUrl` (if image uploaded)
- [ ] Database updates:
  ```sql
  -- Check user record
  SELECT name, age, gender, bio, onboarding_completed, account_status, image
  FROM users
  WHERE id = '<user-id>';
  ```
- [ ] `onboarding_completed` is `true`
- [ ] All form data is saved in `metadata` JSON
- [ ] Profile image URL is saved (if uploaded)
- [ ] Audit log entry created:
  ```sql
  SELECT event_type, user_id, metadata
  FROM audit_logs
  WHERE user_id = '<user-id>'
  AND event_type = 'ONBOARDING_COMPLETED'
  ORDER BY created_at DESC
  LIMIT 1;
  ```
- [ ] Event published in `events` table:
  ```sql
  SELECT type, user_id, payload
  FROM events
  WHERE user_id = '<user-id>'
  AND type = 'ONBOARDING_COMPLETED'
  ORDER BY created_at DESC
  LIMIT 1;
  ```

---

### **Step 10: Redirect to Dashboard**
**Expected Behavior:**
- ✅ After successful submission, redirects to `/therapist-dashboard`
- ✅ Dashboard loads successfully
- ✅ User sees therapist dashboard (not enrollment form)
- ✅ Onboarding modal does NOT appear

**What to Check:**
- [ ] Redirect happens automatically
- [ ] Dashboard page loads without errors
- [ ] User is authenticated
- [ ] User role is `THERAPIST`
- [ ] `onboarding_completed` is `true`
- [ ] No redirect loops
- [ ] Dashboard shows therapist-specific content

---

## 🔄 Test Flow 2: Resume Onboarding (Save & Continue Later)

### **Scenario:** User starts onboarding, saves progress, and returns later

**Step 1: Start Onboarding**
- Visit `/therapist-enrollment`
- Complete OAuth
- Fill Step 1 fields
- Click "Save & Continue Later"

**Expected Behavior:**
- ✅ Alert shows "Progress saved! You can continue later."
- ✅ User can close the browser/tab
- ✅ Progress is saved in database

**What to Check:**
- [ ] Alert message appears
- [ ] Database has saved progress:
  ```sql
  SELECT current_stage, data
  FROM onboarding_progress
  WHERE user_id = '<user-id>';
  ```

---

**Step 2: Return Later**
- Close browser
- Return to `/therapist-enrollment?connected=true` (or just `/therapist-enrollment` if authenticated)

**Expected Behavior:**
- ✅ User is still authenticated (session persists)
- ✅ Onboarding modal opens automatically
- ✅ Modal loads saved progress
- ✅ Form fields are pre-filled with saved data
- ✅ User is on the correct step (where they left off)

**What to Check:**
- [ ] Modal opens automatically
- [ ] Step 1 fields are pre-filled with saved values
- [ ] User is on Step 1 (or correct step based on `current_stage`)
- [ ] No data loss
- [ ] User can continue from where they left off

**Test Cases:**
- [ ] Resume from Step 1: Fill Step 1, save, return → Step 1 pre-filled
- [ ] Resume from Step 2: Complete Step 1, fill Step 2, save, return → Both steps pre-filled, on Step 2
- [ ] Resume from Step 3: Complete Steps 1 & 2, fill Step 3, save, return → All steps pre-filled, on Step 3

---

## 🚨 Test Flow 3: Error Scenarios

### **Error 1: Network Failure During Submission**

**Scenario:** User completes form, clicks "Complete Onboarding", but network fails

**Expected Behavior:**
- ✅ Error message displays: "Request timed out. Please check your network and try again."
- ✅ User can retry submission
- ✅ Form data is preserved (not lost)
- ✅ User can go back and edit fields

**What to Check:**
- [ ] Error message is user-friendly
- [ ] Form data is still present
- [ ] User can retry without losing data
- [ ] Timeout is set to 30 seconds

---

### **Error 2: Invalid Form Data**

**Test Cases:**
- [ ] **Bio too long:** Enter >100 words → Error: "Bio must be 100 words or less"
- [ ] **Too many specializations:** Select 6+ → Limited to 5, error shown
- [ ] **Missing required field:** Try to submit without license number → Error: "Missing required fields"
- [ ] **Invalid age:** Enter non-numeric → Validation error

**Expected Behavior:**
- ✅ Validation errors are clear and specific
- ✅ User can fix errors and retry
- ✅ Form doesn't submit with invalid data

---

### **Error 3: Authentication Expired**

**Scenario:** User's session expires during onboarding

**Expected Behavior:**
- ✅ If session expires during form fill: On submission, user gets 401 error
- ✅ Error message: "Unauthorized: Please sign in first"
- ✅ User is redirected to sign in again
- ✅ After re-authentication, can resume onboarding (progress saved)

**What to Check:**
- [ ] 401 error is handled gracefully
- [ ] Error message is clear
- [ ] User can re-authenticate
- [ ] Progress is preserved after re-authentication

---

### **Error 4: Profile Image Upload Failure**

**Scenario:** User uploads profile image, but upload fails

**Expected Behavior:**
- ✅ Onboarding continues without image
- ✅ Warning logged to console (not shown to user)
- ✅ User record is updated successfully
- ✅ Other form data is saved correctly

**What to Check:**
- [ ] No blocking error for user
- [ ] Onboarding completes successfully
- [ ] User record is updated
- [ ] Image field is null/empty (not blocking)

---

## 🔐 Test Flow 4: Security & Authorization

### **Security Test 1: CSRF Protection**

**Action:** Try to submit onboarding without CSRF token

**Expected Behavior:**
- ✅ Request is rejected with 403 error
- ✅ Error message: "CSRF validation failed"
- ✅ Audit log entry created for `SECURITY_CSRF_VALIDATION_FAILED`

**What to Check:**
- [ ] CSRF token is required
- [ ] Invalid token is rejected
- [ ] Audit log entry created

---

### **Security Test 2: Unauthorized Access**

**Scenario:** Try to access `/api/onboarding/complete` without authentication

**Expected Behavior:**
- ✅ Request is rejected with 401 error
- ✅ Error message: "Unauthorized: Please sign in first"

**What to Check:**
- [ ] Unauthenticated requests are blocked
- [ ] Error message is clear

---

### **Security Test 3: Rate Limiting**

**Action:** Submit onboarding form multiple times rapidly

**Expected Behavior:**
- ✅ Rate limiting applies (100 requests per minute for authenticated users)
- ✅ Excessive requests are blocked with 429 error
- ✅ Rate limit headers are included in response

**What to Check:**
- [ ] Rate limiting works
- [ ] Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [ ] Audit log entry created for rate limit exceeded

---

## 🔄 Test Flow 5: Already Completed Onboarding

### **Scenario:** User who already completed onboarding visits enrollment page

**Step 1: Visit `/therapist-enrollment`**

**Expected Behavior:**
- ✅ If authenticated and `onboarding_completed: true` → Redirects to `/therapist-dashboard`
- ✅ No enrollment form shown
- ✅ No onboarding modal appears

**What to Check:**
- [ ] Redirect happens immediately
- [ ] No enrollment form is shown
- [ ] Dashboard loads correctly

---

### **Step 2: Visit `/therapist-enrollment?connected=true`**

**Expected Behavior:**
- ✅ Same as above: Redirects to dashboard
- ✅ No enrollment form shown

**What to Check:**
- [ ] Redirect happens
- [ ] No form shown

---

## 🧪 Test Flow 6: Auto-Save Functionality

### **Test Auto-Save on Each Step**

**Step 1 Auto-Save:**
- Fill Step 1 fields
- Wait 2 seconds
- Check database: Progress should be saved

**Step 2 Auto-Save:**
- Navigate to Step 2
- Fill Step 2 fields
- Wait 2 seconds
- Check database: Progress should include Step 2 data

**Step 3 Auto-Save:**
- Navigate to Step 3
- Check terms checkboxes
- Wait 2 seconds
- Check database: Progress should include Step 3 data

**What to Check:**
- [ ] Auto-save triggers after 2 seconds of inactivity
- [ ] "Saving..." indicator appears briefly
- [ ] Database is updated correctly
- [ ] No errors in console
- [ ] Auto-save doesn't interfere with form submission

---

## 📊 Test Flow 7: Database & State Verification

### **Verify Database State After Each Step**

**After Step 1:**
```sql
-- Check onboarding_progress
SELECT current_stage, data
FROM onboarding_progress
WHERE user_id = '<user-id>';

-- Should show:
-- current_stage: 'PERSONAL_INFO'
-- data: { fullName, age, gender, state, profileImage }
```

**After Step 2:**
```sql
-- Check onboarding_progress
SELECT current_stage, data
FROM onboarding_progress
WHERE user_id = '<user-id>';

-- Should show:
-- current_stage: 'PROFESSIONAL_INFO'
-- data: { ...step1 fields..., bio, licenseNumber, qualifications, experience, specialization }
```

**After Step 3 (Completion):**
```sql
-- Check users table
SELECT name, age, gender, bio, onboarding_completed, account_status, image, metadata
FROM users
WHERE id = '<user-id>';

-- Should show:
-- onboarding_completed: true
-- All form data in metadata JSON
-- Profile image URL in image column

-- Check onboarding_progress
SELECT current_stage
FROM onboarding_progress
WHERE user_id = '<user-id>';

-- Should show:
-- current_stage: 'COMPLETED'
```

---

## 🎯 Test Flow 8: Integration Points

### **Verify Integration with Other Systems**

**1. Audit Logging:**
- [ ] `AUTH_USER_CREATED` event logged during OAuth callback
- [ ] `ONBOARDING_COMPLETED` event logged after completion
- [ ] Audit logs include user_id, IP address, user agent, metadata

**2. Event Bus:**
- [ ] `AUTH_USER_CREATED` event published during OAuth callback
- [ ] `ONBOARDING_COMPLETED` event published after completion
- [ ] Events are stored in `events` table

**3. Unified User System:**
- [ ] User ID matches Supabase Auth UUID
- [ ] `auth_user_id` is set correctly
- [ ] User lookup works with `UnifiedUserSystem.getUser()`

**4. Middleware:**
- [ ] Middleware allows access to `/therapist-enrollment`
- [ ] Middleware redirects authenticated users from home to dashboard
- [ ] Security headers are applied
- [ ] Rate limiting works

**5. Dashboard Access:**
- [ ] After onboarding, user can access `/therapist-dashboard`
- [ ] Dashboard layout doesn't redirect back to enrollment
- [ ] Dashboard shows therapist-specific content

---

## 📝 Test Checklist Summary

### **Happy Path:**
- [ ] New therapist can complete full onboarding flow
- [ ] All form fields work correctly
- [ ] Progress is saved correctly
- [ ] User is redirected to dashboard after completion
- [ ] Database state is correct at each step

### **Resume Flow:**
- [ ] User can save progress and resume later
- [ ] Saved progress is loaded correctly
- [ ] User resumes on correct step

### **Error Handling:**
- [ ] Network errors are handled gracefully
- [ ] Validation errors are clear
- [ ] Authentication errors are handled
- [ ] Image upload failures don't block onboarding

### **Security:**
- [ ] CSRF protection works
- [ ] Unauthorized access is blocked
- [ ] Rate limiting works
- [ ] Security headers are applied

### **Integration:**
- [ ] Audit logging works
- [ ] Event bus publishes events
- [ ] Unified user system works
- [ ] Middleware works correctly
- [ ] Dashboard access works after onboarding

---

## 🐛 Common Issues to Watch For

1. **Redirect Loops:**
   - User gets stuck in redirect loop between enrollment and dashboard
   - **Fix:** Check `onboarding_completed` flag and redirect logic

2. **Progress Not Loading:**
   - Saved progress doesn't load when user returns
   - **Fix:** Check `onboarding_progress` table and API endpoint

3. **Auto-Save Not Working:**
   - Progress isn't saved automatically
   - **Fix:** Check debounce timing and API endpoint

4. **Form Validation Issues:**
   - Invalid data is accepted
   - **Fix:** Check client-side and server-side validation

5. **Image Upload Issues:**
   - Profile image doesn't upload
   - **Fix:** Check Supabase Storage configuration and permissions

---

## 🔍 Debugging Tips

### **Check Browser Console:**
- Look for JavaScript errors
- Check network tab for failed requests
- Verify API responses

### **Check Server Logs:**
- Look for errors in Next.js server logs
- Check Supabase logs for database errors
- Verify audit log entries

### **Check Database:**
```sql
-- Check user record
SELECT * FROM users WHERE email = '<test-email>';

-- Check onboarding progress
SELECT * FROM onboarding_progress WHERE user_id = '<user-id>';

-- Check audit logs
SELECT * FROM audit_logs WHERE user_id = '<user-id>' ORDER BY created_at DESC;

-- Check events
SELECT * FROM events WHERE user_id = '<user-id>' ORDER BY created_at DESC;
```

### **Check Network Tab:**
- Verify API requests are made
- Check request/response payloads
- Verify status codes (200, 401, 403, 429, 500)

---

## ✅ Success Criteria

The therapist onboarding flow is working correctly if:

1. ✅ New therapists can complete onboarding end-to-end
2. ✅ Progress is saved and can be resumed
3. ✅ All validation works correctly
4. ✅ Errors are handled gracefully
5. ✅ Security measures are in place
6. ✅ Database state is correct at each step
7. ✅ Integration points work correctly
8. ✅ User is redirected to dashboard after completion
9. ✅ No redirect loops or stuck states
10. ✅ Audit logging and events are working

---

## 📞 Next Steps After Testing

If all tests pass:
1. ✅ Mark onboarding flow as production-ready
2. ✅ Document any edge cases found
3. ✅ Update user documentation if needed

If issues are found:
1. 🐛 Document the issue with steps to reproduce
2. 🔧 Fix the issue
3. ✅ Re-test the specific scenario
4. ✅ Update this guide with the fix

---

**Last Updated:** [Current Date]
**Tested By:** [Your Name]
**Status:** [In Progress / Complete]

