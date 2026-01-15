/**
 * Tenant Context Middleware
 * 
 * Automatically injects tenant context into all requests to eliminate
 * manual scoping errors and ensure consistent tenant isolation.
 * 
 * Based on industry best practices from Auth0 and Okta.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware/client";
import { createAdminClientServer } from "@/lib/supabase/server";
import { UnifiedUserSystem } from "@/lib/auth/unified-user-system";

export interface TenantContext {
  userId: string;
  userRole: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN";
  email: string;
  accountStatus: string;
}

/**
 * Get tenant context from request
 * Extracts user information and adds it to request context
 */
export async function getTenantContext(
  request: NextRequest
): Promise<TenantContext | null> {
  try {
    const { supabase } = createClient(request);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Determine role from pathname or referer
    const pathname = request.nextUrl.pathname;
    const referer = request.headers.get("referer") || "";
    
    let targetRole: "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN" | null = null;
    
    if (pathname.startsWith("/therapist-dashboard")) {
      targetRole = "THERAPIST";
    } else if (pathname.startsWith("/dashboard") && !pathname.startsWith("/therapist-dashboard")) {
      targetRole = "DIETITIAN";
    } else if (pathname.startsWith("/user-dashboard")) {
      targetRole = "USER";
    } else if (pathname.startsWith("/admin")) {
      targetRole = "ADMIN";
    } else if (referer.includes("/therapist-dashboard")) {
      targetRole = "THERAPIST";
    } else if (referer.includes("/dashboard") && !referer.includes("/therapist-dashboard")) {
      targetRole = "DIETITIAN";
    } else if (referer.includes("/user-dashboard")) {
      targetRole = "USER";
    }

    // If no target role, try to find user with any role
    const supabaseAdmin = createAdminClientServer();
    
    if (targetRole) {
      const { user, error } = await UnifiedUserSystem.getUser(
        authUser.id,
        targetRole,
        supabaseAdmin
      );
      
      if (!error && user) {
        return {
          userId: user.id,
          userRole: user.role,
          email: user.email,
          accountStatus: user.account_status || "ACTIVE",
        };
      }
    }

    // Fallback: try to find user with any role
    const { user, error } = await UnifiedUserSystem.getUser(
      authUser.id,
      null,
      supabaseAdmin
    );

    if (error || !user) {
      return null;
    }

    return {
      userId: user.id,
      userRole: user.role,
      email: user.email,
      accountStatus: user.account_status || "ACTIVE",
    };
  } catch (error) {
    console.error("getTenantContext error:", error);
    return null;
  }
}

/**
 * Middleware to inject tenant context into request headers
 * This allows downstream handlers to access tenant context without re-fetching
 */
export async function injectTenantContext(
  request: NextRequest
): Promise<NextResponse> {
  const tenantContext = await getTenantContext(request);
  
  if (!tenantContext) {
    // No tenant context - continue without it (public routes)
    return NextResponse.next();
  }

  // Clone request and add tenant context to headers
  const response = NextResponse.next();
  
  // Add tenant context to request headers (for API routes)
  request.headers.set("x-tenant-id", tenantContext.userId);
  request.headers.set("x-tenant-role", tenantContext.userRole);
  request.headers.set("x-tenant-email", tenantContext.email);
  request.headers.set("x-tenant-status", tenantContext.accountStatus);
  
  // Also add to response headers for debugging (remove in production)
  if (process.env.NODE_ENV === "development") {
    response.headers.set("x-tenant-id", tenantContext.userId);
    response.headers.set("x-tenant-role", tenantContext.userRole);
  }

  return response;
}

/**
 * Get tenant context from request headers (for API routes)
 */
export function getTenantContextFromHeaders(
  request: Request | NextRequest
): TenantContext | null {
  const headers = request.headers;
  const tenantId = headers.get("x-tenant-id");
  const tenantRole = headers.get("x-tenant-role") as TenantContext["userRole"] | null;
  const tenantEmail = headers.get("x-tenant-email");
  const tenantStatus = headers.get("x-tenant-status");

  if (!tenantId || !tenantRole || !tenantEmail) {
    return null;
  }

  return {
    userId: tenantId,
    userRole: tenantRole,
    email: tenantEmail,
    accountStatus: tenantStatus || "ACTIVE",
  };
}

/**
 * Require tenant context - throws if not available
 */
export function requireTenantContext(
  request: Request | NextRequest
): TenantContext {
  const context = getTenantContextFromHeaders(request);
  
  if (!context) {
    throw new Error("Tenant context required but not available");
  }

  return context;
}

