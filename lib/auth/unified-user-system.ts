import { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export type UserRole = "USER" | "DIETITIAN" | "THERAPIST" | "ADMIN";

export interface UnifiedUser {
  id: string; // Same as auth.users.id (single source of truth)
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  account_status: string;
  email_verified: boolean | null;
  onboarding_completed: boolean;
  signup_source: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
}

export interface CreateUserParams {
  authUserId: string; // Supabase Auth user ID (will become the users.id)
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  account_status?: string;
  email_verified?: boolean | null;
  onboarding_completed?: boolean;
  signup_source?: string | null;
  metadata?: Record<string, any>;
}

export interface GetUserResult {
  user: UnifiedUser | null;
  error: any | null;
}

/**
 * Unified User System
 * 
 * Single source of truth: auth.users.id = users.id
 * This eliminates the dual identity mapping anti-pattern.
 * 
 * All user lookups use the auth user ID directly as the primary key.
 */
export class UnifiedUserSystem {
  /**
   * Create a new user in the application database
   * Supports multiple accounts per email (one per role)
   * 
   * For unified system: Uses auth_user_id + role as unique identifier
   * The id field can be auth_user_id (for single account) or separate UUID (for multi-account)
   * 
   * @param params - User creation parameters
   * @param supabaseAdmin - Admin Supabase client
   * @returns Created user or error
   */
  static async createUser(
    params: CreateUserParams,
    supabaseAdmin: SupabaseClient
  ): Promise<GetUserResult> {
    try {
      // Check if user with (auth_user_id, role) already exists
      const existing = await this.getUserByEmailAndRole(params.email, params.role, supabaseAdmin);
      if (existing.user) {
        // User already exists - return it
        return existing;
      }

      // Generate ID: use auth_user_id if this is the first account, otherwise generate UUID
      // This allows multiple accounts per email while keeping first account simple
      const isFirstAccount = !(await this.userExists(params.authUserId, supabaseAdmin));
      const userId = isFirstAccount ? params.authUserId : randomUUID();

      // Insert user
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          auth_user_id: params.authUserId,
          email: params.email.toLowerCase().trim(),
          name: params.name || null,
          image: params.image || null,
          role: params.role,
          account_status: params.account_status || 'ACTIVE',
          email_verified: params.email_verified || false,
          onboarding_completed: params.onboarding_completed || false,
          signup_source: params.signup_source || null,
          metadata: params.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (race condition)
        if (error.code === "23505") {
          // Try to fetch existing user
          const existing = await this.getUserByEmailAndRole(params.email, params.role, supabaseAdmin);
          if (existing.user) {
            return existing;
          }
        }
        console.error("UnifiedUserSystem.createUser error:", error);
        return { user: null, error };
      }

      return { user: user as UnifiedUser, error: null };
    } catch (error: any) {
      console.error("UnifiedUserSystem.createUser exception:", error);
      return { user: null, error };
    }
  }

  /**
   * Get user by auth user ID and role
   * Supports multiple accounts per email (one per role)
   * 
   * @param authUserId - Supabase Auth user ID
   * @param role - Required role filter (for multi-account support)
   * @param supabaseAdmin - Admin Supabase client
   * @returns User or null if not found
   */
  static async getUser(
    authUserId: string,
    role: UserRole | null | undefined,
    supabaseAdmin: SupabaseClient
  ): Promise<GetUserResult> {
    try {
      // For unified system: try id = authUserId first (new accounts)
      // Then fallback to auth_user_id = authUserId (legacy accounts)
      let query = supabaseAdmin
        .from("users")
        .select("*")
        .or(`id.eq.${authUserId},auth_user_id.eq.${authUserId}`);

      // Role is required for multi-account support
      if (role) {
        query = query.eq("role", role);
      }

      const { data: users, error } = await query;

      if (error) {
        console.error("UnifiedUserSystem.getUser error:", error);
        return { user: null, error };
      }

      // Return first match (should only be one with role filter)
      const user = users && users.length > 0 ? users[0] : null;

      // Auto-migrate: if user found by auth_user_id but id != auth_user_id, update id
      if (user && user.auth_user_id === authUserId && user.id !== authUserId) {
        // This is a legacy account - we'll keep it as-is for now
        // Migration script will handle consolidation
      }

      return { user: user as UnifiedUser | null, error: null };
    } catch (error: any) {
      console.error("UnifiedUserSystem.getUser exception:", error);
      return { user: null, error };
    }
  }

  /**
   * Get user by email and role (for multi-account support)
   * Same email can have multiple accounts with different roles
   * 
   * @param email - User email
   * @param role - Required role
   * @param supabaseAdmin - Admin Supabase client
   * @returns User or null if not found
   */
  static async getUserByEmailAndRole(
    email: string,
    role: UserRole,
    supabaseAdmin: SupabaseClient
  ): Promise<GetUserResult> {
    try {
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("role", role)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          return { user: null, error: null };
        }
        console.error("UnifiedUserSystem.getUserByEmailAndRole error:", error);
        return { user: null, error };
      }

      return { user: user as UnifiedUser | null, error: null };
    } catch (error: any) {
      console.error("UnifiedUserSystem.getUserByEmailAndRole exception:", error);
      return { user: null, error };
    }
  }

  /**
   * Update user record
   * 
   * @param authUserId - Supabase Auth user ID
   * @param role - User role (required for multi-account support)
   * @param updates - Fields to update
   * @param supabaseAdmin - Admin Supabase client
   * @returns Updated user or error
   */
  static async updateUser(
    authUserId: string,
    role: UserRole,
    updates: Partial<UnifiedUser>,
    supabaseAdmin: SupabaseClient
  ): Promise<GetUserResult> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Update by auth_user_id + role (supports multi-account)
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("auth_user_id", authUserId)
        .eq("role", role)
        .select()
        .single();

      if (error) {
        console.error("UnifiedUserSystem.updateUser error:", error);
        return { user: null, error };
      }

      return { user: user as UnifiedUser, error: null };
    } catch (error: any) {
      console.error("UnifiedUserSystem.updateUser exception:", error);
      return { user: null, error };
    }
  }

  /**
   * Check if user exists (any role)
   * 
   * @param authUserId - Supabase Auth user ID
   * @param supabaseAdmin - Admin Supabase client
   * @returns true if user exists with any role
   */
  static async userExists(
    authUserId: string,
    supabaseAdmin: SupabaseClient
  ): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id")
        .or(`id.eq.${authUserId},auth_user_id.eq.${authUserId}`)
        .limit(1);

      if (error && error.code !== "PGRST116") {
        console.error("UnifiedUserSystem.userExists error:", error);
        return false;
      }

      return !!(data && data.length > 0);
    } catch (error: any) {
      console.error("UnifiedUserSystem.userExists exception:", error);
      return false;
    }
  }
}

