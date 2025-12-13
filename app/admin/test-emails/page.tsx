"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Check, X, Mail } from "lucide-react";

type EmailType = 
  | "booking_confirmation"
  | "booking_confirmation_dietitian"
  | "meeting_reminder"
  | "booking_cancelled"
  | "session_request"
  | "meal_plan_sent"
  | "payment_confirmation"
  | "booking_rescheduled";

interface EmailTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export default function TestEmailsPage() {
  const [testEmail, setTestEmail] = useState("");
  const [selectedType, setSelectedType] = useState<EmailType>("booking_confirmation");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailTestResult | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const emailTypes: { value: EmailType; label: string; description: string }[] = [
    {
      value: "booking_confirmation",
      label: "Booking Confirmation (User)",
      description: "Sent to user when booking is confirmed"
    },
    {
      value: "booking_confirmation_dietitian",
      label: "Booking Confirmation (Dietitian)",
      description: "Sent to dietitian when new booking is confirmed"
    },
    {
      value: "meeting_reminder",
      label: "Meeting Reminder",
      description: "Reminder email sent before meeting"
    },
    {
      value: "booking_cancelled",
      label: "Booking Cancelled",
      description: "Sent when a booking is cancelled"
    },
    {
      value: "session_request",
      label: "Session Request",
      description: "Notification for new session request"
    },
    {
      value: "meal_plan_sent",
      label: "Meal Plan Sent",
      description: "Notification when meal plan is sent to user"
    },
    {
      value: "payment_confirmation",
      label: "Payment Confirmation",
      description: "Sent after successful payment"
    },
    {
      value: "booking_rescheduled",
      label: "Booking Rescheduled",
      description: "Sent when booking is rescheduled"
    }
  ];

  const handlePreview = async () => {
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailType: selectedType,
          recipientEmail: testEmail || "preview@example.com",
          preview: true
        })
      });

      const data = await response.json();
      if (data.html) {
        setPreviewHtml(data.html);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setResult({ success: false, error: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailType: selectedType,
          recipientEmail: testEmail
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ success: true, message: `Test email sent successfully to ${testEmail}` });
      } else {
        setResult({ success: false, error: data.error || "Failed to send test email" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || "Failed to send test email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Test Emails</h1>
        <p className="text-white/60 mt-1">Test and verify email templates are working correctly</p>
      </div>

      <div className="bg-[#111] border border-[#1f1f1f] rounded-lg p-6 space-y-6">
        {/* Email Type Selection */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Email Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emailTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setSelectedType(type.value);
                  setResult(null);
                  setPreviewHtml("");
                }}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedType === type.value
                    ? "border-white bg-[#262626] text-white"
                    : "border-[#1f1f1f] bg-[#0b0b0b] text-white/80 hover:border-[#404040]"
                }`}
              >
                <div className="font-medium mb-1">{type.label}</div>
                <div className="text-xs text-white/60">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Email */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Test Recipient Email <span className="text-red-400">*</span>
          </label>
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePreview}
            variant="outline"
            className="bg-transparent border-[#1f1f1f] text-white hover:bg-[#262626]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Preview HTML
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={loading || !testEmail}
            className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              result.success
                ? "bg-green-500/10 border-green-500/50 text-green-400"
                : "bg-red-500/10 border-red-500/50 text-red-400"
            }`}
          >
            {result.success ? (
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="font-medium mb-1">
                {result.success ? "Success" : "Error"}
              </div>
              <div className="text-sm">
                {result.message || result.error}
              </div>
            </div>
          </div>
        )}

        {/* HTML Preview */}
        {previewHtml && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Preview (HTML)
            </label>
            <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-lg p-4 max-h-[600px] overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="bg-white rounded p-4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-3">How to Test</h2>
        <ol className="list-decimal list-inside space-y-2 text-white/80 text-sm">
          <li>Select an email type from the options above</li>
          <li>Enter a test recipient email address</li>
          <li>Click "Preview HTML" to see how the email will look</li>
          <li>Click "Send Test Email" to actually send the email</li>
          <li>Check the recipient's inbox to verify the email was received</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-400 text-sm">
          <strong>Note:</strong> Make sure BREVO_API_KEY is configured in your environment variables for emails to be sent.
        </div>
      </div>
    </div>
  );
}
