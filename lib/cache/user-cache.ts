/**
 * User Cache
 * 
 * Caches user roles and profiles to reduce database queries.
 * Uses in-memory cache with TTL, with optional Redis support.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }
}

// Singleton cache instance
const cache = new InMemoryCache();
cache.startCleanup();

export interface UserRoleCache {
  role: string;
  account_status: string;
}

export interface UserProfileCache {
  name: string | null;
  image: string | null;
}

/**
 * User Cache Manager
 * 
 * Caches user roles and profiles to reduce database load.
 */
export class UserCache {
  private static readonly ROLE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly PROFILE_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly ONBOARDING_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Get cached user role
   */
  static getUserRole(userId: string): UserRoleCache | null {
    return cache.get<UserRoleCache>(`user:role:${userId}`);
  }

  /**
   * Set cached user role
   */
  static setUserRole(userId: string, role: string, accountStatus: string): void {
    cache.set<UserRoleCache>(
      `user:role:${userId}`,
      { role, account_status: accountStatus },
      this.ROLE_TTL
    );
  }

  /**
   * Get cached user profile
   */
  static getUserProfile(userId: string): UserProfileCache | null {
    return cache.get<UserProfileCache>(`user:profile:${userId}`);
  }

  /**
   * Set cached user profile
   */
  static setUserProfile(userId: string, profile: UserProfileCache): void {
    cache.set<UserProfileCache>(
      `user:profile:${userId}`,
      profile,
      this.PROFILE_TTL
    );
  }

  /**
   * Get cached onboarding status
   */
  static getOnboardingStatus(userId: string): boolean | null {
    return cache.get<boolean>(`user:onboarding:${userId}`);
  }

  /**
   * Set cached onboarding status
   */
  static setOnboardingStatus(userId: string, completed: boolean): void {
    cache.set<boolean>(
      `user:onboarding:${userId}`,
      completed,
      this.ONBOARDING_TTL
    );
  }

  /**
   * Invalidate user cache (call when user is updated)
   */
  static invalidateUser(userId: string): void {
    cache.delete(`user:role:${userId}`);
    cache.delete(`user:profile:${userId}`);
    cache.delete(`user:onboarding:${userId}`);
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    cache.clear();
  }
}

