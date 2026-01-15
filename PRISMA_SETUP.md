# Prisma + Supabase Setup Guide

This project now uses Prisma as the ORM with Supabase PostgreSQL as the database.

## Quick Start

### 1. Set up Database Connection String

Add to your `.env.local` file:

```env
# Prisma Database URL (Supabase PostgreSQL connection string)
# Get this from: Supabase Dashboard → Settings → Database → Connection String → Connection Pooling
# Use the "Transaction" mode connection string
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optional: Direct connection for migrations (if connection pooling doesn't work for migrations)
# DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**To get your connection string:**
1. Go to Supabase Dashboard → Settings → Database
2. Under "Connection string" section
3. Select "Connection pooling" → "Transaction" mode
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### 2. Introspect Existing Database

Pull the existing schema from your Supabase database:

```bash
npx prisma db pull
```

This will update `prisma/schema.prisma` with all your existing tables.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. View Database in Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

## Available Scripts

- `npm run db:pull` - Pull schema from database (updates schema.prisma)
- `npm run db:push` - Push schema changes to database (for development)
- `npm run db:migrate` - Create and apply a migration (for production)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Making Schema Changes

### Option 1: Use Prisma Migrate (Recommended for Production)

1. Edit `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npm run db:migrate
   # Enter a migration name when prompted
   ```
3. The migration will be created and applied automatically

### Option 2: Use db push (For Development/Prototyping)

1. Edit `prisma/schema.prisma`
2. Push changes directly:
   ```bash
   npm run db:push
   ```

**Note:** `db push` is faster but doesn't create migration files. Use `db migrate` for production.

## Using Prisma Client in Code

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Fetch users
const users = await prisma.user.findMany()

// Example: Create a booking
const booking = await prisma.booking.create({
  data: {
    title: "Consultation",
    start_time: new Date(),
    // ... other fields
  }
})
```

## Important Notes

1. **Keep Supabase Auth**: Prisma works alongside Supabase Auth. You still use Supabase for authentication.

2. **RLS Policies**: Row-Level Security policies in Supabase still apply. Prisma queries will respect RLS when using the anon key, or bypass RLS when using the service role key.

3. **Migration Strategy**: You can continue using SQL migrations in `supabase/migrations/` OR use Prisma migrations. For new changes, Prisma migrations are recommended.

4. **Connection Pooling**: Supabase provides connection pooling. Use the pooled connection string for better performance in production.

## Next Steps

1. Run `npx prisma db pull` to sync schema from database
2. Run `npx prisma generate` to generate the client
3. Start using Prisma Client in your code instead of direct Supabase queries
