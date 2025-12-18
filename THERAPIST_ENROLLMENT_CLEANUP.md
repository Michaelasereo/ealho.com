# Therapist Enrollment Cleanup Guide

## Problem
Some users who went through the old therapist enrollment flow got USER accounts created instead of THERAPIST accounts. These users need to be cleaned up.

## Solution

### Step 1: List Users to Clean Up

Use the admin API endpoint to list all users with `signup_source="therapy"` and `role="USER"`:

```bash
# Get admin session first, then:
curl -X GET "https://daiyet.store/api/admin/cleanup-therapy-users" \
  -H "Cookie: your-admin-session-cookie"
```

Or use the browser console on the admin dashboard:
```javascript
fetch('/api/admin/cleanup-therapy-users', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### Step 2: Delete Users

Once you've reviewed the list, delete the users:

```bash
curl -X DELETE "https://daiyet.store/api/admin/cleanup-therapy-users" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session-cookie" \
  -d '{
    "userIds": ["user-id-1", "user-id-2", "user-id-3"],
    "confirm": "DELETE_THERAPY_USERS"
  }'
```

Or via browser console:
```javascript
fetch('/api/admin/cleanup-therapy-users', {
  method: 'DELETE',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['user-id-1', 'user-id-2'],
    confirm: 'DELETE_THERAPY_USERS'
  })
}).then(r => r.json()).then(console.log)
```

**Important:** The `confirm` parameter must be exactly `"DELETE_THERAPY_USERS"` to prevent accidental deletions.

### What Gets Deleted

The cleanup endpoint will:
1. Delete the user from Supabase Auth
2. Delete the user record from the `users` table
3. Log the cleanup action in `auth_audit_log`

## Fixed Enrollment Flow

The therapist enrollment flow has been fixed:

1. **User connects Google** → OAuth callback with `source=therapist-enrollment`
2. **OAuth callback** → Creates user with role "USER", detects `source=therapist-enrollment`
3. **Redirect** → User is redirected back to `/therapist-enrollment` (not user dashboard)
4. **Enrollment form** → User completes the form
5. **Enrollment API** → Sets role to "THERAPIST"
6. **Final redirect** → User is redirected to `/therapist-dashboard`

### Key Fix

In `app/auth/callback/route.ts`, when a user comes from therapist enrollment but doesn't have the THERAPIST role yet, they are now redirected back to `/therapist-enrollment` instead of falling through to the default user redirect logic.

## Testing the Enrollment Flow

1. Go to `/therapist-enrollment`
2. Click "Connect with Google"
3. Complete OAuth flow
4. You should be redirected back to `/therapist-enrollment` (not user dashboard)
5. Fill out the enrollment form
6. Submit the form
7. You should be redirected to `/therapist-dashboard`

## Verification

After cleanup, verify:
- No users with `signup_source="therapy"` and `role="USER"` exist
- New therapist enrollments work correctly
- Users are redirected to the correct dashboard based on their role

