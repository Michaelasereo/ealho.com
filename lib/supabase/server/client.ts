import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Creates a Supabase client for use in server components and server actions.
 * Automatically handles cookies from Next.js cookie store.
 * 
 * This client is compatible with RSC (React Server Component) requests.
 * The middleware allows RSC requests to pass through, and this client
 * properly handles cookies in the server component context.
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * import { createClient } from '@/lib/supabase/server/client'
 * 
 * export default async function MyPage() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 * ```
 * 
 * ```tsx
 * // Server Action
 * 'use server'
 * import { createClient } from '@/lib/supabase/server/client'
 * 
 * export async function myAction() {
 *   const supabase = await createClient()
 *   // ...
 * }
 * ```
 * 
 * @returns {Promise<ReturnType<typeof createServerClient>>} Supabase client instance
 * @throws {Error} If environment variables are missing
 */
export async function createClient() {
  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // Handle cookie setting errors gracefully
          // This can happen in middleware or during RSC requests
          // where cookies might be read-only
          if (error instanceof Error) {
            // Only log in development to avoid noise in production
            if (process.env.NODE_ENV === 'development') {
              console.warn('Supabase: Cookie setting error (this may be expected in some contexts):', error.message)
            }
          }
        }
      },
    },
  })
}

