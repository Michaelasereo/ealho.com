# Multi-Tenant Architecture Documentation

## Overview

This application implements a multi-tenant SaaS architecture with role-based access control (RBAC). The system supports four user roles: `USER`, `DIETITIAN`, `THERAPIST`, and `ADMIN`. Each user can have multiple accounts (one per role) associated with the same email address.

## Core Principles

1. **Single Source of Truth**: `auth.users.id` is the primary identifier
2. **Role-Based Separation**: Each role has its own dashboard and data access patterns
3. **Data Isolation**: All queries are scoped by user role and relationships
4. **Unified User System**: Consistent user lookup and management across the application

## Authentication Architecture

### User System

The application uses a unified user system (`UnifiedUserSystem`) that:
- Links Supabase Auth users (`auth.users.id`) to application users (`users.id`)
- Supports multiple accounts per email (one per role)
- Uses `auth_user_id` to link auth accounts to application users
- Enforces role-based access at the database level

### Authentication Flow

#### Server Components (Layouts)
All dashboard layouts use server-side authentication:

1. **Get authenticated user** from Supabase Auth
2. **Lookup user in database** using `UnifiedUserSystem.getUser(authUserId, role, supabaseAdmin)`
3. **Enforce role** - redirect if role doesn't match
4. **Check onboarding status** (for therapist/dietitian dashboards)

**Files:**
- `app/user-dashboard/layout.tsx` - Enforces USER role
- `app/therapist-dashboard/layout.tsx` - Enforces THERAPIST role
- `app/dashboard/layout.tsx` - Enforces DIETITIAN role

#### API Routes
API routes use request-based authentication:

1. **Get current user** using `getCurrentUserFromRequest(request)`
   - Detects role from pathname or referer header
   - Tries both DIETITIAN and THERAPIST for ambiguous contexts
   - Uses `UnifiedUserSystem` for consistent lookups
2. **Enforce role** using helper functions:
   - `requireAuthFromRequest()` - Requires any authenticated user
   - `requireDietitianFromRequest()` - Requires DIETITIAN or THERAPIST role
   - `requireAdminFromRequest()` - Requires ADMIN role

**Key File:** `lib/auth-helpers.ts`

### Role Detection for API Routes

The `getCurrentUserFromRequest()` function determines user role through:

1. **Pathname analysis** (for non-API routes):
   - `/therapist-dashboard/*` → THERAPIST
   - `/dashboard/*` (not therapist) → DIETITIAN
   - `/user-dashboard/*` → USER

2. **Referer header** (for API routes):
   - Checks `referer` header to determine dashboard context
   - Falls back to pathname hints (e.g., `/api/therapist-*`)

3. **Fallback logic**:
   - For API routes, tries both DIETITIAN and THERAPIST if context is ambiguous
   - Prioritizes based on referer header when available

## Data Scoping

### Principles

All data queries must be scoped to ensure:
- **Users** only see their own data (bookings they created, session requests they made)
- **Providers** (DIETITIAN/THERAPIST) only see data for their clients
- **Admins** can see all data (if needed)

### Data Relationships

#### Bookings
- **Users** see bookings where `user_id = current_user.id`
- **Providers** see bookings where `dietitian_id = current_user.id`
- Note: `dietitian_id` field is used for both dietitians and therapists

#### Session Requests
- **Users** see session requests where `user_id = current_user.id`
- **Providers** see session requests where `dietitian_id = current_user.id`

#### Meal Plans
- **Users** see meal plans where `user_id = current_user.id`
- **Providers** see meal plans where `dietitian_id = current_user.id`

#### Event Types
- **Providers** see event types where `user_id = current_user.id`
- **Users** can view any provider's event types (public access with `dietitianId` param)

### Implementation

All API routes implement data scoping:

**Example from `app/api/bookings/route.ts`:**
```typescript
if (currentUser.role === "DIETITIAN" || currentUser.role === "THERAPIST") {
  query = query.eq("dietitian_id", currentUser.id);
} else {
  query = query.eq("user_id", currentUser.id);
}
```

**Example from `app/api/session-request/route.ts`:**
```typescript
const dietitian = await requireDietitianFromRequest(request);
const dietitianId = dietitian.id;
// ...
query = query.eq("dietitian_id", dietitianId);
```

## Dashboard Structure

### User Dashboard (`/user-dashboard`)
- **Role**: USER
- **Access**: All users with USER role
- **Data**: User's own bookings, session requests, meal plans
- **No role separation**: All USER accounts use the same dashboard regardless of `signup_source`

### Therapist Dashboard (`/therapist-dashboard`)
- **Role**: THERAPIST
- **Access**: Users with THERAPIST role
- **Data**: Therapist's bookings, session requests, meal plans, event types, availability
- **Features**: Onboarding flow, client management

### Dietitian Dashboard (`/dashboard`)
- **Role**: DIETITIAN
- **Access**: Users with DIETITIAN role
- **Data**: Dietitian's bookings, session requests, meal plans, event types, availability
- **Features**: Onboarding flow, client management

## Enrollment Flows

### Therapist Enrollment

1. **User visits** `/therapist-enrollment`
2. **OAuth Authentication** via Google
3. **Auth Callback** (`/auth/callback?source=therapist-enrollment`):
   - Creates user with `role: "THERAPIST"`, `onboarding_completed: false`
   - Redirects to `/therapist-dashboard`
4. **Dashboard Layout** checks onboarding status
5. **Onboarding Modal** shown if `onboarding_completed === false`
6. **Onboarding Form** (3 steps) submitted to `/api/onboarding/complete`
7. **Onboarding Complete** sets `onboarding_completed: true`
8. **Full Dashboard Access** granted

**Files:**
- `app/therapist-enrollment/page.tsx`
- `app/therapist-enrollment/TherapistEnrollmentForm.tsx`
- `app/therapist-dashboard/layout.tsx` (onboarding check)
- `app/api/onboarding/complete/route.ts`

### Dietitian Enrollment

Similar flow to therapist enrollment:
1. User visits `/dietitian-enrollment`
2. OAuth Authentication
3. Auth Callback creates user with `role: "DIETITIAN"`
4. Onboarding flow completes
5. Full dashboard access

## API Route Patterns

### Authentication Pattern

```typescript
// For routes that require DIETITIAN or THERAPIST
export async function GET(request: NextRequest) {
  try {
    const provider = await requireDietitianFromRequest(request);
    const providerId = provider.id;
    
    // Query scoped to provider
    const query = supabaseAdmin
      .from("table_name")
      .eq("dietitian_id", providerId);
    
    // ...
  } catch (error: any) {
    // Handle auth errors
  }
}
```

### Public Access Pattern

```typescript
// For routes that support public access with optional auth
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");
  
  if (providerId) {
    // Public access - verify provider exists
    // ...
  } else {
    // Private access - require auth
    const provider = await requireDietitianFromRequest(request);
    // ...
  }
}
```

## Data Model Notes

### Field Naming

- **`dietitian_id`**: Used for both dietitians and therapists (legacy naming)
  - Consider renaming to `provider_id` in future migration
  - All queries use this field for provider relationships

### User Accounts

- **Multiple accounts per email**: Supported via `(email, role)` unique constraint
- **`auth_user_id`**: Links Supabase Auth account to application user
- **`id`**: Application user ID (may be same as `auth_user_id` for first account)

## Best Practices

### ✅ Do

1. **Use `UnifiedUserSystem.getUser()`** for all user lookups in layouts
2. **Use `getCurrentUserFromRequest()`** for API route authentication
3. **Always scope queries** by `user_id` or `dietitian_id` based on role
4. **Check role before data access** - don't assume role from context
5. **Use `requireDietitianFromRequest()`** for routes that support both DIETITIAN and THERAPIST

### ❌ Don't

1. **Don't use direct database queries** in layouts - use `UnifiedUserSystem`
2. **Don't assume role from pathname alone** - check referer for API routes
3. **Don't skip data scoping** - always filter by user/provider ID
4. **Don't use `signup_source` for routing** - use it for analytics only
5. **Don't create separate dashboards** for same role - use single dashboard with smart filtering

## Security Considerations

1. **Row Level Security (RLS)**: Consider implementing Supabase RLS policies for additional security
2. **API Route Validation**: Always validate user role and data ownership
3. **Session Management**: Sessions are managed by Supabase Auth
4. **Error Messages**: Don't leak sensitive information in error messages

## Troubleshooting

### Common Issues

1. **403 Forbidden on API routes**:
   - Check that `getCurrentUserFromRequest()` correctly detects role
   - Verify referer header is being sent from client
   - Check that user has correct role in database

2. **User not found errors**:
   - Verify `auth_user_id` is set correctly
   - Check that user exists with correct role
   - Use `UnifiedUserSystem.getUser()` for consistent lookups

3. **Data not showing**:
   - Verify data scoping is correct (check `user_id` or `dietitian_id` filters)
   - Check that user has correct role
   - Verify relationships are correct in database

## Future Improvements

1. **Rename `dietitian_id` to `provider_id`**: More accurate naming for both roles
2. **Implement RLS policies**: Additional security layer at database level
3. **Add role-based middleware**: Centralized role checking
4. **Improve error handling**: More specific error messages for debugging
5. **Add audit logging**: Track data access for security monitoring

