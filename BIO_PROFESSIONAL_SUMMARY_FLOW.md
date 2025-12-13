# Professional Summary (Bio) Flow Documentation

This document explains how the professional summary (bio) flows from enrollment → profile settings → booking view.

---

## 1. Enrollment: Saving Bio to Database

**File:** `app/api/dietitians/enroll/route.ts`

When a dietitian enrolls, the bio is saved to the `users` table:

```typescript
// Lines 156-181
const userData: any = {
  name: fullName,
  email: email,
  role: "DIETITIAN",
  bio: bio,  // ← Bio saved here during enrollment
  account_status: "ACTIVE",
  updated_at: new Date().toISOString(),
  metadata: {
    phone,
    dob,
    location,
    licenseNumber,
    experience,
    specialization,
    enrolled_at: new Date().toISOString(),
  },
};

// Update or create user record
if (existingUser) {
  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update(userData)  // ← Bio is saved to users.bio column
    .eq("id", authUser.id)
    .select()
    .single();
} else {
  const { data: newUser, error: createError } = await supabaseAdmin
    .from("users")
    .insert({
      id: authUser.id,
      ...userData,  // ← Bio is inserted into users.bio column
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
}
```

**Result:** Bio is stored in `users.bio` column in the database.

---

## 2. Profile Settings: Loading Bio from Database

**File:** `app/dashboard/settings/profile/page.tsx`

### 2.1 Fetching Bio on Page Load

```typescript
// Lines 24-130
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const supabase = createBrowserClient();
      
      // Get current user (from AuthProvider or direct session)
      let currentUser = user;
      if (!currentUser) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session?.user) {
          currentUser = session.user;
        } else {
          setLoading(false);
          return;
        }
      }

      // Set email immediately from authenticated user
      if (currentUser.email) {
        setEmail(currentUser.email);  // ← Email set here
      }

      // Fetch user data from database (INCLUDING BIO)
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("name, email, image, bio")  // ← Bio is selected here
        .eq("id", currentUser.id)
        .single();

      if (dbUser) {
        const dietitianName = dbUser.name || profile?.name || "Dietitian";
        const dietitianEmail = dbUser.email || currentUser.email || "";
        const dietitianBio = dbUser.bio || "";  // ← Bio retrieved from database
        
        setUserProfile({
          name: dietitianName,
          image: dbUser.image || profile?.image || null,
          bio: dietitianBio,  // ← Bio stored in local state
        });
        setFullName(dietitianName);
        setEmail(dietitianEmail);  // ← Email set from database (should work)
        setAbout(dietitianBio);    // ← Bio populated in textarea
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile();
}, [user, profile]);
```

### 2.2 Displaying Bio in Textarea

```typescript
// Lines 380-385
<Textarea
  value={about}  // ← This is populated from dbUser.bio above
  onChange={(e) => setAbout(e.target.value)}
  className="bg-transparent border-0 text-[#f9fafb] resize-none focus:outline-none focus:ring-0 min-h-[120px]"
  placeholder="Tell us about yourself..."
/>
```

### 2.3 Save Button: Updating Bio in Database

```typescript
// Lines 174-224
const handleSaveBio = async () => {
  console.log("Saving bio - about value:", about);
  setSaving(true);
  setSaveError(null);
  setSaveSuccess(false);

  try {
    const supabase = createBrowserClient();
    
    // Get current user
    let currentUser = user;
    if (!currentUser) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        setSaveError("You must be logged in to save changes");
        setSaving(false);
        return;
      }
      currentUser = session.user;
    }
    
    // Update bio in database
    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update({ 
        bio: about || null,  // ← Bio is updated here
        updated_at: new Date().toISOString()
      })
      .eq("id", currentUser.id)
      .select("bio")
      .single();

    if (updateError) {
      console.error("Error updating bio:", updateError);
      setSaveError(`Failed to save professional summary: ${updateError.message}`);
      setSaving(false);
      return;
    }

    // Update local state
    setUserProfile(prev => prev ? { ...prev, bio: about } : null);
    setSaveSuccess(true);
    setSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  } catch (error: any) {
    console.error("Error saving bio:", error);
    setSaveError(`An unexpected error occurred: ${error?.message || "Unknown error"}`);
    setSaving(false);
  }
};
```

**Save Button UI:**
```typescript
// Lines 390-407
<Button
  onClick={handleSaveBio}
  disabled={saving}
  className="bg-white hover:bg-gray-100 text-black px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {saving ? "Saving..." : "Save Changes"}  // ← Shows "Saving..." during update
</Button>
{saveSuccess && (
  <span className="text-sm text-green-400">
    Professional summary saved successfully!
  </span>
)}
{saveError && (
  <span className="text-sm text-red-400">
    {saveError}
  </span>
)}
```

---

## 3. Booking Page: Displaying Bio in Profile View

**File:** `app/api/dietitians/route.ts`

The API endpoint fetches bio and maps it to `description`:

```typescript
// Lines 19-51
export async function GET(request: NextRequest) {
  const supabaseAdmin = createAdminClientServer();

  // Fetch all active dietitians (including bio)
  const { data: dietitians, error } = await supabaseAdmin
    .from("users")
    .select(`
      id,
      name,
      email,
      bio,        // ← Bio is fetched here
      image,
      role,
      account_status
    `)
    .eq("role", "DIETITIAN")
    .or("account_status.eq.ACTIVE,account_status.is.null")
    .order("name", { ascending: true });

  // Format the response
  const formattedDietitians = (dietitians || []).map((dietitian: any) => ({
    id: dietitian.id,
    name: dietitian.name || "Dietitian",
    email: dietitian.email,
    bio: dietitian.bio || "",
    image: dietitian.image,
    qualification: "Licensed Dietitian",
    description: dietitian.bio || "Professional nutritionist ready to help you achieve your health goals.",  // ← Bio mapped to description
  }));

  return NextResponse.json({ dietitians: formattedDietitians });
}
```

**File:** `app/user-dashboard/book-a-call/page.tsx`

### 3.1 Fetching Dietitians List

```typescript
// Lines 432-454
useEffect(() => {
  const fetchDietitians = async () => {
    try {
      setLoadingDietitians(true);
      const response = await fetch("/api/dietitians", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setDietitians(data.dietitians || []);  // ← Dietitians list with description (from bio)
      }
    } catch (err) {
      console.error("Error fetching dietitians:", err);
    } finally {
      setLoadingDietitians(false);
    }
  };

  fetchDietitians();
}, []);
```

### 3.2 Opening Profile View Modal

```typescript
// Lines 1504-1513
<Button
  variant="outline"
  className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-3 py-1 text-xs flex-shrink-0"
  onClick={(e) => {
    e.stopPropagation();
    setViewingProfile(dietician);  // ← Sets the dietitian object (includes description)
  }}
>
  View Profile
</Button>
```

### 3.3 Displaying Bio in Profile Modal

```typescript
// Lines 1990-1996
{/* Professional Summary */}
<div className="border-t border-[#262626] pt-6">
  <h4 className="text-sm font-medium text-[#D4D4D4] mb-3">Professional Summary</h4>
  <p className="text-sm text-[#9ca3af] leading-relaxed">
    {viewingProfile.description || "No professional summary available."}  // ← Displays description (which is bio from API)
  </p>
</div>
```

---

## 4. Email Not Being Fetched - Issue Analysis

**Problem Location:** `app/dashboard/settings/profile/page.tsx`

### Current Code (Lines 47-50, 78):

```typescript
// Set email immediately from authenticated user
if (currentUser.email) {
  setEmail(currentUser.email);  // ← Sets email from auth user
}

// Later in dbUser block:
const dietitianEmail = dbUser.email || currentUser.email || "";
setEmail(dietitianEmail);  // ← Should override with database email
```

**Potential Issues:**

1. **Email might be empty in database:** If `dbUser.email` is null/empty, it falls back to `currentUser.email`. If auth user email is also empty, email field will be empty.

2. **Email field might be getting overwritten:** There's a second `useEffect` (lines 168-187) that might interfere:
   ```typescript
   useEffect(() => {
     // Set email from user immediately if available and email is empty
     if (user?.email && !email && loading) {
       setEmail(user.email);
     }
   }, [profile, user, fullName, email, userProfile, username, loading]);
   ```
   This only runs if `email` is empty AND `loading` is true, so it shouldn't interfere, but timing might be an issue.

3. **Database email column might be null:** Check if the email was properly saved during enrollment.

### Debugging Steps:

1. **Check console logs:** The code now includes `console.log("Profile loaded - Name:", dietitianName, "Email:", dietitianEmail, "Bio:", dietitianBio);` - check what `dietitianEmail` value is.

2. **Verify database:** Check if `users.email` column has data for the dietitian user.

3. **Check auth user:** Verify `currentUser.email` has a value in the browser console.

---

## 5. Complete Data Flow Diagram

```
ENROLLMENT
  ↓
[User fills bio in enrollment form]
  ↓
POST /api/dietitians/enroll
  ↓
users.bio = bio (saved to database)
  ↓
─────────────────────────────────────
PROFILE SETTINGS
  ↓
GET users WHERE id = current_user_id
  ↓
dbUser.bio → setAbout(dbUser.bio)
  ↓
[User edits bio in textarea]
  ↓
Click "Save Changes"
  ↓
UPDATE users SET bio = about WHERE id = current_user_id
  ↓
users.bio updated in database
  ↓
─────────────────────────────────────
BOOKING PAGE
  ↓
GET /api/dietitians
  ↓
SELECT bio FROM users WHERE role = 'DIETITIAN'
  ↓
Map: description = bio
  ↓
setDietitians([...dietitians with description])
  ↓
User clicks "View Profile"
  ↓
setViewingProfile(dietician)
  ↓
Display: viewingProfile.description (which is bio)
```

---

## 6. Key Files Summary

| File | Purpose | Key Line |
|------|---------|----------|
| `app/api/dietitians/enroll/route.ts` | Saves bio during enrollment | Line 161: `bio: bio` |
| `app/dashboard/settings/profile/page.tsx` | Loads/edits/saves bio | Line 55: Select bio<br>Line 86: Set about<br>Line 198: Update bio |
| `app/api/dietitians/route.ts` | Fetches bio for booking page | Line 50: `description: dietitian.bio` |
| `app/user-dashboard/book-a-call/page.tsx` | Displays bio in profile modal | Line 1994: `viewingProfile.description` |

---

## 7. Common Issues & Solutions

### Issue 1: Bio not loading from enrollment
**Solution:** Check if `dbUser.bio` is being selected and check console logs.

### Issue 2: Save button stuck on "Saving..."
**Possible causes:**
- RLS (Row Level Security) policy blocking UPDATE
- Network error
- Database constraint violation
**Solution:** Check browser console for error messages.

### Issue 3: Email not displaying
**Possible causes:**
- `dbUser.email` is null in database
- `currentUser.email` is null from auth
- State not updating properly
**Solution:** Check console logs for `dietitianEmail` value and verify database.

### Issue 4: Bio not updating in booking view
**Solution:** The API fetches directly from database, so changes should appear immediately. If not, check if API response is cached or refresh the dietitians list.

---

## 8. Testing Checklist

- [ ] Bio saved correctly during enrollment (check database)
- [ ] Bio loads in profile settings textarea on page load
- [ ] Email displays in profile settings
- [ ] Save button updates bio successfully
- [ ] Success message appears after saving
- [ ] Bio displays correctly in booking page profile modal
- [ ] Updated bio appears immediately in booking view (after refresh if needed)
