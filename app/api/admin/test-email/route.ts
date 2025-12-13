import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplate } from "@/lib/email/templates";
import { sendBrevoEmail } from "@/lib/email/brevo";

type EmailType = 
  | "booking_confirmation"
  | "booking_confirmation_dietitian"
  | "meeting_reminder"
  | "booking_cancelled"
  | "session_request"
  | "meal_plan_sent"
  | "payment_confirmation"
  | "booking_rescheduled";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailType, recipientEmail, preview } = body;

    if (!emailType || !recipientEmail) {
      return NextResponse.json(
        { error: "emailType and recipientEmail are required" },
        { status: 400 }
      );
    }

    // Generate test data based on email type
    const testData = generateTestData(emailType as EmailType);

    // Get email template
    const isDietitian = emailType === "booking_confirmation_dietitian";
    const templateName = isDietitian ? "booking_confirmation" : emailType;
    
    const { html, text } = getEmailTemplate(
      templateName,
      testData,
      { isDietitian }
    );

    // If preview only, return HTML
    if (preview) {
      return NextResponse.json({ html: html || "" });
    }

    // Send actual email
    const result = await sendBrevoEmail({
      to: recipientEmail,
      subject: getEmailSubject(emailType as EmailType),
      htmlContent: html,
      textContent: text,
      tags: ["test-email", emailType]
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`,
      messageId: result.messageId
    });
  } catch (error: any) {
    console.error("Error in test email endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function generateTestData(emailType: EmailType) {
  const baseData = {
    userName: "Test User",
    eventTitle: "1-on-1 Consultation with Licensed Dietician",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    time: "10:00 AM",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    message: "This is a test email to verify the email template is working correctly.",
    requestType: "CONSULTATION",
    mealPlanType: "Weight Loss Plan",
    amount: "15,000",
    currency: "NGN",
    transactionId: "TXN-TEST-123456",
    rescheduleReason: "Dietitian requested reschedule due to scheduling conflict",
    cancellationReason: "User requested cancellation",
    reminderTime: "24 hours",
    actionLink: "https://daiyet.co/user-dashboard/book-a-call",
    actionRequired: true
  };

  switch (emailType) {
    case "booking_confirmation":
    case "booking_confirmation_dietitian":
      return {
        ...baseData,
        userName: emailType === "booking_confirmation_dietitian" ? "Dr. Test Dietitian" : "Test User"
      };

    case "meeting_reminder":
      return {
        ...baseData,
        reminderTime: "24 hours"
      };

    case "booking_cancelled":
      return {
        ...baseData,
        cancellationReason: "Test cancellation reason"
      };

    case "session_request":
      return {
        ...baseData,
        requestType: "CONSULTATION",
        message: "Your dietitian has sent you a consultation request. Please review and respond."
      };

    case "meal_plan_sent":
      return {
        ...baseData,
        mealPlanType: "Weight Loss Plan",
        message: "Your personalized meal plan has been prepared based on your consultation."
      };

    case "payment_confirmation":
      return {
        ...baseData,
        amount: "15,000",
        currency: "NGN",
        transactionId: "TXN-TEST-123456"
      };

    case "booking_rescheduled":
      return {
        ...baseData,
        rescheduleReason: "Dietitian requested reschedule due to scheduling conflict"
      };

    default:
      return baseData;
  }
}

function getEmailSubject(emailType: EmailType): string {
  const subjects: Record<EmailType, string> = {
    booking_confirmation: "Booking Confirmed - Daiyet",
    booking_confirmation_dietitian: "New Booking Confirmed - Daiyet",
    meeting_reminder: "Meeting Reminder - Daiyet",
    booking_cancelled: "Booking Cancelled - Daiyet",
    session_request: "New Session Request - Daiyet",
    meal_plan_sent: "Meal Plan Ready - Daiyet",
    payment_confirmation: "Payment Confirmed - Daiyet",
    booking_rescheduled: "Booking Rescheduled - Daiyet"
  };

  return subjects[emailType] || "Test Email - Daiyet";
}
