import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server/client";
import { TenantRateLimiter } from "@/lib/rate-limit/tenant-limiter";

/**
 * GET /api/rate-limit-status
 * 
 * Check current rate limit status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const endpoint = request.nextUrl.searchParams.get("endpoint") || pathname;

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const isAuthenticated = !authError && !!user;
    const userId = user?.id || null;

    // Get rate limit status
    const status = TenantRateLimiter.getStatus(userId, endpoint, isAuthenticated);

    return NextResponse.json({
      allowed: status.allowed,
      remaining: status.remaining,
      resetAt: new Date(status.resetAt).toISOString(),
      retryAfter: status.retryAfter,
    });
  } catch (error: any) {
    console.error("Rate limit status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

