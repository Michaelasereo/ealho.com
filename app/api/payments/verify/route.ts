import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Find payment by Paystack reference
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*, bookings(*)")
      .eq("paystack_ref", reference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from("payments")
      .update({ status: "SUCCESS" })
      .eq("id", payment.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update payment", details: updateError.message },
        { status: 500 }
      );
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "CONFIRMED" })
      .eq("id", payment.booking_id);

    if (bookingUpdateError) {
      console.error("Failed to update booking status:", bookingUpdateError);
      // Continue - payment is updated
    }

    return NextResponse.json({ payment: updatedPayment });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}
