# Senior Developer Architecture Review: Authentication & Multi-Tenant System

## Executive Summary

This document provides a comprehensive overview of the authentication and multi-tenant architecture for a dietitian/therapist platform. The system uses **Supabase Auth with Google OAuth** for authentication, with role-based access control (RBAC) and tenant isolation at the database and API level.

**Key Technologies:**
- **Auth Provider**: Supabase Auth (managed service)
- **OAuth Provider**: Google OAuth 2.0 with PKCE
- **Framework**: Next.js 15 (App Router) with React Server Components
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Session Management**: HttpOnly cookies managed by Supabase

---

## 1. Multi-Tenant Authentication Architecture

### 1.1 Auth Provider Implementation

**File**: `lib/auth/config.ts`

```typescript
// Admin email - only this email can access admin dashboard
export const ADMIN_EMAIL = "asereopeyemimichael@gmail.com";

export const authConfig = {
  // Environment-specific settings
  development: {
    cookieOptions: {
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
    },
    sessionRefreshInterval: 60 * 1000, // 1 minute
  },
  production: {
    cookieOptions: {
      secure: true,
      sameSite: 'strict' as const,
      path: '/',
      domain: process.env.COOKIE_DOMAIN,
      httpOnly: true,
    },
    sessionRefreshInterval: 5 * 60 * 1000, // 5 minutes
  },

  // OAuth providers configuration
  providers: {
    google: {
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
      additionalParams: {
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
      },
    },
  },

  // Role-based redirects
  redirects: {
    DIETITIAN: '/dashboard',
    THERAPIST: '/therapist-dashboard',
    USER: '/user-dashboard',
    ADMIN: '/admin',
    default: '/',
  },

  // Session management
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
} as const;
```

**Key Points:**
- Uses Supabase Auth (managed service) - no custom JWT implementation
- Google OAuth with PKCE flow (handled by Supabase)
- HttpOnly cookies for session storage (XSS protection)
- Environment-specific cookie security settings

### 1.2 Tenant Resolution Logic

**File**: `lib/auth/user-lookup.ts`

The system uses a **dual identity mapping** strategy to handle the relationship between Supabase Auth users and application database users:

```typescript
/**
 * Centralized user lookup utility
 * Handles the dual identity mapping between auth system and application database
 * 
 * Strategy:
 * 1. Try auth_user_id first (new users after onboarding)
 * 2. Fallback to id (legacy users)
 * 3. Auto-migrate legacy users to have auth_user_id set
 */
export async function findUserByAuthId(
  authUserId: string,
  role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN" | null | undefined,
  supabaseAdmin: SupabaseClient
): Promise<FindUserResult> {
  // Strategy 1: Try auth_user_id first (new users)
  const { data: userByAuth, error: authError } = await query
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (userByAuth && !authError) {
    return { user: userByAuth, source: "auth_user_id" };
  }

  // Strategy 2: Fallback to id (legacy users)
  const { data: userById, error: idError } = await query
    .eq("id", authUserId)
    .maybeSingle();

  if (userById && !idError) {
    // Auto-migrate: Update legacy user to have auth_user_id
    if (!userById.auth_user_id || userById.auth_user_id === userById.id) {
      await supabaseAdmin
        .from("users")
        .update({ auth_user_id: authUserId })
        .eq("id", authUserId);
      return { user: { ...userById, auth_user_id: authUserId }, source: "id_migrated" };
    }
    return { user: userById, source: "id_legacy" };
  }

  return { user: null, source: null, error: authError || idError };
}
```

**Tenant Identification:**
- **Auth User ID**: Supabase Auth user ID (from `auth.users` table)
- **Application User ID**: Application database user ID (from `users` table)
- **Role-based filtering**: Users can have multiple accounts (one per role: DIETITIAN, THERAPIST, USER)
- **Email + Role uniqueness**: Same email can have multiple accounts with different roles

### 1.3 JWT/Token Handling

**File**: `lib/supabase/server/client.ts` and `lib/supabase/client.ts`

The system uses **Supabase-managed tokens** stored in HttpOnly cookies. No custom JWT handling:

```typescript
// Server-side client (for RSC and API routes)
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

// Browser client (for client components)
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

**Token Flow:**
1. OAuth callback exchanges code for session
2. Supabase stores access/refresh tokens in HttpOnly cookies
3. Tokens automatically refreshed by Supabase client
4. No manual token management required

### 1.4 Role-Based Access Control (RBAC)

**File**: `middleware.ts`

```typescript
// Define role-based route access
const ROLE_ROUTES = {
  DIETITIAN: ["/dashboard", "/dietitian", "/profile"],
  THERAPIST: ["/therapist-dashboard", "/therapist", "/profile"],
  ADMIN: ["/admin", "/analytics", "/users"],
  USER: ["/user-dashboard", "/profile", "/settings"],
} as const;

export async function middleware(request: NextRequest) {
  // ... authentication check ...
  
  // Role-based access control
  const userRole = normalizeRole(dbUser.role);
  
  // Special check for dietitian dashboard: only DIETITIAN role can access
  if (pathname.startsWith("/dashboard") && userRole !== "DIETITIAN") {
    const redirectPath = authConfig.redirects[userRole] || "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  // Special check for therapist dashboard: only THERAPIST role can access
  if (pathname.startsWith("/therapist-dashboard") && userRole !== "THERAPIST") {
    const redirectPath = authConfig.redirects[userRole] || "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  const allowedRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || ROLE_ROUTES.USER;
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));
  
  if (!hasAccess) {
    const redirectPath = authConfig.redirects[userRole] || "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
}
```

**RBAC Features:**
- Route-level protection in middleware
- Role-based redirects
- Account status validation (ACTIVE, SUSPENDED, PENDING)
- Admin email verification for admin routes

---

## 2. Professional Onboarding Flow

### 2.1 Signup Form Components

**File**: `components/auth/AuthScreen.tsx`

```typescript
export function AuthScreen({ title, subtitle, redirectPath = "/user-dashboard", source }: AuthScreenProps) {
  const handleGoogle = async () => {
    const supabase = createComponentClient();
    const currentOrigin = window.location.origin;
    const callbackUrl = source 
      ? `${currentOrigin}/auth/callback?source=${encodeURIComponent(source)}`
      : `${currentOrigin}/auth/callback`;
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: authConfig.providers.google.additionalParams.access_type,
          prompt: authConfig.providers.google.additionalParams.prompt,
        },
        scopes: authConfig.providers.google.scopes.join(" "),
      },
    });
  };
}
```

**Entry Points:**
- `/dietitian-enrollment` → `source=dietitian-enrollment`
- `/therapist-enrollment` → `source=therapist-enrollment`
- `/therapist-signup` → `source=therapist-signup`
- `/dietitian-login` → `source=dietitian-login`
- `/therapist-login` → `source=therapist-login`

### 2.2 Professional Type Differentiation

**File**: `app/auth/callback/route.ts`

```typescript
// Determine target role based on source
let targetRole: string | null = null;
if (cameFromDietitianEnrollment) {
  targetRole = "DIETITIAN";
} else if (cameFromTherapistEnrollment) {
  targetRole = "THERAPIST";
} else if (cameFromTherapistSignup) {
  targetRole = "THERAPIST";
} else if (cameFromDietitianLogin) {
  targetRole = "DIETITIAN";
} else if (cameFromTherapistLogin) {
  targetRole = null; // Will default to USER
}

// If we have a target role, check for existing account with (email, role)
if (targetRole && user.email) {
  const { data: existingUserByEmailRole } = await supabaseAdmin
    .from("users")
    .select("id, role, email, name, image, account_status, email_verified, signup_source, auth_user_id")
    .eq("email", user.email.toLowerCase().trim())
    .eq("role", targetRole)
    .single();

  if (existingUserByEmailRole) {
    dbUser = existingUserByEmailRole;
  }
}

// If user doesn't exist, create new account with target role
if (!dbUser && targetRole) {
  const newUserId = randomUUID();
  const { data: newUser } = await supabaseAdmin
    .from("users")
    .insert({
      id: newUserId,
      auth_user_id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split("@")[0],
      role: targetRole,
      account_status: "ACTIVE",
      onboarding_completed: false, // Key flag for onboarding flow
      // ... other fields
    })
    .select()
    .single();
}
```

**Key Logic:**
- **Source parameter** determines target role
- **Email + Role uniqueness**: Same email can have multiple accounts (one per role)
- **onboarding_completed flag**: Controls whether onboarding modal is shown

### 2.3 Profile Completion Workflow

**File**: `components/onboarding/OnboardingModal.tsx`

```typescript
export function OnboardingModal({ role, isOpen, onComplete }: OnboardingModalProps) {
  // Step 1: Personal info (fullName, age, gender, state, profileImage)
  // Step 2: Professional info (bio, licenseNumber, qualifications, experience, specialization)
  // Step 3: Terms acceptance

  const handleSubmit = async () => {
    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include", // Include cookies for authentication
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
        profileImage,
      }),
    });
  };
}
```

**Onboarding API**: `app/api/onboarding/complete/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const authUser = await getCurrentUserFromRequest(request);
  
  // 2. Find or create user account
  const { user: foundUser } = await findUserByAuthId(
    authUser.id,
    role,
    supabaseAdmin
  );
  
  // 3. Handle profile image upload (if provided)
  if (profileImage) {
    const imageBuffer = Buffer.from(profileImage.split(",")[1], "base64");
    const fileName = `${existingUser.id}/profile.${fileExt}`;
    await supabaseAdmin.storage
      .from("profiles")
      .upload(fileName, imageBuffer, { upsert: true });
  }
  
  // 4. Update user record with onboarding data
  const { data: updatedUser } = await supabaseAdmin
    .from("users")
    .update({
      name: fullName,
      age: parseInt(age),
      gender,
      bio,
      onboarding_completed: true, // Mark onboarding as complete
      account_status: "ACTIVE",
      metadata: {
        location: state,
        licenseNumber,
        experience,
        specialization,
        qualifications,
        onboarding_completed_at: new Date().toISOString(),
      },
      ...(imageUrl ? { image: imageUrl } : {}),
    })
    .eq("id", existingUser.id)
    .select()
    .single();
}
```

### 2.4 Initial Data Seeding

**Onboarding creates:**
- User record in `users` table with role-specific fields
- Profile image in Supabase Storage (`profiles` bucket)
- Metadata JSON with professional details (license, experience, specialization)
- `onboarding_completed: true` flag

**No automatic seeding of:**
- Event types (handled separately)
- Availability slots (user must set manually)
- Session templates (optional)

### 2.5 Email Verification/Welcome Flow

**Current Implementation:**
- Email verification handled by Supabase Auth
- `email_verified` field in `users` table synced from `auth.users.email_confirmed_at`
- No custom welcome email flow (can be added via Supabase triggers)

---

## 3. Dashboard Routing & Data Isolation

### 3.1 Dashboard Routing Structure

**File**: `app/dashboard/layout.tsx` (Dietitian Dashboard)

```typescript
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/dietitian-login");
  }

  // 2. Fetch profile from database using centralized lookup
  const supabaseAdmin = createAdminClientServer();
  const { user: dbUser } = await findUserByAuthId(
    user.id,
    "DIETITIAN", // Role filter
    supabaseAdmin
  );

  if (!dbUser) {
    redirect("/dietitian-enrollment");
  }

  // 3. Enforce role
  if (dbUser.role !== "DIETITIAN") {
    if (dbUser.role === "USER") redirect("/user-dashboard");
    else if (dbUser.role === "ADMIN") redirect("/admin");
    else redirect("/");
  }

  // 4. Check onboarding status
  const onboardingCompleted = dbUser.onboarding_completed === true;

  return (
    <DashboardProfileInitializer initialProfile={initialProfile}>
      <OnboardingWrapper
        onboardingCompleted={onboardingCompleted}
        userRole="DIETITIAN"
      >
        {children}
      </OnboardingWrapper>
    </DashboardProfileInitializer>
  );
}
```

**Similar structure for:**
- `/therapist-dashboard/layout.tsx` (Therapist Dashboard)
- `/user-dashboard/layout.tsx` (User Dashboard)
- `/admin/*` (Admin Dashboard)

### 3.2 Dynamic Route Handling

**Route Structure:**
```
/dashboard/*              → DIETITIAN role required
/therapist-dashboard/*    → THERAPIST role required
/user-dashboard/*         → USER role required
/admin/*                 → ADMIN role + admin email required
```

**Middleware Protection**: `middleware.ts` enforces role-based access before routes are rendered.

### 3.3 Data Fetching Hooks with Tenant Context

**File**: `components/providers/AuthProvider.tsx`

```typescript
export function AuthProvider({ children, initialProfile }: AuthProviderProps) {
  const [supabase] = useState(() => createBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        // Fetch user role and profile
        const { data: userData } = await supabase
          .from("users")
          .select("role, name, image")
          .eq("id", session.user.id)
          .single();

        setRole(normalizeRole(userData?.role));
        setProfile({
          name: userData.name || null,
          image: userData.image || null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
}
```

**Usage in Components:**
```typescript
const { user, role, profile } = useAuth();
// user.id is the auth user ID
// Use role to determine which data to fetch
```

### 3.4 Dashboard Layout Components

**File**: `app/dashboard/layout.tsx` includes:
- `DashboardProfileInitializer`: Server-side profile initialization
- `OnboardingWrapper`: Shows onboarding modal if `onboarding_completed === false`

### 3.5 API Routes with Tenant Filtering Middleware

**File**: `app/api/bookings/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(request);
  
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabaseAdmin.from("bookings").select("*");

  // Tenant isolation: Filter by user role
  if (currentUser.role === "DIETITIAN" || currentUser.role === "THERAPIST") {
    // Dietitians/Therapists see their own bookings
    query = query.eq("dietitian_id", currentUser.id);
  } else {
    // Regular users see bookings they created
    query = query.eq("user_id", currentUser.id);
  }

  const { data: bookings } = await query;
  return NextResponse.json({ bookings });
}
```

**File**: `app/api/session-notes/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(request);
  
  let query = supabaseAdmin.from("session_notes").select("*");

  // Role-based filtering
  if (currentUser.role === "THERAPIST") {
    query = query.eq("therapist_id", currentUser.id);
  } else if (currentUser.role === "USER") {
    query = query.eq("client_id", currentUser.id);
  } else if (currentUser.role === "ADMIN") {
    // Admins see all notes (no filter)
  } else {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { data: notes } = await query;
  return NextResponse.json({ notes });
}
```

**Key Pattern:**
- All API routes use `getCurrentUserFromRequest()` to get authenticated user
- Filter queries by `currentUser.id` and `currentUser.role`
- Role-based access control ensures data isolation

---

## 4. State Management & Session Handling

### 4.1 User Session Management

**File**: `components/providers/AuthProvider.tsx`

```typescript
export function AuthProvider({ children, initialProfile }: AuthProviderProps) {
  const [supabase] = useState(() => createBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize auth
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch role and profile from database
        const { data: userData } = await supabase
          .from("users")
          .select("role, name, image")
          .eq("id", session.user.id)
          .single();
        
        setRole(normalizeRole(userData?.role));
        setProfile({
          name: userData.name || null,
          image: userData.image || null,
        });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        // Update role and profile on auth change
        const { data: userData } = await supabase
          .from("users")
          .select("role, name, image")
          .eq("id", session.user.id)
          .single();
        
        setRole(normalizeRole(userData?.role));
        setProfile({
          name: userData.name || null,
          image: userData.image || null,
        });
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
}
```

**Session Features:**
- **Automatic refresh**: Supabase handles token refresh
- **Multi-tab sync**: Uses localStorage events for profile sync
- **Session persistence**: HttpOnly cookies managed by Supabase
- **Loading states**: Handles loading states for protected routes

### 4.2 Tenant Context/Provider Implementation

**AuthProvider Context:**
```typescript
type AuthContextType = {
  supabase: ReturnType<typeof createBrowserClient> | null;
  user: User | null; // Supabase Auth user
  role: UserRole | null; // Application role (DIETITIAN, THERAPIST, USER, ADMIN)
  profile: UserProfile | null; // Application profile (name, image)
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfileDirect: (profile: UserProfile | null) => void;
};
```

**Usage:**
```typescript
const { user, role, profile, isLoading } = useAuth();
// user.id = Supabase Auth user ID
// role = Application role (for RBAC)
// profile = Application profile data
```

### 4.3 Professional-Specific State Persistence

**Profile Storage:**
- **Server-side**: Database (`users` table)
- **Client-side**: React Context + localStorage (for profile name/image only)
- **Session**: HttpOnly cookies (managed by Supabase)

**State Flow:**
1. Server-side layout fetches profile → passes to `AuthProvider` as `initialProfile`
2. `AuthProvider` initializes context with `initialProfile`
3. Client-side updates sync to database via API calls
4. `onAuthStateChange` listener updates context on auth events

### 4.4 Cache Invalidation Strategies

**Current Implementation:**
- **No explicit cache invalidation** - relies on:
  - React Context updates on auth state changes
  - Server-side data fetching on each request (RSC)
  - Supabase real-time subscriptions (where used)

**Recommended Improvements:**
- Add cache tags for Next.js data caching
- Implement SWR/React Query for client-side data fetching
- Use Supabase real-time for live updates

---

## Architecture Diagrams

### Authentication Flow

```
User clicks "Continue with Google"
  ↓
AuthScreen.tsx → supabase.auth.signInWithOAuth()
  ↓
Google OAuth consent screen
  ↓
Redirect to /auth/callback?code=xxx&source=dietitian-enrollment
  ↓
app/auth/callback/route.ts:
  1. Exchange code for session
  2. Find or create user in database
  3. Set role based on source parameter
  4. Set onboarding_completed: false
  5. Redirect to dashboard
  ↓
Dashboard layout checks onboarding_completed
  ↓
If false → Show OnboardingModal
  ↓
User completes onboarding → POST /api/onboarding/complete
  ↓
Set onboarding_completed: true
  ↓
Dashboard accessible
```

### Multi-Tenant Data Isolation

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Auth                         │
│  (auth.users table - managed by Supabase)               │
│  - id (UUID)                                            │
│  - email                                                 │
│  - user_metadata                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ auth_user_id (foreign key)
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Application Database                        │
│  (users table - application managed)                    │
│  - id (UUID) - Application user ID                      │
│  - auth_user_id (UUID) - Links to auth.users.id          │
│  - email                                                 │
│  - role (DIETITIAN | THERAPIST | USER | ADMIN)          │
│  - onboarding_completed (boolean)                       │
│  - account_status (ACTIVE | SUSPENDED | PENDING)        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ id (foreign key)
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Tenant-Specific Data                        │
│  - bookings (dietitian_id or user_id)                   │
│  - session_notes (therapist_id or client_id)            │
│  - event_types (dietitian_id)                           │
│  - availability (dietitian_id)                           │
└─────────────────────────────────────────────────────────┘
```

### Role-Based Access Control

```
Request → Middleware
  ↓
Check authentication (Supabase session)
  ↓
Fetch user from database (by auth_user_id + role)
  ↓
Check account_status (ACTIVE, SUSPENDED, etc.)
  ↓
Check role matches route requirements
  ↓
  ├─ DIETITIAN → /dashboard/*
  ├─ THERAPIST → /therapist-dashboard/*
  ├─ USER → /user-dashboard/*
  └─ ADMIN → /admin/* (also checks email)
  ↓
Allow or redirect
```

---

## Key Architectural Decisions

### ✅ Strengths

1. **Managed Authentication**: Using Supabase Auth eliminates custom JWT handling complexity
2. **Dual Identity Mapping**: Handles legacy users and new users gracefully
3. **Role-Based Isolation**: Clear separation between DIETITIAN, THERAPIST, USER, ADMIN
4. **Multi-Account Support**: Same email can have multiple accounts (one per role)
5. **Server-Side Rendering**: Dashboard layouts fetch data server-side for better security
6. **Centralized User Lookup**: `findUserByAuthId()` utility handles all user resolution

### ⚠️ Areas for Improvement

1. **Cache Invalidation**: No explicit cache invalidation strategy
2. **Real-Time Updates**: Limited use of Supabase real-time subscriptions
3. **Error Handling**: Could benefit from more structured error handling
4. **Rate Limiting**: Only implemented on auth callback, not on all API routes
5. **Audit Logging**: Limited audit logging for sensitive operations
6. **Session Refresh**: Manual refresh logic could be improved

---

## Database Schema (Key Tables)

### `users` Table
```sql
- id (UUID, primary key) - Application user ID
- auth_user_id (UUID) - Links to auth.users.id
- email (text, unique per role)
- role (enum: USER, DIETITIAN, THERAPIST, ADMIN)
- name (text)
- image (text, URL)
- bio (text)
- onboarding_completed (boolean)
- account_status (enum: ACTIVE, SUSPENDED, PENDING_VERIFICATION, etc.)
- email_verified (boolean)
- metadata (jsonb) - Professional details (license, experience, specialization)
- created_at (timestamp)
- updated_at (timestamp)
- last_sign_in_at (timestamp)
```

### Key Relationships
- `bookings.dietitian_id` → `users.id` (where role = DIETITIAN or THERAPIST)
- `bookings.user_id` → `users.id` (where role = USER)
- `session_notes.therapist_id` → `users.id` (where role = THERAPIST)
- `session_notes.client_id` → `users.id` (where role = USER)

---

## Security Considerations

1. **HttpOnly Cookies**: Session tokens stored in HttpOnly cookies (XSS protection)
2. **PKCE Flow**: OAuth uses PKCE for additional security
3. **Row Level Security (RLS)**: Supabase RLS policies enforce data access
4. **Role-Based Filtering**: All API routes filter by user role and ID
5. **Admin Email Verification**: Admin routes check both role and email
6. **Account Status Checks**: Middleware validates account status before access

---

## Testing Recommendations

1. **Multi-Account Scenarios**: Test same email with multiple roles
2. **Onboarding Flow**: Test incomplete onboarding states
3. **Role Switching**: Test user accessing wrong role dashboard
4. **Session Expiry**: Test token refresh and expiry handling
5. **Data Isolation**: Verify users can't access other users' data
6. **Edge Cases**: Test legacy users (id = auth_user_id)

---

## Conclusion

The architecture uses a **managed authentication service (Supabase Auth)** with **role-based access control** and **tenant isolation at the API level**. The system supports multiple accounts per email (one per role) and handles legacy users gracefully through a dual identity mapping strategy.

**Key Files to Review:**
- `middleware.ts` - Route protection and RBAC
- `app/auth/callback/route.ts` - OAuth callback and user creation
- `lib/auth/user-lookup.ts` - Tenant resolution logic
- `components/providers/AuthProvider.tsx` - Session management
- `app/api/*/route.ts` - API routes with tenant filtering

