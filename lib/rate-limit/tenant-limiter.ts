/**
 * Tenant-Aware Rate Limiter
 * 
 * Implements rate limiting per tenant (user) to prevent abuse and DDoS.
 * Uses in-memory storage with optional Redis support.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();

  get(key: string): RateLimitEntry | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.resetAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  set(key: string, count: number, resetAt: number): void {
    this.store.set(key, { count, resetAt });
  }

  increment(key: string, windowMs: number): { count: number; resetAt: number } {
    const entry = this.get(key);
    const now = Date.now();
    const resetAt = now + windowMs;

    if (entry) {
      const newCount = entry.count + 1;
      this.set(key, newCount, entry.resetAt);
      return { count: newCount, resetAt: entry.resetAt };
    } else {
      this.set(key, 1, resetAt);
      return { count: 1, resetAt };
    }
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton store instance
const store = new RateLimitStore();
// Cleanup every minute
setInterval(() => store.cleanup(), 60000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Tenant Rate Limiter
 * 
 * Implements rate limiting per tenant (user) and endpoint.
 */
export class TenantRateLimiter {
  // Default rate limits
  private static readonly DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
    // Authenticated users
    authenticated: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
    },
    // Unauthenticated users
    unauthenticated: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
    },
    // Auth endpoints (stricter)
    auth: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    },
    // API endpoints
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
    },
  };

  /**
   * Check rate limit for a tenant and endpoint
   * 
   * @param tenantId - Tenant ID (user ID)
   * @param endpoint - Endpoint path
   * @param isAuthenticated - Whether user is authenticated
   * @param customLimit - Optional custom rate limit config
   * @returns Rate limit result
   */
  static async check(
    tenantId: string | null,
    endpoint: string,
    isAuthenticated: boolean = false,
    customLimit?: RateLimitConfig
  ): Promise<RateLimitResult> {
    // Determine which limit to use
    let limit: RateLimitConfig;
    
    if (customLimit) {
      limit = customLimit;
    } else if (endpoint.includes("/auth/") || endpoint.includes("/login") || endpoint.includes("/signup")) {
      limit = this.DEFAULT_LIMITS.auth;
    } else if (isAuthenticated) {
      limit = this.DEFAULT_LIMITS.authenticated;
    } else {
      limit = this.DEFAULT_LIMITS.unauthenticated;
    }

    // Generate key: tenantId:endpoint
    const key = tenantId 
      ? `rate:${tenantId}:${endpoint}`
      : `rate:anonymous:${endpoint}`;

    // Increment counter
    const { count, resetAt } = store.increment(key, limit.windowMs);

    // Check if limit exceeded
    const allowed = count <= limit.maxRequests;
    const remaining = Math.max(0, limit.maxRequests - count);
    const retryAfter = allowed ? undefined : Math.ceil((resetAt - Date.now()) / 1000);

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter,
    };
  }

  /**
   * Get rate limit status without incrementing
   * 
   * @param tenantId - Tenant ID
   * @param endpoint - Endpoint path
   * @param isAuthenticated - Whether user is authenticated
   * @returns Current rate limit status
   */
  static getStatus(
    tenantId: string | null,
    endpoint: string,
    isAuthenticated: boolean = false
  ): RateLimitResult {
    const limit = isAuthenticated 
      ? this.DEFAULT_LIMITS.authenticated
      : this.DEFAULT_LIMITS.unauthenticated;

    const key = tenantId 
      ? `rate:${tenantId}:${endpoint}`
      : `rate:anonymous:${endpoint}`;

    const entry = store.get(key);
    
    if (!entry) {
      return {
        allowed: true,
        remaining: limit.maxRequests,
        resetAt: Date.now() + limit.windowMs,
      };
    }

    const allowed = entry.count <= limit.maxRequests;
    const remaining = Math.max(0, limit.maxRequests - entry.count);
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - Date.now()) / 1000);

    return {
      allowed,
      remaining,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  /**
   * Reset rate limit for a tenant and endpoint
   * 
   * @param tenantId - Tenant ID
   * @param endpoint - Endpoint path
   */
  static reset(tenantId: string | null, endpoint: string): void {
    const key = tenantId 
      ? `rate:${tenantId}:${endpoint}`
      : `rate:anonymous:${endpoint}`;
    store.set(key, 0, Date.now());
  }
}

