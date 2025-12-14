# Fix: Trailing Space in URL Causing 500 Error

## Error
```
"parse \"https://daiyet.store \": invalid character \" \" in host name"
```

## Root Cause
There's a **trailing space** in the URL `https://daiyet.store ` (notice the space after `.store`). This causes Supabase to fail when parsing the URL.

## Where the Space Could Be

### 1. Supabase Dashboard Site URL
**Most Likely Source**: The Site URL in Supabase dashboard has a trailing space.

**Fix**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Check the **Site URL** field
3. Make sure there's **NO trailing space** after `https://daiyet.store`
4. It should be exactly: `https://daiyet.store` (no space)
5. Click "Save changes"

### 2. Environment Variable
**Check**: Your `.env.local` or production environment variables.

**Fix**:
```bash
# Check for trailing spaces
grep NEXT_PUBLIC_SITE_URL .env.local

# Should be:
NEXT_PUBLIC_SITE_URL=https://daiyet.store

# NOT:
NEXT_PUBLIC_SITE_URL=https://daiyet.store 
```

### 3. Code Fix Applied
I've added `.trim()` to remove any whitespace from URLs in:
- `components/auth/AuthScreen.tsx`
- `app/auth/callback/route.ts`

This will prevent the issue even if there's a space in the environment variable.

## Verification

After fixing:

1. **Check Supabase Dashboard**:
   - Site URL should be: `https://daiyet.store` (no trailing space)
   - Redirect URLs should not have trailing spaces either

2. **Check Environment Variables**:
   ```bash
   # In your terminal, check for spaces:
   echo "$NEXT_PUBLIC_SITE_URL" | cat -A
   # Should show: https://daiyet.store$ (no space before $)
   ```

3. **Test Login**:
   - Try logging in again
   - Should no longer see the "invalid character" error
   - Should successfully redirect to `/auth/callback`

## Quick Fix Checklist

- [ ] Check Supabase Dashboard → Authentication → URL Configuration
- [ ] Remove any trailing spaces from Site URL
- [ ] Check environment variables for trailing spaces
- [ ] Code now trims URLs automatically (already applied)
- [ ] Test login again
