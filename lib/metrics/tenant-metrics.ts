import { createAdminClientServer } from "@/lib/supabase/server";

export interface TenantMetrics {
  activeTenants: number;
  activeUsers: number;
  onboardingCompletionRate: number;
  totalUsers: number;
  usersByRole: {
    USER: number;
    DIETITIAN: number;
    THERAPIST: number;
    ADMIN: number;
  };
}

/**
 * Tenant Metrics
 * 
 * Provides metrics about tenants and users for monitoring.
 */
export class TenantMetricsService {
  /**
   * Get tenant metrics
   */
  static async getMetrics(): Promise<TenantMetrics> {
    const supabase = createAdminClientServer();

    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("last_sign_in_at", thirtyDaysAgo.toISOString())
        .eq("account_status", "ACTIVE");

      // Get users by role
      const { data: usersByRoleData } = await supabase
        .from("users")
        .select("role")
        .eq("account_status", "ACTIVE");

      const usersByRole = {
        USER: 0,
        DIETITIAN: 0,
        THERAPIST: 0,
        ADMIN: 0,
      };

      usersByRoleData?.forEach((user) => {
        const role = user.role as keyof typeof usersByRole;
        if (role in usersByRole) {
          usersByRole[role]++;
        }
      });

      // Get onboarding completion rate
      const { count: completedOnboarding } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("onboarding_completed", true)
        .eq("account_status", "ACTIVE");

      const onboardingCompletionRate =
        totalUsers && totalUsers > 0
          ? (completedOnboarding || 0) / totalUsers
          : 0;

      // Active tenants = unique users with activity
      const activeTenants = activeUsers || 0;

      return {
        activeTenants,
        activeUsers: activeUsers || 0,
        onboardingCompletionRate: Math.round(onboardingCompletionRate * 100) / 100,
        totalUsers: totalUsers || 0,
        usersByRole,
      };
    } catch (error: any) {
      console.error("TenantMetrics.getMetrics error:", error);
      // Return default metrics on error
      return {
        activeTenants: 0,
        activeUsers: 0,
        onboardingCompletionRate: 0,
        totalUsers: 0,
        usersByRole: {
          USER: 0,
          DIETITIAN: 0,
          THERAPIST: 0,
          ADMIN: 0,
        },
      };
    }
  }
}

