import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";

/**
 * Create a pending session note when a booking is created
 * This is called automatically from the booking creation API
 * Only creates notes for therapist bookings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        user_id,
        dietitian_id,
        start_time,
        end_time,
        title,
        users!bookings_user_id_fkey (
          id,
          name,
          email
        ),
        dietitians:users!bookings_dietitian_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Session Notes] Booking not found:", bookingError);
      return NextResponse.json(
        { error: "Booking not found", details: bookingError?.message },
        { status: 404 }
      );
    }

    // Check if the dietitian is actually a therapist
    const therapist = booking.dietitians as any;
    if (!therapist || therapist.role !== "THERAPIST") {
      // Not a therapist booking, skip note creation
      return NextResponse.json(
        { message: "Not a therapist booking, skipping note creation" },
        { status: 200 }
      );
    }

    // Check if note already exists for this booking
    const { data: existingNote } = await supabaseAdmin
      .from("session_notes")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existingNote) {
      return NextResponse.json(
        { message: "Note already exists for this booking", noteId: existingNote.id },
        { status: 200 }
      );
    }

    // Calculate session number
    // Count existing COMPLETED notes for this client+therapist combination
    const { count: completedNotesCount } = await supabaseAdmin
      .from("session_notes")
      .select("*", { count: "exact", head: true })
      .eq("client_id", booking.user_id)
      .eq("therapist_id", booking.dietitian_id)
      .eq("status", "COMPLETED");

    const sessionNumber = (completedNotesCount || 0) + 1;

    // Get client and therapist names
    const client = booking.users as any;
    const clientName = client?.name || client?.email || "Client";
    const therapistName = therapist?.name || therapist?.email || "Therapist";

    // Format session date and time
    const sessionDate = new Date(booking.start_time);
    const sessionTime = sessionDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Create pending session note
    const { data: sessionNote, error: noteError } = await supabaseAdmin
      .from("session_notes")
      .insert({
        booking_id: bookingId,
        therapist_id: booking.dietitian_id,
        client_id: booking.user_id,
        client_name: clientName,
        session_number: sessionNumber,
        session_date: booking.start_time,
        session_time: sessionTime,
        therapist_name: therapistName,
        location: "Virtual",
        status: "PENDING",
      })
      .select()
      .single();

    if (noteError) {
      console.error("[Session Notes] Error creating pending note:", noteError);
      return NextResponse.json(
        {
          error: "Failed to create session note",
          details: noteError.message,
        },
        { status: 500 }
      );
    }

    console.log("[Session Notes] Pending note created:", {
      noteId: sessionNote.id,
      bookingId,
      clientId: booking.user_id,
      therapistId: booking.dietitian_id,
      sessionNumber,
    });

    return NextResponse.json({
      success: true,
      note: sessionNote,
    });
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

