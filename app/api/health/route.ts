import { NextResponse } from "next/server";
import { DatabaseHealthCheck } from "@/lib/health/database-check";
import { AuthHealthCheck } from "@/lib/health/auth-check";
import { StorageHealthCheck } from "@/lib/health/storage-check";
import { TenantMetricsService } from "@/lib/metrics/tenant-metrics";

export async function GET() {
  try {
    const checks: Record<string, any> = {};
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Check environment variables
    checks.env = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      healthy: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
    };

    if (!checks.env.healthy) {
      overallStatus = "unhealthy";
    }

    // Check database
    const dbCheck = await DatabaseHealthCheck.check();
    checks.database = {
      healthy: dbCheck.healthy,
      message: dbCheck.message,
      latency: dbCheck.latency,
      error: dbCheck.error,
    };
    if (!dbCheck.healthy) {
      overallStatus = overallStatus === "healthy" ? "degraded" : "unhealthy";
    }

    // Check auth service
    const authCheck = await AuthHealthCheck.check();
    checks.auth = {
      healthy: authCheck.healthy,
      message: authCheck.message,
      latency: authCheck.latency,
      error: authCheck.error,
    };
    if (!authCheck.healthy) {
      overallStatus = overallStatus === "healthy" ? "degraded" : "unhealthy";
    }

    // Check storage
    const storageCheck = await StorageHealthCheck.check();
    checks.storage = {
      healthy: storageCheck.healthy,
      message: storageCheck.message,
      latency: storageCheck.latency,
      error: storageCheck.error,
    };
    if (!storageCheck.healthy) {
      overallStatus = overallStatus === "healthy" ? "degraded" : "unhealthy";
    }

    // Get metrics
    let metrics = null;
    try {
      metrics = await TenantMetricsService.getMetrics();
    } catch (metricsError) {
      console.warn("Failed to fetch metrics:", metricsError);
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      ...(metrics && { metrics }),
    };

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;
    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    console.error("HealthCheckError", {
      error: error?.message,
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error?.message || "Unknown error",
        errorName: error?.name,
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 503 }
    );
  }
}

