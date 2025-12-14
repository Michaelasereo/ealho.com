import { createAdminClient } from "@/lib/supabase/server/admin";
import { getRedirectPathForRole, getAccountStatusRedirect, normalizeRole, getUserRoleWithRetry } from "./auth-utils";

/**
 * Determine where to redirect user after authentication
 * Handles role-based redirects and account status checks
 * Uses retry logic to handle race conditions
 */
export async function determineUserRedirect(userId: string): Promise<string> {
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
      // User doesn't exist in database - redirect to enrollment
      console.info("DetermineRedirectUserNotFound", {
        userId,
        timestamp: new Date().toISOString(),
      });
      return "/dietitian-enrollment";
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
      // Last resort: log error but don't guess - redirect to enrollment for safety
      console.error("DetermineRedirectFailed", {
        userId,
        roleError,
        timestamp: new Date().toISOString(),
      });
      return "/dietitian-enrollment"; // Safer default - user can complete enrollment
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
    // Last resort: redirect to enrollment instead of assuming user role
    return "/dietitian-enrollment";
  }
}

