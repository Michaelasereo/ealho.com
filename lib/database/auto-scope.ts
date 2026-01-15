/**
 * Automatic Tenant Scoping
 * 
 * Provides automatic query scoping based on tenant context,
 * eliminating the need for manual scoping in every query.
 * 
 * This works in conjunction with RLS policies for defense in depth.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { TenantContext } from "@/lib/middleware/tenant-context";

/**
 * Automatically scope a bookings query by tenant context
 */
export function autoScopeBookings<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "DIETITIAN" || context.userRole === "THERAPIST") {
    // Support both provider_id (new) and dietitian_id (legacy) during migration
    return query.or(`provider_id.eq.${context.userId},dietitian_id.eq.${context.userId}`);
  } else if (context.userRole === "USER") {
    return query.eq("user_id", context.userId);
  } else if (context.userRole === "ADMIN") {
    // Admins see all - no filter
    return query;
  }
  
  // Default: no access
  return query.eq("id", "00000000-0000-0000-0000-000000000000");
}

/**
 * Automatically scope a session requests query by tenant context
 */
export function autoScopeSessionRequests<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "DIETITIAN" || context.userRole === "THERAPIST") {
    // Support both provider_id (new) and dietitian_id (legacy) during migration
    return query.or(`provider_id.eq.${context.userId},dietitian_id.eq.${context.userId}`);
  } else if (context.userRole === "USER") {
    // Users see requests where their email matches client_email
    return query.eq("client_email", context.email);
  } else if (context.userRole === "ADMIN") {
    return query;
  }
  
  return query.eq("id", "00000000-0000-0000-0000-000000000000");
}

/**
 * Automatically scope an event types query by tenant context
 */
export function autoScopeEventTypes<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "DIETITIAN" || context.userRole === "THERAPIST") {
    return query.eq("user_id", context.userId);
  } else if (context.userRole === "ADMIN") {
    return query;
  }
  
  // Users can view active event types (public access)
  // This is handled by RLS, so we don't filter here
  return query;
}

/**
 * Automatically scope a session notes query by tenant context
 */
export function autoScopeSessionNotes<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "THERAPIST") {
    return query.eq("therapist_id", context.userId);
  } else if (context.userRole === "USER") {
    return query.eq("client_id", context.userId);
  } else if (context.userRole === "ADMIN") {
    return query;
  }
  
  return query.eq("id", "00000000-0000-0000-0000-000000000000");
}

/**
 * Automatically scope a meal plans query by tenant context
 */
export function autoScopeMealPlans<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "DIETITIAN") {
    // Support both provider_id (new) and dietitian_id (legacy) during migration
    return query.or(`provider_id.eq.${context.userId},dietitian_id.eq.${context.userId}`);
  } else if (context.userRole === "USER") {
    return query.eq("user_id", context.userId);
  } else if (context.userRole === "ADMIN") {
    return query;
  }
  
  return query.eq("id", "00000000-0000-0000-0000-000000000000");
}

/**
 * Automatically scope an availability query by tenant context
 */
export function autoScopeAvailability<T>(
  query: any,
  context: TenantContext
): any {
  if (context.userRole === "DIETITIAN" || context.userRole === "THERAPIST") {
    // Support both provider_id (new) and dietitian_id (legacy) during migration
    return query.or(`provider_id.eq.${context.userId},dietitian_id.eq.${context.userId}`);
  } else if (context.userRole === "ADMIN") {
    return query;
  }
  
  return query.eq("id", "00000000-0000-0000-0000-000000000000");
}

/**
 * Generic auto-scope function that determines the right scoping function
 * based on table name
 */
export function autoScope<T>(
  tableName: string,
  query: any,
  context: TenantContext
): any {
  switch (tableName.toLowerCase()) {
    case "bookings":
      return autoScopeBookings(query, context);
    case "session_requests":
      return autoScopeSessionRequests(query, context);
    case "event_types":
      return autoScopeEventTypes(query, context);
    case "session_notes":
      return autoScopeSessionNotes(query, context);
    case "meal_plans":
      return autoScopeMealPlans(query, context);
    case "availability_schedules":
    case "availability_overrides":
      return autoScopeAvailability(query, context);
    default:
      // Unknown table - return query as-is (rely on RLS)
      console.warn(`Unknown table for auto-scoping: ${tableName}`);
      return query;
  }
}

