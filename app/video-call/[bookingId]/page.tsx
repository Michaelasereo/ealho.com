import { redirect } from "next/navigation";
import { createAdminClientServer } from "@/lib/supabase/server";
import { getCurrentUserFromRequest } from "@/lib/auth-helpers";
import { DailyCoVideoCall } from "@/components/video-call/DailyCoVideoCall";

interface VideoCallPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function VideoCallPage({ params }: VideoCallPageProps) {
  const { bookingId } = await params;
  
  try {
    // Get current user
    const currentUser = await getCurrentUserFromRequest();
    if (!currentUser) {
      redirect("/login?redirect=/video-call/" + bookingId);
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
        meeting_link,
        status,
        event_types (
          id,
          title
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Video Call] Booking not found:", bookingError);
      redirect("/dashboard?error=booking_not_found");
    }

    // Verify user has access (either as client or therapist)
    const hasAccess = 
      booking.user_id === currentUser.id ||
      booking.dietitian_id === currentUser.id ||
      currentUser.role === "ADMIN";

    if (!hasAccess) {
      redirect("/dashboard?error=access_denied");
    }

    // Check if booking is confirmed
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      redirect("/dashboard?error=booking_not_confirmed");
    }

    // Check if meeting link exists
    if (!booking.meeting_link) {
      redirect("/dashboard?error=no_meeting_link");
    }

    // Fetch session note ID if this is a therapist booking
    let sessionNoteId: string | null = null;
    const { data: dietitianUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", booking.dietitian_id)
      .single();

    if (dietitianUser?.role === "THERAPIST") {
      const { data: sessionNote } = await supabaseAdmin
        .from("session_notes")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

      sessionNoteId = sessionNote?.id || null;
    }

    return (
      <DailyCoVideoCall
        bookingId={booking.id}
        bookingTitle={booking.title || "Video Session"}
        meetingUrl={booking.meeting_link}
        sessionNoteId={sessionNoteId}
        userRole={currentUser.role}
        userId={currentUser.id}
        therapistId={booking.dietitian_id}
        startTime={booking.start_time}
        endTime={booking.end_time}
      />
    );
  } catch (error) {
    console.error("[Video Call] Error:", error);
    redirect("/dashboard?error=video_call_error");
  }
}