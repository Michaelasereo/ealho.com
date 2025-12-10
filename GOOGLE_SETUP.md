# Google OAuth and Calendar Setup

## 1. Configure Google OAuth in Supabase

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`
5. Add authorized redirect URLs in Supabase:
   - The Supabase callback URL: `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
   - Your app callback: `http://localhost:3000/auth/callback` (for development)
   - Your app callback: `https://daiyet.store/auth/callback` (for production)

## 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Add authorized redirect URIs (these are the URLs Google will redirect to):
   - **Supabase callback** (for Supabase auth): `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
   - **App callback** (for Google Calendar API): `http://localhost:3000/api/auth/google/callback` (development)
   - **App callback** (for Google Calendar API): `https://daiyet.store/api/auth/google/callback` (production)
6. Enable **Google Calendar API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click **Enable**

## 3. Update Environment Variables

Add these to your `.env` file:

```env
# Google OAuth (for Calendar API)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Paystack (Live Keys)
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=YOUR_PAYSTACK_PUBLIC_KEY

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=https://daiyet.store
```

## 4. Run Database Migration

Run the updated schema to add the `google_oauth_tokens` table and `meeting_link` column:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute the SQL

## 5. How It Works

### Authentication Flow:
1. User clicks "Continue with Google" on login/signup pages
2. Supabase handles OAuth and redirects to `https://jygdjpcmcfglopktusdm.supabase.co/auth/v1/callback`
3. Supabase then redirects to your app's `/auth/callback` route
4. User is authenticated and redirected to their dashboard

### Google Calendar Integration:
1. When a dietitian signs up, they authenticate with Google (handled by Supabase)
2. For Google Calendar API access, dietitians need to authorize additional scopes:
   - Navigate to `/dashboard/settings/calendars` (or call `/api/auth/google/authorize`)
   - This will redirect to Google to request Calendar API permissions
   - After authorization, tokens are stored in the database
3. When a booking is confirmed (payment successful), the system:
   - Retrieves the dietitian's Google OAuth tokens from the database
   - Creates a Google Calendar event with a Google Meet link
   - Updates the booking with the Meet link

### Token Storage:
- Google OAuth tokens are stored in the `google_oauth_tokens` table
- Tokens are automatically refreshed when expired
- Each user (dietitian) has one set of tokens

## 6. Testing

1. Sign up as a dietitian and complete enrollment
2. Make a test booking and payment
3. Check that a Google Meet link is generated and stored in the booking
4. Verify the link works by joining the meeting

## Notes

- The Google Calendar API requires additional OAuth scopes beyond basic authentication
- Dietitians may need to re-authorize if tokens expire or are revoked
- The system falls back to a placeholder Meet link if Google Calendar API fails
