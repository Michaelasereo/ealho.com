import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";

/**
 * Admin endpoint to clear all therapists from the database
 * 
 * DELETE /api/admin/clear-therapists
 * 
 * This will delete:
 * - All users with role = 'THERAPIST'
 * - All related data (event_types, bookings, payments, session_notes, session_requests, etc.)
 * - All Supabase Auth users for therapists
 * 
 * WARNING: This is a destructive operation!
 */
export async function DELETE(request: NextRequest) {
  try {
    // In development, allow without auth check
    // In production, you should add: await requireAdminFromRequest(request);
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: "This endpoint is disabled in production" },
        { status: 403 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Get all therapists
    const { data: therapists, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role")
      .eq("role", "THERAPIST");

    if (fetchError) {
      console.error("Error fetching therapists:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch therapists", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!therapists || therapists.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No therapists found in the database",
        deleted: 0,
      });
    }

    console.log(`Found ${therapists.length} therapist(s) to delete`);

    const deletedUsers: any[] = [];
    const errors: any[] = [];

    // Delete each therapist
    for (const therapist of therapists) {
      try {
        // Try to delete from Supabase Auth first (may fail if user doesn't exist in auth)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(therapist.id);
        
        if (authError && !authError.message.includes("User not found")) {
          // Only log non-"not found" errors, but continue to delete from database
          console.warn(`Warning: Could not delete auth user ${therapist.email}:`, authError.message);
        }

        // Always delete from users table (cascade will handle related data)
        // This is the important part - even if auth deletion fails, we still delete the database record
        const { error: dbError } = await supabaseAdmin
          .from("users")
          .delete()
          .eq("id", therapist.id);

        if (dbError) {
          console.error(`Failed to delete user ${therapist.email}:`, dbError);
          errors.push({
            userId: therapist.id,
            email: therapist.email,
            error: dbError.message,
            step: "db_delete",
          });
          continue;
        }

        deletedUsers.push({
          id: therapist.id,
          email: therapist.email,
          name: therapist.name,
        });
      } catch (error: any) {
        console.error(`Error deleting ${therapist.email}:`, error);
        errors.push({
          userId: therapist.id,
          email: therapist.email,
          error: error?.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedUsers.length} therapist(s)`,
      deleted: deletedUsers.length,
      errorCount: errors.length,
      deletedUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in clear-therapists:", error);
    return NextResponse.json(
      { error: "Failed to clear therapists", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

