import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server/client";
import { TenantMetricsService } from "@/lib/metrics/tenant-metrics";
import { ADMIN_EMAIL } from "@/lib/auth/config";

/**
 * GET /api/metrics
 * 
 * Returns tenant metrics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userEmail = user.email?.toLowerCase();
    const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get metrics
    const metrics = await TenantMetricsService.getMetrics();

    return NextResponse.json({
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

