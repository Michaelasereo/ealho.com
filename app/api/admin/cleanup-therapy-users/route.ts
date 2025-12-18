import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { requireAdminFromRequest } from "@/lib/auth-helpers";

/**
 * Admin endpoint to clean up users created from therapy/therapist enrollment flow
 * that have USER role instead of THERAPIST role
 * 
 * GET: List users that need cleanup
 * DELETE: Delete specified users (requires user IDs in body)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminFromRequest(request);

    const supabaseAdmin = createAdminClientServer();

    // Find users with signup_source="therapy" and role="USER"
    // These are users who started therapist enrollment but didn't complete it
    const { data: therapyUsers, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, signup_source, created_at, account_status")
      .eq("role", "USER")
      .eq("signup_source", "therapy")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching therapy users:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch users", details: fetchError.message },
        { status: 500 }
      );
    }

    // Also check for users who might have come from therapist-enrollment
    // (These won't have signup_source="therapy" but might be in metadata)
    // For now, we'll focus on signup_source="therapy" users

    return NextResponse.json({
      success: true,
      count: therapyUsers?.length || 0,
      users: therapyUsers || [],
      message: `Found ${therapyUsers?.length || 0} users with signup_source="therapy" and role="USER"`,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Admin")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    console.error("Error in cleanup-therapy-users GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminFromRequest(request);

    const body = await request.json();
    const { userIds, confirm } = body;

    if (!confirm || confirm !== "DELETE_THERAPY_USERS") {
      return NextResponse.json(
        { error: "Confirmation required. Set confirm='DELETE_THERAPY_USERS'" },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // First, verify these users are actually therapy users with USER role
    const { data: usersToDelete, error: verifyError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, signup_source")
      .in("id", userIds)
      .eq("role", "USER")
      .eq("signup_source", "therapy");

    if (verifyError) {
      console.error("Error verifying users:", verifyError);
      return NextResponse.json(
        { error: "Failed to verify users", details: verifyError.message },
        { status: 500 }
      );
    }

    if (usersToDelete?.length !== userIds.length) {
      return NextResponse.json(
        { 
          error: "Some users don't match criteria (role=USER, signup_source=therapy)",
          requested: userIds.length,
          found: usersToDelete?.length || 0,
        },
        { status: 400 }
      );
    }

    const deletedUsers: any[] = [];
    const errors: any[] = [];

    // Delete each user
    for (const user of usersToDelete) {
      try {
        // Delete from auth first
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (authDeleteError) {
          console.error(`Failed to delete auth user ${user.id}:`, authDeleteError);
          errors.push({
            userId: user.id,
            email: user.email,
            error: authDeleteError.message,
            step: "auth_delete",
          });
          continue;
        }

        // Delete from users table
        const { error: dbDeleteError } = await supabaseAdmin
          .from("users")
          .delete()
          .eq("id", user.id);

        if (dbDeleteError) {
          console.error(`Failed to delete user ${user.id} from database:`, dbDeleteError);
          errors.push({
            userId: user.id,
            email: user.email,
            error: dbDeleteError.message,
            step: "db_delete",
          });
          continue;
        }

        deletedUsers.push({
          id: user.id,
          email: user.email,
          name: user.name,
        });
      } catch (userError: any) {
        console.error(`Error deleting user ${user.id}:`, userError);
        errors.push({
          userId: user.id,
          email: user.email,
          error: userError?.message || "Unknown error",
        });
      }
    }

    // Log the cleanup action
    try {
      await supabaseAdmin.from("auth_audit_log").insert({
        user_id: null, // Admin action
        action: "admin_cleanup_therapy_users",
        provider: "admin",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        user_agent: request.headers.get("user-agent"),
        success: deletedUsers.length > 0,
        metadata: {
          deleted_count: deletedUsers.length,
          error_count: errors.length,
          deleted_users: deletedUsers.map(u => ({ id: u.id, email: u.email })),
          errors: errors,
        },
      });
    } catch (auditError) {
      console.warn("Failed to log cleanup action (non-critical):", auditError);
    }

    return NextResponse.json({
      success: true,
      deleted: deletedUsers.length,
      errors: errors.length,
      deletedUsers,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully deleted ${deletedUsers.length} user(s). ${errors.length > 0 ? `${errors.length} error(s) occurred.` : ""}`,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Admin")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    console.error("Error in cleanup-therapy-users DELETE:", error);
    return NextResponse.json(
      { error: "Failed to delete users", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

