/**
 * @deprecated This file is deprecated. Use UnifiedUserSystem from unified-user-system.ts instead.
 * This file is kept for backward compatibility during migration.
 */
import { UnifiedUserSystem, type UserRole } from "./unified-user-system";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface FindUserResult {
  user: any | null;
  source: "auth_user_id" | "id_migrated" | "id_legacy" | null;
  error?: any;
}

/**
 * @deprecated Use UnifiedUserSystem.getUser() instead
 * 
 * Compatibility wrapper that delegates to UnifiedUserSystem
 */
export async function findUserByAuthId(
  authUserId: string,
  role: UserRole | null | undefined,
  supabaseAdmin: SupabaseClient
): Promise<FindUserResult> {
  const result = await UnifiedUserSystem.getUser(authUserId, role, supabaseAdmin);
  
  return {
    user: result.user,
    source: result.user ? "auth_user_id" : null,
    error: result.error,
  };
}

/**
 * @deprecated Use UnifiedUserSystem.getUser() instead
 */
export async function findUserByAuthIdOr(
  authUserId: string,
  role: UserRole | null | undefined,
  supabaseAdmin: SupabaseClient
): Promise<FindUserResult> {
  // Delegate to main function
  return findUserByAuthId(authUserId, role, supabaseAdmin);
}

