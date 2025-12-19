import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { getCurrentUserFromRequest } from "@/lib/auth-helpers";

/**
 * GET: Fetch session notes based on user role
 * - Therapist: All notes for their clients
 * - Client: All notes for their sessions
 * - Admin: All notes
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClientServer();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'PENDING' or 'COMPLETED'
    const clientId = searchParams.get("clientId"); // For therapist filtering by client

    let query = supabaseAdmin.from("session_notes").select(`
      id,
      booking_id,
      therapist_id,
      client_id,
      client_name,
      session_number,
      session_date,
      session_time,
      therapist_name,
      location,
      patient_complaint,
      personal_history,
      family_history,
      presentation,
      formulation_and_diagnosis,
      treatment_plan,
      assignments,
      status,
      created_at,
      updated_at,
      completed_at,
      bookings (
        id,
        title,
        start_time,
        end_time,
        status as booking_status
      ),
      therapist:users!session_notes_therapist_id_fkey (
        id,
        name,
        email
      ),
      client:users!session_notes_client_id_fkey (
        id,
        name,
        email
      )
    `);

    // Filter based on user role
    if (currentUser.role === "THERAPIST") {
      // Therapists see notes for their clients
      query = query.eq("therapist_id", currentUser.id);
      
      // Optional: filter by specific client
      if (clientId) {
        query = query.eq("client_id", clientId);
      }
    } else if (currentUser.role === "USER") {
      // Clients see their own notes
      query = query.eq("client_id", currentUser.id);
    } else if (currentUser.role === "ADMIN") {
      // Admins see all notes (no filter)
    } else {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Order by session date (most recent first)
    query = query.order("session_date", { ascending: false });

    const { data: notes, error } = await query;

    if (error) {
      console.error("[Session Notes] Error fetching notes:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch session notes",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error: any) {
    console.error("[Session Notes] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

