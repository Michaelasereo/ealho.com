import { createAdminClientServer } from "@/lib/supabase/server";

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latency?: number;
  error?: string;
}

/**
 * Database Health Check
 */
export class DatabaseHealthCheck {
  static async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const supabase = createAdminClientServer();
      
      // Simple query to test connectivity
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      const latency = Date.now() - startTime;

      if (error) {
        return {
          healthy: false,
          message: "Database query failed",
          latency,
          error: error.message,
        };
      }

      return {
        healthy: true,
        message: "Database is healthy",
        latency,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        message: "Database connection failed",
        latency,
        error: error.message,
      };
    }
  }
}

