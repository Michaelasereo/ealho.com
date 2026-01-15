import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClientServer } from "@/lib/supabase/server";

export type AuditEventType =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "ONBOARDING_STARTED"
  | "ONBOARDING_COMPLETED"
  | "ROLE_CHANGE"
  | "DATA_ACCESS"
  | "DATA_MODIFIED"
  | "ACCOUNT_STATUS_CHANGE"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFIED"
  | "SESSION_CREATED"
  | "SESSION_REVOKED"
  | "API_ACCESS"
  | "ADMIN_ACTION"
  | "SECURITY_EVENT"
  | "ERROR";

export interface AuditLogMetadata {
  [key: string]: any;
  ip_address?: string;
  user_agent?: string;
  method?: string;
  path?: string;
  status_code?: number;
  error_message?: string;
  duration_ms?: number;
  tenant_id?: string;
  resource_id?: string;
  resource_type?: string;
}

export interface AuditLog {
  id: string;
  event: AuditEventType;
  user_id: string | null;
  tenant_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: AuditLogMetadata;
  created_at: string;
}

/**
 * Audit Logger
 * 
 * Comprehensive audit logging for security, compliance, and debugging.
 * All critical operations should be logged.
 */
export class AuditLogger {
  private static supabaseAdmin: SupabaseClient | null = null;

  private static getClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      this.supabaseAdmin = createAdminClientServer();
    }
    return this.supabaseAdmin;
  }

  /**
   * Log an audit event
   * 
   * @param event - Event type
   * @param userId - User ID (null for unauthenticated events)
   * @param metadata - Additional metadata
   * @param request - Optional request object for extracting IP/UA
   */
  static async log(
    event: AuditEventType,
    userId: string | null,
    metadata: AuditLogMetadata = {},
    request?: Request | { headers: Headers }
  ): Promise<void> {
    try {
      const client = this.getClient();
      
      // Extract IP address and user agent from request if provided
      let ipAddress = metadata.ip_address || null;
      let userAgent = metadata.user_agent || null;

      if (request) {
        const headers = request.headers instanceof Headers 
          ? request.headers 
          : new Headers((request as any).headers || {});
        
        if (!ipAddress) {
          ipAddress = 
            headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headers.get("x-real-ip") ||
            headers.get("cf-connecting-ip") ||
            null;
        }
        
        if (!userAgent) {
          userAgent = headers.get("user-agent") || null;
        }
      }

      // Extract tenant_id from metadata, headers, or user lookup
      let tenantId = metadata.tenant_id || null;
      
      // Try to get tenant_id from request headers (if tenant context middleware is used)
      if (!tenantId && request) {
        const headers = request.headers instanceof Headers 
          ? request.headers 
          : new Headers((request as any).headers || {});
        tenantId = headers.get("x-tenant-id") || null;
      }
      
      // Fallback: lookup from user table
      if (!tenantId && userId) {
        try {
          const { data: user } = await client
            .from("users")
            .select("id, role, account_status")
            .eq("id", userId)
            .single();
          tenantId = user?.id || null;
          
          // Also add role and account_status to metadata if not present
          if (user && !metadata.user_role) {
            metadata.user_role = user.role;
          }
          if (user && !metadata.account_status) {
            metadata.account_status = user.account_status;
          }
        } catch (err) {
          // Ignore tenant lookup errors
        }
      }

      // Insert audit log
      const { error } = await client.from("audit_logs").insert({
        event,
        user_id: userId,
        tenant_id: tenantId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("AuditLogger.log error:", error);
        // Don't throw - audit logging failures shouldn't break the app
      }

      // Optional: Send to external logging service in production
      if (process.env.NODE_ENV === "production" && process.env.EXTERNAL_LOGGING_URL) {
        try {
          await fetch(process.env.EXTERNAL_LOGGING_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event,
              userId,
              tenantId,
              ipAddress,
              userAgent,
              metadata,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {
            // Ignore external logging errors
          });
        } catch (err) {
          // Ignore external logging errors
        }
      }
    } catch (error: any) {
      // Never throw from audit logging - it's non-critical
      console.error("AuditLogger.log exception:", error);
    }
  }

  /**
   * Log user login
   */
  static async logLogin(
    userId: string,
    method: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("USER_LOGIN", userId, {
      ...metadata,
      method,
    }, request);
  }

  /**
   * Log user logout
   */
  static async logLogout(
    userId: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("USER_LOGOUT", userId, metadata, request);
  }

  /**
   * Log user creation
   */
  static async logUserCreated(
    userId: string,
    role: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("USER_CREATED", userId, {
      ...metadata,
      role,
    }, request);
  }

  /**
   * Log onboarding completion
   */
  static async logOnboardingCompleted(
    userId: string,
    role: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("ONBOARDING_COMPLETED", userId, {
      ...metadata,
      role,
    }, request);
  }

  /**
   * Log data access
   */
  static async logDataAccess(
    userId: string | null,
    resourceType: string,
    resourceId: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("DATA_ACCESS", userId, {
      ...metadata,
      resource_type: resourceType,
      resource_id: resourceId,
    }, request);
  }

  /**
   * Log API access
   */
  static async logApiAccess(
    userId: string | null,
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("API_ACCESS", userId, {
      ...metadata,
      method,
      path,
      status_code: statusCode,
      duration_ms: durationMs,
    }, request);
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    userId: string | null,
    event: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("SECURITY_EVENT", userId, {
      ...metadata,
      security_event: event,
    }, request);
  }

  /**
   * Log error
   */
  static async logError(
    userId: string | null,
    errorMessage: string,
    metadata: AuditLogMetadata = {},
    request?: Request
  ): Promise<void> {
    await this.log("ERROR", userId, {
      ...metadata,
      error_message: errorMessage,
    }, request);
  }
}

