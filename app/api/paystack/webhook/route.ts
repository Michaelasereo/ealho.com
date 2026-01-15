"use server";

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { createDailyRoom } from "@/lib/daily-co";
import { emailQueue } from "@/lib/email/queue";
import dayjs from "dayjs";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;


export async function POST(request: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  const computed = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== computed) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;
  const data = payload.data || {};
  const reference = data.reference;

  if (event === "charge.success" && reference) {
    // Update payment to success
    const { data: payment, error: paymentErr } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("paystack_ref", reference)
      .single();

    if (!payment || paymentErr) {
      return NextResponse.json({ message: "Payment not found" }, { status: 200 });
    }

    const { error: updatePayErr } = await supabaseAdmin
      .from("payments")
      .update({ status: "SUCCESS" })
      .eq("id", payment.id);

    if (updatePayErr) {
      console.error("Failed to update payment:", updatePayErr);
    }

    // Confirm booking and add Meet link
    if (payment.booking_id) {
      // Get booking details
      const { data: booking, error: bookingFetchErr } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", payment.booking_id)
        .single();

      if (booking && !bookingFetchErr) {
        // Get dietitian and patient info separately (for email notifications)
        const { data: dietitian } = await supabaseAdmin
          .from("users")
          .select("email, name")
          .eq("id", booking.dietitian_id)
          .single();

        const { data: patient } = await supabaseAdmin
          .from("users")
          .select("email, name")
          .eq("id", booking.user_id)
          .single();

        let meetLink = "";

        // Create Daily.co room for the booking
        try {
          const bookingEndTime = new Date(booking.end_time);
          const expirationTime = Math.floor(bookingEndTime.getTime() / 1000) + 24 * 60 * 60; // 24 hours after booking ends
          
          const room = await createDailyRoom({
            name: `booking-${booking.id.substring(0, 8)}`,
            privacy: "private",
            properties: {
              exp: expirationTime,
              enable_chat: true,
              enable_screenshare: true,
              max_participants: 10,
            },
          });
          
          meetLink = room.url;
        } catch (error) {
          console.error("Failed to create Daily.co room:", error);
          // Return error - no fallback for Daily.co
          console.error("Booking confirmed but video room creation failed:", error);
        }

        const { error: bookingErr } = await supabaseAdmin
          .from("bookings")
          .update({
            status: "CONFIRMED",
            meeting_link: meetLink,
          })
          .eq("id", payment.booking_id);

        if (bookingErr) {
          console.error("Failed to update booking:", bookingErr);
        }

        // Send booking confirmation emails
        if (patient?.email) {
          await emailQueue.enqueue({
            to: patient.email,
            subject: "Booking Confirmed - Your Consultation is Scheduled",
            template: "booking_confirmation",
            data: {
              userName: patient.name || "User",
              eventTitle: booking.title || "Consultation",
              date: dayjs(booking.start_time).format("MMMM D, YYYY"),
              time: dayjs(booking.start_time).format("h:mm A"),
              meetingLink: meetLink,
            },
          });
        }

        if (dietitian?.email) {
          await emailQueue.enqueue({
            to: dietitian.email,
            subject: "New Booking Confirmed",
            template: "booking_confirmation",
            data: {
              userName: dietitian.name || "Dietitian",
              eventTitle: booking.title || "Consultation",
              date: dayjs(booking.start_time).format("MMMM D, YYYY"),
              time: dayjs(booking.start_time).format("h:mm A"),
              meetingLink: meetLink,
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
