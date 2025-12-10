import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventTypeId,
      startTime,
      endTime,
      name,
      email,
      phone,
      notes,
      paystackRef,
    } = body;

    // Get event type to find dietitian
    const { data: eventType, error: eventTypeError } = await supabaseAdmin
      .from("event_types")
      .select("*, users(*)")
      .eq("id", eventTypeId)
      .single();

    if (eventTypeError || !eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // Create or get user by email
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          email,
          name,
        })
        .select()
        .single();

      if (userError) {
        return NextResponse.json(
          { error: "Failed to create user", details: userError.message },
          { status: 500 }
        );
      }
      user = newUser;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        title: eventType.title,
        description: notes,
        start_time: startTime,
        end_time: endTime,
        status: "PENDING",
        event_type_id: eventTypeId,
        user_id: user.id,
        dietitian_id: eventType.user_id,
      })
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json(
        { error: "Failed to create booking", details: bookingError.message },
        { status: 500 }
      );
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        amount: eventType.price,
        currency: eventType.currency,
        status: paystackRef ? "SUCCESS" : "PENDING",
        paystack_ref: paystackRef || null,
        booking_id: booking.id,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      // Continue even if payment creation fails - booking is created
    }

    // Fetch booking with relations
    const { data: bookingWithRelations } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        event_types (*),
        payments (*)
      `)
      .eq("id", booking.id)
      .single();

    return NextResponse.json({ booking: bookingWithRelations }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        event_types (*),
        payments (*)
      `)
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error.message },
      { status: 500 }
    );
  }
}
