# Supabase Setup Instructions

## 1. Get Your Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 2. Update Your .env File

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 3. Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute the SQL

Alternatively, you can use the Supabase CLI:

```bash
supabase db push
```

## 4. Verify Tables Are Created

After running the schema, check that these tables exist:
- `users`
- `event_types`
- `bookings`
- `payments`

You can verify in the Supabase dashboard under **Table Editor**.

## 5. Test the Connection

Start your development server:

```bash
npm run dev
```

The app should now connect to Supabase instead of Prisma!
