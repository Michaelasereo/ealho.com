import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer, createRouteHandlerClientFromRequest, getCookieHeader } from "@/lib/supabase/server";

/**
 * Emergency diagnostic endpoint for authentication issues
 * Use this to troubleshoot authentication problems in production
 * 
 * GET /api/auth/health
 */
export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      headers: {
        cookie: request.headers.get("cookie") ? "Present" : "Missing",
        authorization: request.headers.get("authorization") ? "Present" : "Missing",
        origin: request.headers.get("origin") || "Not set",
        userAgent: request.headers.get("user-agent") || "Not set",
      },
    };

    // Test database connection
    let dbStatus: { connected: boolean; userCount: number; error: string | null } = { connected: false, userCount: 0, error: null };
    try {
      const supabaseAdmin = createAdminClientServer();
      const { count, error: countError } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true });

      dbStatus = {
        connected: !countError,
        userCount: count || 0,
        error: countError?.message ?? null,
      };
    } catch (dbError: any) {
      dbStatus.error = dbError.message;
    }

    // Test auth connection
    let authStatus: {
      hasSession: boolean;
      userId: string | null;
      email: string | null;
      error: string | null;
    } = {
      hasSession: false,
      userId: null,
      email: null,
      error: null,
    };

    try {
      const cookieHeader = getCookieHeader(request);
      const supabase = createRouteHandlerClientFromRequest(cookieHeader);

      // Try getSession first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionData?.session) {
        authStatus = {
          hasSession: true,
          userId: sessionData.session.user.id,
          email: sessionData.session.user.email ?? null,
          error: null,
        };
      } else {
        // Try getUser as fallback
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userData?.user) {
          authStatus = {
            hasSession: false,
            userId: userData.user.id,
            email: userData.user.email ?? null,
            error: "Session expired but user found",
          };
        } else {
          authStatus.error = sessionError?.message || userError?.message || "No session or user found";
        }
      }
    } catch (authError: any) {
      authStatus.error = authError.message;
    }

    // Test user lookup if we have a user ID
    let userLookupStatus: {
      found: boolean;
      source: string | null;
      role: string | null;
      hasAuthUserId: boolean;
      error: string | null;
    } = {
      found: false,
      source: null,
      role: null,
      hasAuthUserId: false,
      error: null,
    };

    if (authStatus.userId) {
      try {
        const supabaseAdmin = createAdminClientServer();
        const { user: dbUser, source, error: lookupError } = await (
          await import("@/lib/auth/user-lookup")
        ).findUserByAuthId(authStatus.userId, null, supabaseAdmin);

        if (dbUser) {
          userLookupStatus = {
            found: true,
            source: source ?? "unknown",
            role: dbUser.role ?? null,
            hasAuthUserId: !!dbUser.auth_user_id,
            error: null,
          };
        } else {
          userLookupStatus.error = lookupError?.message || "User not found in database";
        }
      } catch (lookupError: any) {
        userLookupStatus.error = lookupError.message;
      }
    }

    const recommendations: string[] = [];

    if (!dbStatus.connected) {
      recommendations.push("❌ Database connection failed - check Supabase credentials");
    }

    if (!authStatus.hasSession && !authStatus.userId) {
      recommendations.push("❌ No authentication session found - user needs to sign in");
    }

    if (authStatus.userId && !userLookupStatus.found) {
      recommendations.push(
        `⚠️ Auth user exists (${authStatus.userId}) but not found in database - user needs enrollment`
      );
    }

    if (userLookupStatus.found && !userLookupStatus.hasAuthUserId) {
      recommendations.push(
        "⚠️ User found but missing auth_user_id - run migration script to fix"
      );
    }

    if (userLookupStatus.found && userLookupStatus.source === "id_legacy") {
      recommendations.push(
        "ℹ️ User found via legacy id lookup - consider running migration to set auth_user_id"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ All systems operational");
    }

    return NextResponse.json(
      {
        status: "ok",
        diagnostics,
        database: dbStatus,
        authentication: authStatus,
        userLookup: userLookupStatus,
        recommendations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

