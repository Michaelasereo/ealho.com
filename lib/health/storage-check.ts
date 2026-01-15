import { createAdminClientServer } from "@/lib/supabase/server";

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latency?: number;
  error?: string;
}

/**
 * Storage Health Check
 */
export class StorageHealthCheck {
  static async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const supabase = createAdminClientServer();
      
      // Test storage connectivity by listing buckets
      const { data, error } = await supabase.storage.listBuckets();

      const latency = Date.now() - startTime;

      if (error) {
        return {
          healthy: false,
          message: "Storage service failed",
          latency,
          error: error.message,
        };
      }

      return {
        healthy: true,
        message: "Storage is healthy",
        latency,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        message: "Storage connection failed",
        latency,
        error: error.message,
      };
    }
  }
}

