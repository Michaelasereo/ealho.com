import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { getCurrentUserFromRequest } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const supabaseAdmin = createAdminClientServer();

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this booking (either as user or dietitian)
    if (booking.user_id !== currentUser.id && booking.dietitian_id !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Cancel a booking
 * Allows users or therapists to cancel their bookings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { status } = body;

    // Only allow canceling (setting status to CANCELLED)
    if (status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Invalid status", details: "Only cancellation (CANCELLED) is allowed via this endpoint" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Fetch the booking to verify ownership
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, dietitian_id, status, start_time")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this booking (either as user or therapist)
    const isUser = booking.user_id === currentUser.id;
    const isTherapist = booking.dietitian_id === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN" || currentUser.is_admin;

    if (!isUser && !isTherapist && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden", details: "You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    // Prevent canceling already completed or canceled bookings
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking already canceled", details: "This booking has already been canceled" },
        { status: 400 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel completed booking", details: "Completed bookings cannot be canceled" },
        { status: 400 }
      );
    }

    // Update booking status to CANCELLED
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[Bookings API] Error canceling booking:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel booking", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking canceled successfully",
    });
  } catch (error: any) {
    console.error("Error canceling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking", details: error.message },
      { status: 500 }
    );
  }
}
