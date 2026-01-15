/**
 * Compatibility wrapper for findUserByAuthId
 * This allows gradual migration to UnifiedUserSystem
 * 
 * @deprecated Use UnifiedUserSystem.getUser() instead
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

