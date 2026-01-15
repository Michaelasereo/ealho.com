import { createAdminClient } from "@/lib/supabase/server/admin";
import { getRedirectPathForRole, getAccountStatusRedirect, normalizeRole, getUserRoleWithRetry } from "./auth-utils";

/**
 * Determine where to redirect user after authentication
 * Handles role-based redirects and account status checks
 * Uses retry logic to handle race conditions
 * @param userId - User ID from auth
 * @param source - Source parameter from OAuth callback (e.g., "therapy-signup", "therapist-login")
 * @param signupSource - Signup source from database (e.g., "therapy")
 */
export async function determineUserRedirect(
  userId: string,
  source?: string,
  signupSource?: string
): Promise<string> {
  try {
    const supabaseAdmin = createAdminClient();

    // Use retry logic to get user role (handles race conditions)
    // Increased retries and delay to handle race conditions better
    const { role: userRole, error: roleError } = await getUserRoleWithRetry(
      supabaseAdmin,
      userId,
      5,
      600
    );

    if (roleError === "User role not found") {
      // User doesn't exist in database - redirect based on source
      console.info("DetermineRedirectUserNotFound", {
        userId,
        source,
        signupSource,
        timestamp: new Date().toISOString(),
      });
      
      // Determine redirect based on source
      if (source === "therapy-signup" || source === "therapy-login" || signupSource === "therapy") {
        // User from therapy homepage should go to user-dashboard (will create USER account)
        return "/user-dashboard";
      } else if (source === "therapist-login") {
        // Therapist login should go to therapist signup (for new users) or enrollment (for existing)
        // The auth callback will handle the proper redirect
        return "/therapist-signup";
      } else if (source === "dietitian-login") {
        // Dietitian login should go to dietitian enrollment
        return "/dietitian-enrollment";
      } else if (source === "admin-login") {
        // Admin login - check if admin email, otherwise user-dashboard
        return "/admin";
      } else {
        // Default: regular signup goes to user-dashboard
        return "/user-dashboard";
      }
    }

    if (roleError || !userRole) {
      console.error("Error fetching user role for redirect:", roleError);
      // Instead of defaulting, try one more direct database query to get the role
      try {
        const { data: directUser } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();
        if (directUser?.role) {
          const normalizedRole = normalizeRole(directUser.role);
          const redirectPath = getRedirectPathForRole(normalizedRole);
          console.info("DetermineRedirectDirectQuerySuccess", {
            userId,
            role: directUser.role,
            normalizedRole,
            redirectPath,
            timestamp: new Date().toISOString(),
          });
          return redirectPath;
        }
      } catch (directError) {
        console.error("Direct user query also failed:", directError);
      }
      // Last resort: log error but don't guess - redirect based on source
      console.error("DetermineRedirectFailed", {
        userId,
        roleError,
        source,
        signupSource,
        timestamp: new Date().toISOString(),
      });
      
      // Use source to determine redirect
      if (source === "therapy-signup" || source === "therapy-login" || signupSource === "therapy") {
        return "/user-dashboard";
      } else if (source === "therapist-login") {
        return "/therapist-signup";
      } else if (source === "dietitian-login") {
        return "/dietitian-enrollment";
      } else {
        return "/user-dashboard"; // Default to user-dashboard for regular users
      }
    }

    // Fetch full user data to check account status
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from("users")
      .select("id, role, account_status")
      .eq("id", userId)
      .single();

    if (dbError && dbError.code !== "PGRST116") {
      // Error other than "not found" - log but use role we already have
      console.warn("Error fetching user details for redirect:", dbError);
    }

    // Check account status if we have user data
    if (dbUser) {
      const accountStatus = dbUser.account_status || "ACTIVE";
      const statusRedirect = getAccountStatusRedirect(accountStatus);

      if (statusRedirect) {
        return statusRedirect;
      }
    }

    // Get role-based redirect using the role we fetched with retry
    const normalizedRole = normalizeRole(userRole);
    const redirectPath = getRedirectPathForRole(normalizedRole);
    
    console.info("DetermineRedirectSuccess", {
      userId,
      role: userRole,
      normalizedRole,
      redirectPath,
      timestamp: new Date().toISOString(),
    });
    
    return redirectPath;
  } catch (error) {
    console.error("Error determining user redirect:", error);
    // Don't default to user-dashboard - try to fetch role one more time
    try {
      const supabaseAdmin = createAdminClient();
      const { data: emergencyUser } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (emergencyUser?.role) {
        const normalizedRole = normalizeRole(emergencyUser.role);
        return getRedirectPathForRole(normalizedRole);
      }
    } catch (emergencyError) {
      console.error("Emergency role fetch also failed:", emergencyError);
    }
    // Last resort: redirect based on source
    if (source === "therapy-signup" || source === "therapy-login" || signupSource === "therapy") {
      return "/user-dashboard";
    } else if (source === "therapist-login") {
      return "/therapist-signup";
    } else if (source === "dietitian-login") {
      return "/dietitian-enrollment";
    } else {
      return "/user-dashboard"; // Default to user-dashboard for regular users
    }
  }
}

