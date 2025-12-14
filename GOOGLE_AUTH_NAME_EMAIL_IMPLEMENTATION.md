# Google Auth Name & Email Implementation (SECURE VERSION)

This document shows how we **securely** fetch and use name and email from Google authentication in Profile Settings and Order Summary pages using **server-side fetching** instead of insecure `sessionStorage` caching.

## 🔒 Security Note

**Previous Implementation (INSECURE - REMOVED):**
- Used `sessionStorage` to cache user profile data
- Vulnerable to XSS attacks - any script on page could access sensitive data
- Data persisted in browser storage accessible to JavaScript

**Current Implementation (SECURE):**
- ✅ Server-side data fetching in Next.js server components
- ✅ Data passed as props to client components
- ✅ No browser storage - data only in React state
- ✅ Protected from XSS attacks
- ✅ Instant display - no flicker (data available on first render)

## Overview

We use a **secure server-side fetching pattern** (similar to dietitian profile preloading) to:
1. **Server-side**: Extract name and email from Google auth session metadata
2. **Server-side**: Fetch from database if needed
3. **Pass as props**: Send data to client component as initial props
4. **Client-side**: Use props directly - no browser storage needed
5. **Result**: Secure, instant display, no XSS vulnerability

---

## 1. Extracting Name & Email from Google Auth Session

### Key Code Pattern

```typescript
// Get session from Supabase
const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  // Extract name from Google auth metadata (priority order)
  const extractedSessionName =
    session.user.user_metadata?.name ||           // Primary: 'name' field
    session.user.user_metadata?.full_name ||      // Fallback: 'full_name' field
    "";

  // Extract email from Google auth
  const extractedSessionEmail = session.user.email || "";
}
```

**Location:** Used in both `app/user-dashboard/profile-settings/page.tsx` and `app/user-dashboard/book-a-call/page.tsx`

---

## 2. Profile Settings Page Implementation

**File:** `app/user-dashboard/profile-settings/page.tsx`

### 2.1 Initialize from Cache (Lines 13-47)

```typescript
const [userProfile, setUserProfile] = useState<{ 
  name: string; 
  email: string; 
  image: string | null;
  // ... other fields
} | null>(() => {
  // Check sessionStorage first for instant display
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('userProfile');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log("ProfileSettings: Loaded profile from sessionStorage", parsed);
        return {
          name: parsed.name || "User",
          email: parsed.email || "",
          image: parsed.image || null,
          // ... other fields
        };
      }
    } catch (error) {
      console.warn("ProfileSettings: Error loading cached profile", error);
      sessionStorage.removeItem('userProfile');
    }
  }
  return null;
});
```

### 2.2 Fetch from Google Auth & API (Lines 50-137)

```typescript
"use client";

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  age?: number | null;
  occupation?: string | null;
  medicalCondition?: string | null;
  monthlyFoodBudget?: number | null;
}

interface ProfileSettingsClientProps {
  initialUserProfile: UserProfile | null;
}

export default function ProfileSettingsClient({ initialUserProfile }: ProfileSettingsClientProps) {
  // Use server-provided data directly - no sessionStorage needed
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [saving, setSaving] = useState(false);

  // Fetch additional profile data (age, occupation, etc.) from API if needed
  useEffect(() => {
    const fetchAdditionalProfileData = async () => {
      if (!initialUserProfile) return;

      try {
        const response = await fetch("/api/user/profile", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          
          // Merge with initial profile data
          setUserProfile({
            ...initialUserProfile,
            age: profile?.age || null,
            occupation: profile?.occupation || null,
            medicalCondition: profile?.medical_condition || null,
            monthlyFoodBudget: profile?.monthly_food_budget || null,
          });
        }
      } catch (err) {
        console.error("Error fetching additional profile data:", err);
      }
    };

    fetchAdditionalProfileData();
  }, [initialUserProfile]);
  
  // ... rest of component
}
```

### 2.3 Display in UI (Lines 282-312)

```typescript
{/* Full Name */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-[#D4D4D4]">
    Full Name
  </label>
  <Input
    type="text"
    value={userProfile?.name || ""}  // Uses cached/preloaded name
    disabled
    className="bg-[#0a0a0a] border-[#262626] text-[#9ca3af] opacity-50 cursor-not-allowed"
  />
  <p className="text-xs text-[#9ca3af]">
    Name is synced from your Google account.
  </p>
</div>

{/* Email */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-[#D4D4D4]">
    Email
  </label>
  <Input
    type="email"
    value={userProfile?.email || ""}  // Uses cached/preloaded email
    disabled
    className="bg-[#0a0a0a] border-[#262626] text-[#9ca3af] opacity-50 cursor-not-allowed"
  />
  <p className="text-xs text-[#9ca3af]">
    Email is synced from your Google account.
  </p>
</div>
```

---

## 3. Order Summary Implementation

**File:** `app/user-dashboard/book-a-call/page.tsx`

### 3.1 Server Component Wrapper (Lines 2321-2370)

```typescript
export default async function BookACallPage() {
  // Server-side: Fetch user profile securely from Supabase session
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  let initialUserProfile: { name: string; email: string; image?: string | null } | null = null;

  if (!sessionError && session?.user) {
    // Extract name and email from Google auth metadata (server-side - secure)
    const extractedSessionName =
      session.user.user_metadata?.name ||
      session.user.user_metadata?.full_name ||
      "";
    const extractedSessionEmail = session.user.email || "";

    // Get Google auth image
    const googleImage =
      session.user.user_metadata?.avatar_url ||
      session.user.user_metadata?.picture ||
      session.user.user_metadata?.image ||
      null;

    // Try to fetch from database for more complete profile
    try {
      const { data: dbUser } = await supabase
        .from("users")
        .select("name, email, image, role")
        .eq("id", session.user.id)
        .single();

      if (dbUser) {
        const profileImage = dbUser.role === "DIETITIAN"
          ? (dbUser.image || googleImage)
          : (googleImage || dbUser.image);

        initialUserProfile = {
          name: dbUser.name || extractedSessionName || "User",
          email: dbUser.email || extractedSessionEmail || "",
          image: profileImage || null,
        };
      } else {
        // Fallback to Google auth data
        initialUserProfile = {
          name: extractedSessionName || "User",
          email: extractedSessionEmail || "",
          image: googleImage,
        };
      }
    } catch (err) {
      console.error("Error fetching user from database:", err);
      // Fallback to Google auth data
      initialUserProfile = {
        name: extractedSessionName || "User",
        email: extractedSessionEmail || "",
        image: googleImage,
      };
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookACallPageContent initialUserProfile={initialUserProfile} />
    </Suspense>
  );
}
```

### 3.2 Client Component Receives Props (Lines 33-70)

```typescript
interface BookACallPageContentProps {
  initialUserProfile: { name: string; email: string; image?: string | null } | null;
}

function BookACallPageContent({ initialUserProfile }: BookACallPageContentProps) {
  // Use server-provided data directly - no sessionStorage needed
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; image?: string | null } | null>(initialUserProfile);
  
  // ... rest of component logic
  
  // Use initialUserProfile immediately if available
  useEffect(() => {
    if (initialUserProfile) {
      console.log('⚡ Using server-provided user profile:', initialUserProfile);
      const finalName = initialUserProfile.name || "";
      const finalEmail = initialUserProfile.email || "";
      setUserName(finalName);
      setUserEmail(finalEmail);
      if (finalEmail) {
        setGuaranteedEmail(finalEmail);
      }
      setFormData((prev) => ({
        ...prev,
        name: finalName,
        email: finalEmail,
      }));
    }
  }, [initialUserProfile]);
  
  // ... fetch additional data from API if needed
}
```

### 3.3 Display in Order Summary (Lines 2062-2072)

```typescript
{/* Order Summary - Step 5 */}
<div className="flex justify-between text-sm">
  <span className="text-[#9ca3af]">Name</span>
  <span className="text-[#f9fafb]">
    {formData.name || userProfile?.name || sessionName || "N/A"}
  </span>
</div>
<div className="flex justify-between text-sm">
  <span className="text-[#9ca3af]">Email</span>
  <span className="text-[#f9fafb]">
    {guaranteedEmail || userProfile?.email || sessionEmail || userEmail || formData.email || "N/A"}
  </span>
</div>
```

---

## 4. Priority Order for Name & Email

### Name Priority:
1. **Database profile** (`profileData.profile?.name`)
2. **Google auth metadata** (`session.user.user_metadata?.name`)
3. **Google auth full_name** (`session.user.user_metadata?.full_name`)
4. **Fallback** (`"User"`)

### Email Priority:
1. **Google auth email** (`session.user.email`) - Most reliable
2. **Database profile** (`profileData.profile?.email`)
3. **Fallback** (`""`)

---

## 5. Secure Data Flow (No Browser Storage)

### Benefits:
- ✅ **Secure**: No XSS vulnerability - data never in browser storage
- ✅ **Instant display**: Name and email available on first render from server props
- ✅ **No flicker**: Data passed as props, no loading state needed
- ✅ **Always fresh**: Server-side fetch ensures latest data
- ✅ **Consistent**: Same secure pattern as dietitian profile preloading

### Secure Flow:
1. **Server Component**: Fetch user data from Supabase session (server-side)
2. **Extract from Google Auth**: Get name/email from `session.user.user_metadata`
3. **Fetch from Database**: Get additional profile data if available
4. **Pass as Props**: Send data to client component as `initialUserProfile` prop
5. **Client Component**: Use props directly - no browser storage needed
6. **Update if needed**: Fetch additional fields from API in background

---

## 6. Key Google Auth Fields Used

```typescript
session.user.email                    // Primary email source
session.user.user_metadata?.name      // Primary name source
session.user.user_metadata?.full_name // Fallback name source
session.user.user_metadata?.avatar_url // Profile image
session.user.user_metadata?.picture   // Profile image (alternative)
```

---

## 7. Summary

**Secure Pattern**: Server Fetch → Pass Props → Use Directly

1. **Server Fetch**: Extract name/email from Google auth session (server-side)
2. **Pass Props**: Send data to client component as `initialUserProfile` prop
3. **Use Directly**: Client component uses props immediately - no storage needed
4. **Update if needed**: Fetch additional fields from API in background

This ensures name and email from Google auth are:
- ✅ **Secure**: No browser storage - protected from XSS attacks
- ✅ **Always available instantly**: Data in props on first render
- ✅ **Never cause UI flicker**: Server-side rendering ensures data ready
- ✅ **Always up-to-date**: Server-side fetch ensures latest data
- ✅ **Consistent**: Same secure pattern across all pages

## 8. Security Comparison

### ❌ Previous (Insecure) Pattern:
```typescript
// Client-side: Store in sessionStorage
sessionStorage.setItem('userProfile', JSON.stringify({ name, email }));
// ❌ Vulnerable to XSS - any script can access this
```

### ✅ Current (Secure) Pattern:
```typescript
// Server-side: Fetch and pass as prop
export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userProfile = { name: session.user.user_metadata?.name, email: session.user.email };
  return <ClientComponent initialUserProfile={userProfile} />;
}
// ✅ Secure - data only in React props, never in browser storage
```

---

## 9. Troubleshooting

### Issue: Name or Email is Empty

**Symptoms:**
- Name shows as "User" or empty
- Email shows as empty string

**Solutions:**

1. **Check Google Auth Metadata:**
   ```typescript
   console.log("Session metadata:", session.user.user_metadata);
   // Should contain: { name: "...", full_name: "...", ... }
   ```

2. **Verify Session:**
   ```typescript
   const { data: { session }, error } = await supabase.auth.getSession();
   if (error || !session) {
     // User not authenticated
   }
   ```

3. **Check Database Fallback:**
   ```typescript
   // Ensure database query succeeds
   const { data: dbUser, error } = await supabase
     .from("users")
     .select("name, email")
     .eq("id", session.user.id)
     .single();
   ```

### Issue: Data Not Available on First Render

**Symptoms:**
- UI shows loading state or empty values initially
- Flicker when data loads

**Solutions:**

1. **Ensure Server Component Fetches Data:**
   ```typescript
   // ✅ Correct: Server component fetches
   export default async function Page() {
     const userProfile = await fetchUserProfile();
     return <ClientComponent initialUserProfile={userProfile} />;
   }
   ```

2. **Don't Fetch in Client Component on Mount:**
   ```typescript
   // ❌ Wrong: Client component fetches on mount
   useEffect(() => {
     fetchUserProfile(); // Causes flicker
   }, []);
   
   // ✅ Correct: Use server-provided props
   const [profile] = useState(initialUserProfile);
   ```

### Issue: TypeScript Errors

**Symptoms:**
- Type errors with `initialUserProfile`
- `null` vs `undefined` type mismatches

**Solutions:**

1. **Define Proper Types:**
   ```typescript
   interface UserProfile {
     name: string;
     email: string;
     image?: string | null;
   }
   
   interface Props {
     initialUserProfile: UserProfile | null;
   }
   ```

2. **Handle Null Cases:**
   ```typescript
   const [profile, setProfile] = useState<UserProfile | null>(
     initialUserProfile || null
   );
   ```

---

## 10. Testing the Implementation

### Manual Testing Checklist

- [ ] **Profile Settings Page:**
  - [ ] Name displays correctly from Google auth
  - [ ] Email displays correctly from Google auth
  - [ ] No flicker on page load
  - [ ] Data persists after page refresh
  - [ ] No `sessionStorage` usage in DevTools

- [ ] **Order Summary Page:**
  - [ ] Name appears in order summary
  - [ ] Email appears in order summary
  - [ ] Data available immediately (no loading state)
  - [ ] Form pre-fills with correct data

- [ ] **Security Verification:**
  - [ ] Open DevTools → Application → Session Storage
  - [ ] Verify no `userProfile` key exists
  - [ ] Check Network tab - data comes from server
  - [ ] Verify no XSS vulnerabilities

### Automated Testing Example

```typescript
// __tests__/profile-settings.test.tsx
import { render, screen } from '@testing-library/react';
import ProfileSettingsClient from '@/app/user-dashboard/profile-settings/ProfileSettingsClient';

describe('ProfileSettingsClient', () => {
  it('displays name and email from props', () => {
    const mockProfile = {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    };

    render(<ProfileSettingsClient initialUserProfile={mockProfile} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('handles null initialUserProfile gracefully', () => {
    render(<ProfileSettingsClient initialUserProfile={null} />);
    // Should not crash, should show empty or default values
  });
});
```

---

## 11. Migration Guide for Other Pages

If you need to implement this secure pattern on other pages, follow these steps:

### Step 1: Convert to Server Component Wrapper

```typescript
// Before: app/some-page/page.tsx (Client Component)
"use client";
export default function SomePage() {
  // ❌ Fetching in client component
  useEffect(() => {
    fetchUserProfile();
  }, []);
  // ...
}

// After: app/some-page/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server/client";
import SomePageClient from "./SomePageClient";

export default async function SomePage() {
  // ✅ Fetching in server component
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const userProfile = session?.user ? {
    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
    email: session.user.email || "",
  } : null;

  return <SomePageClient initialUserProfile={userProfile} />;
}
```

### Step 2: Create Client Component

```typescript
// app/some-page/SomePageClient.tsx
"use client";

interface SomePageClientProps {
  initialUserProfile: { name: string; email: string } | null;
}

export default function SomePageClient({ initialUserProfile }: SomePageClientProps) {
  // ✅ Use server-provided data directly
  const [userProfile] = useState(initialUserProfile);
  
  // No sessionStorage, no client-side fetching on mount
  // ...
}
```

### Step 3: Remove sessionStorage Usage

```typescript
// ❌ Remove this:
if (typeof window !== 'undefined') {
  const cached = sessionStorage.getItem('userProfile');
  // ...
}

// ✅ Replace with:
const [profile] = useState(initialUserProfile);
```

### Step 4: Update Type Definitions

Ensure your types match:

```typescript
interface UserProfile {
  name: string;
  email: string;
  image?: string | null;
}

interface PageProps {
  initialUserProfile: UserProfile | null;
}
```

---

## 12. Best Practices

### ✅ DO:

1. **Always fetch user data server-side:**
   ```typescript
   // ✅ Server component
   export default async function Page() {
     const userProfile = await fetchUserProfile();
     return <ClientComponent initialUserProfile={userProfile} />;
   }
   ```

2. **Use props for initial data:**
   ```typescript
   // ✅ Pass as props
   const [profile] = useState(initialUserProfile);
   ```

3. **Handle null/undefined gracefully:**
   ```typescript
   // ✅ Safe defaults
   const name = userProfile?.name || "User";
   const email = userProfile?.email || "";
   ```

4. **Fetch additional data in background:**
   ```typescript
   // ✅ Background fetch for extra fields
   useEffect(() => {
     if (initialUserProfile) {
       fetchAdditionalData();
     }
   }, [initialUserProfile]);
   ```

### ❌ DON'T:

1. **Don't use browser storage:**
   ```typescript
   // ❌ Never do this
   sessionStorage.setItem('userProfile', JSON.stringify(profile));
   localStorage.setItem('userProfile', JSON.stringify(profile));
   ```

2. **Don't fetch on client mount:**
   ```typescript
   // ❌ Causes flicker
   useEffect(() => {
     fetchUserProfile(); // Don't do this
   }, []);
   ```

3. **Don't access window in server components:**
   ```typescript
   // ❌ Server components can't access window
   if (typeof window !== 'undefined') {
     // This won't work in server components
   }
   ```

4. **Don't skip error handling:**
   ```typescript
   // ❌ Missing error handling
   const { data } = await supabase.from("users").select("*");
   
   // ✅ Proper error handling
   try {
     const { data, error } = await supabase.from("users").select("*");
     if (error) throw error;
   } catch (err) {
     // Handle error
   }
   ```

---

## 13. Common Pitfalls to Avoid

### Pitfall 1: Mixing Server and Client Patterns

```typescript
// ❌ Wrong: Server component but trying to use hooks
export default async function Page() {
  const [profile, setProfile] = useState(null); // ❌ Can't use hooks in server components
  // ...
}

// ✅ Correct: Separate server and client components
export default async function Page() {
  const profile = await fetchProfile();
  return <ClientComponent initialUserProfile={profile} />;
}
```

### Pitfall 2: Not Handling Loading States

```typescript
// ❌ Wrong: No loading state handling
const [profile, setProfile] = useState(initialUserProfile);
// If initialUserProfile is null, UI might break

// ✅ Correct: Handle null case
const [profile, setProfile] = useState<UserProfile | null>(initialUserProfile);
if (!profile) {
  return <LoadingSpinner />;
}
```

### Pitfall 3: Over-fetching in Client Components

```typescript
// ❌ Wrong: Fetching everything in client
useEffect(() => {
  fetchFullProfile(); // Fetches name, email, age, occupation, etc.
}, []);

// ✅ Correct: Server provides name/email, client fetches extras
// Server: Provides name, email (from Google auth)
// Client: Fetches age, occupation, etc. in background
```

### Pitfall 4: Not Using Priority Order

```typescript
// ❌ Wrong: Only checking one source
const name = session.user.user_metadata?.name || "User";

// ✅ Correct: Priority order (Database > Google Auth > Fallback)
const name = dbUser?.name || 
             session.user.user_metadata?.name || 
             session.user.user_metadata?.full_name || 
             "User";
```

---

## 14. Performance Considerations

### Server-Side Rendering Benefits

- ✅ **Faster Initial Load:** Data available on first render
- ✅ **No Client-Side Fetch:** Reduces API calls
- ✅ **Better SEO:** Content available to crawlers
- ✅ **Reduced Bundle Size:** Less client-side code

### Optimization Tips

1. **Cache Database Queries:**
   ```typescript
   // Consider caching if profile doesn't change often
   const { data } = await supabase
     .from("users")
     .select("name, email")
     .eq("id", session.user.id)
     .single();
   ```

2. **Lazy Load Additional Data:**
   ```typescript
   // ✅ Fetch only what's needed initially
   // Fetch additional fields (age, occupation) in background
   useEffect(() => {
     fetchAdditionalProfileData();
   }, []);
   ```

3. **Use Suspense Boundaries:**
   ```typescript
   // ✅ Wrap in Suspense for better loading UX
   <Suspense fallback={<LoadingSpinner />}>
     <ClientComponent initialUserProfile={userProfile} />
   </Suspense>
   ```

---

## 15. Related Documentation

- **Supabase Auth:** [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- **Next.js Server Components:** [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- **Security Best Practices:** See `AUTH_BEST_PRACTICES.md` in this repository

---

## 16. Summary Checklist

When implementing this pattern on a new page, ensure:

- [ ] Server component fetches user data from Supabase session
- [ ] Name extracted from `user_metadata.name` or `user_metadata.full_name`
- [ ] Email extracted from `session.user.email`
- [ ] Database query used as fallback/enhancement
- [ ] Data passed as `initialUserProfile` prop to client component
- [ ] Client component uses props directly (no sessionStorage)
- [ ] Null/undefined cases handled gracefully
- [ ] TypeScript types properly defined
- [ ] No browser storage usage (sessionStorage/localStorage)
- [ ] Error handling implemented
- [ ] Loading states handled appropriately
- [ ] Tested manually and verified security

---

**Last Updated:** This implementation follows Next.js 14+ App Router patterns and Supabase Auth best practices.
