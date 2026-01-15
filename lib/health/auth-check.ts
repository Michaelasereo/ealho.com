import { createClient } from "@/lib/supabase/server/client";

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latency?: number;
  error?: string;
}

/**
 * Auth Service Health Check
 */
export class AuthHealthCheck {
  static async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const supabase = await createClient();
      
      // Test auth service connectivity
      // We can't actually authenticate without a session, but we can check if the service responds
      const { error } = await supabase.auth.getSession();

      const latency = Date.now() - startTime;

      // Error is expected if no session, but service should still respond
      if (error && error.message.includes("JWT")) {
        // JWT errors are expected when no session - service is healthy
        return {
          healthy: true,
          message: "Auth service is healthy",
          latency,
        };
      }

      return {
        healthy: true,
        message: "Auth service is healthy",
        latency,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        message: "Auth service connection failed",
        latency,
        error: error.message,
      };
    }
  }
}

