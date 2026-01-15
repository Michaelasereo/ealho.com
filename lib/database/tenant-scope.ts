import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tenant-Aware Query Helpers
 * 
 * Automatically scope queries by tenant (user) to ensure data isolation.
 * Supabase handles connection pooling automatically, but we need to ensure
 * all queries are properly scoped by tenant.
 */
export class TenantScope {
  /**
   * Scope bookings query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeBookings(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "DIETITIAN" || role === "THERAPIST") {
      // Professionals see their own bookings
      // Support both provider_id (new) and dietitian_id (legacy) during migration
      return query.or(`provider_id.eq.${userId},dietitian_id.eq.${userId}`);
    } else if (role === "USER") {
      // Users see bookings they created
      return query.eq("user_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Default: no access
    return query.eq("id", "00000000-0000-0000-0000-000000000000"); // Impossible ID
  }

  /**
   * Scope session notes query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeSessionNotes(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "THERAPIST") {
      // Therapists see notes for their clients
      return query.eq("therapist_id", userId);
    } else if (role === "USER") {
      // Clients see their own notes
      return query.eq("client_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Default: no access
    return query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  /**
   * Scope event types query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeEventTypes(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "DIETITIAN" || role === "THERAPIST") {
      // Professionals see their own event types
      return query.eq("dietitian_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Users don't have event types
    return query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  /**
   * Scope availability query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeAvailability(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "DIETITIAN" || role === "THERAPIST") {
      // Professionals see their own availability
      return query.eq("dietitian_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Users don't have availability
    return query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  /**
   * Scope meal plans query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeMealPlans(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "DIETITIAN") {
      // Dietitians see meal plans they created
      return query.eq("dietitian_id", userId);
    } else if (role === "USER") {
      // Users see meal plans assigned to them
      return query.eq("user_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Default: no access
    return query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  /**
   * Scope session requests query by tenant
   * 
   * @param query - Supabase query builder
   * @param userId - User ID (tenant identifier)
   * @param role - User role
   * @returns Scoped query
   */
  static scopeSessionRequests(
    query: any,
    userId: string,
    role: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN"
  ) {
    if (role === "DIETITIAN" || role === "THERAPIST") {
      // Providers see requests for them
      // Support both provider_id (new) and dietitian_id (legacy) during migration
      return query.or(`provider_id.eq.${userId},dietitian_id.eq.${userId}`);
    } else if (role === "USER") {
      // Users see requests they created
      return query.eq("user_id", userId);
    } else if (role === "ADMIN") {
      // Admins see all (no filter)
      return query;
    }
    // Default: no access
    return query.eq("id", "00000000-0000-0000-0000-000000000000");
  }
}

