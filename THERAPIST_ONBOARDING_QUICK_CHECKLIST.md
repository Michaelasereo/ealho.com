# Therapist Onboarding - Quick Testing Checklist

Use this checklist while testing the therapist onboarding flow.

## 🚀 Quick Start Test

### **1. New Therapist Flow (5 minutes)**
- [ ] Visit `/therapist-enrollment`
- [ ] Click "Continue with Google"
- [ ] Complete OAuth
- [ ] Fill Step 1 (Personal Info)
- [ ] Click "Next"
- [ ] Fill Step 2 (Professional Info)
- [ ] Click "Next"
- [ ] Check all terms checkboxes
- [ ] Click "Complete Onboarding"
- [ ] Verify redirect to `/therapist-dashboard`
- [ ] Verify dashboard loads correctly

**✅ If all pass → Core flow works!**

---

## 🔄 Resume Flow Test (2 minutes)

- [ ] Start onboarding, fill Step 1
- [ ] Click "Save & Continue Later"
- [ ] Close browser/tab
- [ ] Return to `/therapist-enrollment?connected=true`
- [ ] Verify modal opens with saved data
- [ ] Verify user is on correct step
- [ ] Complete onboarding

**✅ If all pass → Resume flow works!**

---

## 🚨 Error Handling Test (3 minutes)

- [ ] Try to submit with empty required fields → Should show error
- [ ] Enter bio >100 words → Should show error
- [ ] Select 6+ specializations → Should be limited to 5
- [ ] Disconnect network, try to submit → Should show timeout error

**✅ If all pass → Error handling works!**

---

## 🔐 Security Test (2 minutes)

- [ ] Try to access `/api/onboarding/complete` without auth → Should get 401
- [ ] Submit form multiple times rapidly → Should hit rate limit (429)
- [ ] Check browser console for security headers → Should see CSP headers

**✅ If all pass → Security works!**

---

## 📊 Database Verification (1 minute)

Run these SQL queries to verify:

```sql
-- Check user was created
SELECT id, email, role, onboarding_completed 
FROM users 
WHERE email = '<test-email>' AND role = 'THERAPIST';

-- Check onboarding progress
SELECT current_stage, data 
FROM onboarding_progress 
WHERE user_id = '<user-id>';

-- Check audit logs
SELECT event_type, created_at 
FROM audit_logs 
WHERE user_id = '<user-id>' 
ORDER BY created_at DESC 
LIMIT 5;
```

**✅ If all queries return expected data → Database state is correct!**

---

## ⚡ Auto-Save Test (1 minute)

- [ ] Fill Step 1 fields
- [ ] Wait 2 seconds
- [ ] Check for "Saving..." indicator (briefly)
- [ ] Verify database has saved progress

**✅ If all pass → Auto-save works!**

---

## 🎯 Complete Test Summary

**Total Time:** ~15 minutes

**Test Results:**
- [ ] Quick Start Test: ✅ / ❌
- [ ] Resume Flow Test: ✅ / ❌
- [ ] Error Handling Test: ✅ / ❌
- [ ] Security Test: ✅ / ❌
- [ ] Database Verification: ✅ / ❌
- [ ] Auto-Save Test: ✅ / ❌

**Overall Status:** ✅ Ready for Production / ❌ Issues Found

**Issues Found:**
1. 
2. 
3. 

---

## 🐛 Common Issues Quick Fix

| Issue | Quick Check |
|-------|-------------|
| Redirect loop | Check `onboarding_completed` flag in database |
| Progress not loading | Check `/api/onboarding/progress` endpoint |
| Auto-save not working | Check browser console for errors |
| Form validation failing | Check client-side validation rules |
| Image upload failing | Check Supabase Storage permissions |

---

**Need detailed steps?** See `THERAPIST_ONBOARDING_TEST_GUIDE.md`

