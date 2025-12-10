"use server";

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function generateMeetLink(reference: string) {
  const slug = reference.slice(-8);
  return `https://meet.google.com/${slug}`;
}

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
      const meetLink = generateMeetLink(reference);
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
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
