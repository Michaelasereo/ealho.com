import { createClient } from "@/lib/supabase/server/client";
import { createAdminClientServer } from "./supabase/server";
import type { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "DIETITIAN" | "ADMIN" | "THERAPIST";
  is_admin: boolean;
  bio: string | null;
  image: string | null;
  account_status?: string;
  email_verified?: boolean;
  signup_source?: string | null;
}

// DEV MODE: Real database IDs for localhost testing
const DEV_DIETITIAN_ID = 'b900e502-71a6-45da-bde6-7b596cc14d88'; // Real dietitian ID from DB
const DEV_USER_ID = 'f8b5c6d7-8e9f-4a0b-1c2d-3e4f5a6b7c8d'; // Placeholder - will use real user if exists
const DEV_THERAPIST_ID = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'; // Placeholder therapist ID for dev mode

/**
 * DEVELOPMENT MODE: Bypass auth for localhost testing
 * Returns hardcoded users based on URL path or query param
 * - /therapist-dashboard/* -> Therapist
 * - /dashboard/* -> Dietitian (michaelasereoo@gmail.com)
 * - /user-dashboard/* -> User (michaelasereo@gmail.com)
 * - ?as=therapist, ?as=dietitian, or ?as=user -> Override based on param
 */
function getDevUser(request: Request | NextRequest): User | null {
  // Only enable in development/localhost
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  try {
    // Handle both Request and NextRequest objects
    let url: URL;
    if (request instanceof Request) {
      url = new URL(request.url);
      } else {
        // NextRequest has nextUrl property
        const nextUrl = (request as any).nextUrl;
        if (nextUrl) {
          url = nextUrl;
        } else {
          url = new URL((request as any).url || 'http://localhost:3000');
        }
      }

    const pathname = url.pathname;

    // Check for ?as= query param first (override)
    const asParam = url.searchParams?.get('as');

    // Check referer header for API routes to determine context
    let referer = '';
    try {
      referer = (request as any).headers?.get?.('referer') || '';
    } catch (e) {
      // Ignore header access errors
    }

    let userType = 'user'; // default

    if (asParam) {
      userType = asParam.toLowerCase();
    } else if (pathname?.startsWith('/therapist-dashboard')) {
      userType = 'therapist';
    } else if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
      userType = 'dietitian';
    } else if (pathname?.startsWith('/user-dashboard')) {
      userType = 'user';
    } else if (pathname?.startsWith('/api/')) {
      // For API routes, check referer to determine context
      // Also check for dietitian/therapist-specific API endpoints
      if (referer.includes('/therapist-dashboard') ||
          (referer.includes('/therapy') && pathname.includes('event-types'))) {
        userType = 'therapist';
      } else if (referer.includes('/dashboard') ||
          pathname.includes('event-types') ||
          pathname.includes('dietitian') ||
          pathname.includes('availability')) {
        userType = 'dietitian';
      }
    }

    if (userType === 'therapist') {
      // Return hardcoded therapist user
      return {
        id: DEV_THERAPIST_ID,
        email: 'therapist@example.com',
        name: 'Therapist (Dev)',
        role: 'THERAPIST',
        is_admin: false,
        bio: null,
        image: null,
        account_status: 'ACTIVE',
        email_verified: true,
      } as User;
    } else if (userType === 'dietitian' || userType === 'diet') {
      // Return hardcoded dietitian user with REAL database ID
      return {
        id: DEV_DIETITIAN_ID,
        email: 'michaelasereoo@gmail.com',
        name: 'Michael (Dietitian)',
        role: 'DIETITIAN',
        is_admin: false,
        bio: null,
        image: null,
        account_status: 'ACTIVE',
        email_verified: true,
      } as User;
    } else {
      // Return hardcoded regular user
      return {
        id: DEV_USER_ID,
        email: 'michaelasereo@gmail.com',
        name: 'Michael (User)',
        role: 'USER',
        is_admin: false,
        bio: null,
        image: null,
        account_status: 'ACTIVE',
        email_verified: true,
      } as User;
    }
  } catch (error) {
    // If URL parsing fails, default to user
    console.warn('[DEV MODE] Error parsing URL for dev user, defaulting to user:', error);
    return {
      id: DEV_USER_ID,
      email: 'michaelasereo@gmail.com',
      name: 'Michael (User)',
      role: 'USER',
      is_admin: false,
      bio: null,
      image: null,
      account_status: 'ACTIVE',
      email_verified: true,
    } as User;
  }
}

/**
 * Get dev user for server components (doesn't need Request object)
 * Determines role from pathname
 */
export function getDevUserFromPath(pathname: string): User | null {
  if (process.env.NODE_ENV !== 'development') return null;

  if (pathname.startsWith('/therapist-dashboard')) {
    return {
      id: DEV_THERAPIST_ID,
      email: 'therapist@example.com',
      name: 'Therapist (Dev)',
      role: 'THERAPIST',
      is_admin: false,
      bio: null,
      image: null,
      account_status: 'ACTIVE',
      email_verified: true,
    } as User;
  } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return {
      id: DEV_DIETITIAN_ID,
      email: 'michaelasereoo@gmail.com',
      name: 'Michael (Dietitian)',
      role: 'DIETITIAN',
      is_admin: false,
      bio: null,
      image: null,
      account_status: 'ACTIVE',
      email_verified: true,
    } as User;
  } else if (pathname.startsWith('/user-dashboard')) {
    return {
      id: DEV_USER_ID,
      email: 'michaelasereo@gmail.com',
      name: 'Michael (User)',
      role: 'USER',
      is_admin: false,
      bio: null,
      image: null,
      account_status: 'ACTIVE',
      email_verified: true,
    } as User;
  }

  return null;
}

/**
 * Get the current authenticated user from the request (server-side API route)
 * FIXED: Now uses @supabase/ssr createClient which properly handles cookies
 * DEVELOPMENT: Bypasses auth in localhost with hardcoded users
 */
export async function getCurrentUserFromRequest(request: Request | NextRequest): Promise<User | null> {
  try {
    // Check if this is a public booking route - skip dev mode for public bookings
    let url: URL;
    try {
      if (request instanceof Request) {
        url = new URL(request.url);
      } else {
        const nextUrl = (request as any).nextUrl;
        if (nextUrl) {
          url = nextUrl;
        } else {
          url = new URL((request as any).url || 'http://localhost:3000');
        }
      }
    } catch (e) {
      url = new URL('http://localhost:3000');
    }
    
    const isPublicBooking = url.pathname.includes('/Dietitian/') || url.pathname.includes('/api/bookings');
    
    // Check if this is an API route request (has cookie header) vs server component
    // API routes need to use route handler client, server components use cookie store
    let supabase;
    const isApiRoute = url.pathname.startsWith('/api/');
    
    // Check if we can get cookies from request headers (API route) vs cookie store (server component)
    const cookieHeader = request.headers?.get?.("cookie") || 
                         (request as any).headers?.get?.("cookie") || 
                         "";
    
    if (isApiRoute && cookieHeader) {
      // For API routes, use route handler client that reads from request headers
      const { createRouteHandlerClientFromRequest } = await import("@/lib/supabase/server");
      supabase = createRouteHandlerClientFromRequest(cookieHeader);
    } else {
      // For server components, use the cookie store client
      supabase = await createClient();
    }
    
    // First, try to get real authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    // Use real authenticated user only - no dev mode fallback
    if (!authError && authUser) {
      console.log('[AUTH] Using real authenticated user:', {
        email: authUser.email,
        id: authUser.id,
        pathname: url.pathname,
        isApiRoute,
        hasCookieHeader: !!cookieHeader,
      });
      // Continue with real auth flow below - use authUser as finalAuthUser
    } else {
      // No real auth user - return null (require real authentication)
      if (authError || !authUser) {
        console.warn("getCurrentUserFromRequest: Auth error or no user", {
          error: authError?.message,
          errorCode: authError?.status,
          hasUser: !!authUser,
          url: request.url,
          pathname: url.pathname,
          isApiRoute,
          hasCookieHeader: !!cookieHeader,
          cookieHeaderLength: cookieHeader?.length || 0,
          isPublicBooking,
        });
        return null;
      }
    }
    
    // Use authUser as finalAuthUser (we already have it from above)
    // At this point, we've either:
    // 1. Got a real authenticated user (authUser is set)
    // 2. Returned early with dev user or null
    if (!authUser) {
      // This should never happen due to checks above, but TypeScript needs this
      return null;
    }
    const finalAuthUser = authUser;

    // Get user record from database
    // Determine target role based on route context
    const pathname = url.pathname;
    let targetRole: string | null = null;
    
    // For non-API routes, determine role from pathname
    if (!isApiRoute) {
      if (pathname.startsWith("/dashboard") && !pathname.startsWith("/therapist-dashboard")) {
        targetRole = "DIETITIAN";
      } else if (pathname.startsWith("/therapist-dashboard")) {
        targetRole = "THERAPIST";
      } else if (pathname.startsWith("/user-dashboard")) {
        targetRole = "USER";
      }
    } else {
      // For API routes, check referer header first, then pathname hints
      const referer = request.headers?.get?.("referer") || 
                     (request as any).headers?.get?.("referer") || 
                     "";
      
      // Check referer for dashboard context (most reliable)
      if (referer.includes("/therapist-dashboard")) {
        targetRole = "THERAPIST";
      } else if (referer.includes("/dashboard") && !referer.includes("/therapist-dashboard")) {
        targetRole = "DIETITIAN";
      } else if (referer.includes("/user-dashboard")) {
        targetRole = "USER";
      }
      
      // If no referer hint, check pathname for hints (e.g., /api/therapist-* routes)
      if (!targetRole) {
        if (pathname.includes("/therapist") || pathname.includes("therapist")) {
          targetRole = "THERAPIST";
        } else if (pathname.includes("/dietitian") || pathname.includes("dietitian")) {
          targetRole = "DIETITIAN";
        }
      }
    }

    const supabaseAdmin = createAdminClientServer();
    let user = null;
    let error = null;

    // If we have a target role, try UnifiedUserSystem first (most reliable)
    if (targetRole) {
      const { UnifiedUserSystem } = await import("@/lib/auth/unified-user-system");
      const { user: unifiedUser, error: unifiedError } = await UnifiedUserSystem.getUser(
        finalAuthUser.id,
        targetRole as any,
        supabaseAdmin
      );
      
      if (!unifiedError && unifiedUser) {
        user = unifiedUser;
        console.log('[AUTH] Found user via UnifiedUserSystem:', {
          userId: user.id,
          role: user.role,
          targetRole,
          pathname,
        });
      } else {
        // Fallback to direct query if UnifiedUserSystem fails
        const { data: userByAuthIdRole, error: errorByAuthIdRole } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("auth_user_id", finalAuthUser.id)
          .eq("role", targetRole)
          .maybeSingle();

        if (!errorByAuthIdRole && userByAuthIdRole) {
          user = userByAuthIdRole;
          console.log('[AUTH] Found user via direct query:', {
            userId: user.id,
            role: user.role,
            targetRole,
            pathname,
          });
        } else {
          error = errorByAuthIdRole || unifiedError;
        }
      }
    }

    // For API routes, if we haven't found a user yet, try both DIETITIAN and THERAPIST
    // (many API routes support both roles, and referer header may not be reliable)
    if (!user && isApiRoute) {
      console.log('[AUTH] API route - trying to find user for auth_user_id:', finalAuthUser.id);
      const referer = request.headers?.get?.("referer") || 
                     (request as any).headers?.get?.("referer") || 
                     "";
      const preferTherapist = referer.includes("/therapist-dashboard");
      console.log('[AUTH] API route - referer:', referer, 'preferTherapist:', preferTherapist);
      
      const { UnifiedUserSystem } = await import("@/lib/auth/unified-user-system");
      
      // Try THERAPIST first if preferTherapist, otherwise try both
      const rolesToTry = preferTherapist ? ["THERAPIST", "DIETITIAN"] : ["DIETITIAN", "THERAPIST"];
      
      for (const role of rolesToTry) {
        if (user) break; // Found user, stop trying
        
        console.log(`[AUTH] Trying ${role} role lookup via UnifiedUserSystem...`);
        const { user: roleUser, error: roleError } = await UnifiedUserSystem.getUser(
          finalAuthUser.id,
          role as any,
          supabaseAdmin
        );

        if (!roleError && roleUser) {
          console.log(`[AUTH] Found ${role} user via UnifiedUserSystem:`, roleUser.id);
          user = roleUser;
          targetRole = role;
          break;
        } else {
          console.log(`[AUTH] ${role} lookup via UnifiedUserSystem failed:`, roleError?.message);
          
          // Fallback: try direct query by auth_user_id
          const { data: directUser, error: directError } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("auth_user_id", finalAuthUser.id)
            .eq("role", role)
            .maybeSingle();

          if (!directError && directUser) {
            console.log(`[AUTH] Found ${role} user via direct query (auth_user_id):`, directUser.id);
            user = directUser;
            targetRole = role;
            break;
          } else {
            // Final fallback: try by id (for backward compatibility)
            const { data: userById, error: errorById } = await supabaseAdmin
              .from("users")
              .select("*")
              .eq("id", finalAuthUser.id)
              .eq("role", role)
              .maybeSingle();

            if (!errorById && userById) {
              console.log(`[AUTH] Found ${role} user via direct query (id):`, userById.id);
              user = userById;
              targetRole = role;
              break;
            }
          }
        }
      }
      
      if (!user) {
        console.warn('[AUTH] API route - No user found after trying both roles', {
          authUserId: finalAuthUser.id,
          authUserEmail: finalAuthUser.email,
          pathname: url.pathname,
          referer,
        });
      }
    }

    // Fallback: try by id (for backward compatibility with old accounts)
    if (!user) {
      const { data: userById, error: errorById } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", finalAuthUser.id)
        .maybeSingle();

      if (!errorById && userById) {
        // If we have a target role and the found user doesn't match, that's an error
        if (targetRole && userById.role !== targetRole) {
          // User exists but with different role - this is expected for separate accounts
          // Return null so the caller can handle the redirect
          console.info("getCurrentUserFromRequest: User exists with different role", {
            authUserId: finalAuthUser.id,
            foundRole: userById.role,
            targetRole,
            pathname,
          });
          return null;
        }
        user = userById;
        
        // Update auth_user_id if not set (backward compatibility)
        if (!user.auth_user_id) {
          await supabaseAdmin
            .from("users")
            .update({ auth_user_id: finalAuthUser.id })
            .eq("id", user.id);
        }
      } else {
        error = errorById;
      }
    }

    // If user doesn't exist in database but exists in auth, create the user record
    // This handles cases where OAuth succeeded but database record creation failed or was delayed
    if ((error?.code === "PGRST116" || !user) && finalAuthUser) {
      console.info("getCurrentUserFromRequest: Creating missing user record", {
        userId: finalAuthUser.id,
        email: finalAuthUser.email,
        errorCode: error?.code,
      });
      
      const userMetadata = finalAuthUser.user_metadata || {};
      const googleImage = userMetadata.avatar_url || userMetadata.picture || userMetadata.image || null;
      
      // Determine role for new user creation
      const defaultRole = targetRole || "USER";
      
      // Generate new UUID for user record (not using auth user ID directly)
      // Import crypto dynamically for UUID generation
      const crypto = await import("crypto");
      const newUserId = crypto.randomUUID();
      
      const insertData = {
        id: newUserId, // Use generated UUID
        auth_user_id: finalAuthUser.id, // Link to Supabase Auth account
        email: finalAuthUser.email!,
        name: userMetadata.name || userMetadata.full_name || finalAuthUser.email!.split("@")[0],
        image: googleImage,
        role: defaultRole,
        account_status: "ACTIVE",
        email_verified: finalAuthUser.email_confirmed_at || null,
        last_sign_in_at: new Date().toISOString(),
        metadata: {
          provider: userMetadata.provider || "google",
          provider_id: userMetadata.provider_id,
        },
      };
      
      console.log("getCurrentUserFromRequest: Inserting user with data:", {
        id: insertData.id,
        email: insertData.email,
        name: insertData.name,
        role: insertData.role,
      });
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        console.error("getCurrentUserFromRequest: User creation error details:", {
          userId: finalAuthUser.id,
          error: createError.message,
          code: createError.code,
          details: createError.details,
          hint: createError.hint,
          insertData,
        });
        
        // If insert fails (e.g., race condition), try fetching again
        if (createError.code === "23505") {
          // Unique constraint violation - user was created by another request
          console.info("getCurrentUserFromRequest: Race condition detected, fetching existing user");
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("id", finalAuthUser.id)
            .single();
          
          if (existingUser) {
            user = existingUser;
            console.info("getCurrentUserFromRequest: Successfully fetched existing user after race condition");
          } else {
            console.error("getCurrentUserFromRequest: Failed to fetch user after race condition", {
              userId: finalAuthUser.id,
              fetchError: fetchError?.message,
            });
            return null;
          }
        } else {
          // For other errors, still try to fetch in case user was created
          console.warn("getCurrentUserFromRequest: Trying to fetch user despite creation error");
          const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("id", finalAuthUser.id)
            .single();
          
          if (existingUser) {
            user = existingUser;
            console.info("getCurrentUserFromRequest: User found after creation error");
          } else {
            console.error("getCurrentUserFromRequest: Failed to create user record and user doesn't exist", {
              userId: finalAuthUser.id,
              error: createError.message,
              code: createError.code,
            });
            return null;
          }
        }
      } else if (newUser) {
        user = newUser;
        console.info("getCurrentUserFromRequest: Successfully created user record", {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
        });
      } else {
        console.error("getCurrentUserFromRequest: No error but no user returned from insert");
        return null;
      }
    } else if (error || !user) {
      console.warn("getCurrentUserFromRequest: User not found in database", {
        userId: finalAuthUser?.id,
        error: error?.message,
        errorCode: error?.code,
        hasAuthUser: !!finalAuthUser,
      });
      return null;
    }

    return user as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<"USER" | "DIETITIAN" | "ADMIN" | "THERAPIST" | null> {
  try {
    const supabaseAdmin = createAdminClientServer();
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user.role as "USER" | "DIETITIAN" | "ADMIN" | "THERAPIST";
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Require authentication from request - returns user or throws error
 */
export async function requireAuthFromRequest(request: Request | NextRequest): Promise<User> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    const error = new Error("Unauthorized: Authentication required");
    (error as any).status = 401;
    throw error;
  }
  return user;
}

/**
 * Require dietitian or therapist role from request - returns user or throws error
 * This function is used for routes that both dietitians and therapists can access
 */
export async function requireDietitianFromRequest(request: Request): Promise<User> {
  const user = await requireAuthFromRequest(request);
  if (user.role !== "DIETITIAN" && user.role !== "THERAPIST") {
    const error = new Error("Forbidden: Therapist or Dietitian access required");
    (error as any).status = 403;
    throw error;
  }
  return user;
}

/**
 * Require therapist role from request - returns user or throws error
 * This function is used for routes that only therapists can access
 */
export async function requireTherapistFromRequest(request: Request | NextRequest): Promise<User> {
  const user = await requireAuthFromRequest(request);
  if (user.role !== "THERAPIST") {
    const error = new Error("Forbidden: Therapist access required");
    (error as any).status = 403;
    throw error;
  }
  return user;
}

/**
 * Require admin role from request - returns user or throws error
 */
export async function requireAdminFromRequest(request: Request): Promise<User> {
  const user = await requireAuthFromRequest(request);
  if (user.role !== "ADMIN" && !user.is_admin) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
