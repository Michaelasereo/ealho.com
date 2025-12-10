"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingForm } from "@/components/booking/booking-form";
import { PaymentModal } from "@/components/booking/payment-modal";
import dayjs from "dayjs";

// Mock event type data - in production, fetch from API
const mockEventType = {
  id: "1",
  title: "Nutrition Consultation",
  description: "One-on-one consultation with a certified dietitian",
  length: 30,
  price: 5000,
};

export default function BookPage() {
  const params = useParams();
  const [step, setStep] = useState<"date" | "form" | "payment">("date");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingData, setBookingData] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleFormSubmit = (data: any) => {
    setBookingData(data);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    // Create booking via API
    try {
      const startTime = dayjs(selectedDate)
        .hour(parseInt(selectedTime.split(":")[0]))
        .minute(parseInt(selectedTime.split(":")[1]))
        .toDate();
      const endTime = dayjs(startTime).add(mockEventType.length, "minute").toDate();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: mockEventType.id,
          startTime,
          endTime,
          ...bookingData,
          paystackRef: reference,
        }),
      });

      if (response.ok) {
        setIsPaymentOpen(false);
        // Redirect to success page
        window.location.href = "/bookings?success=true";
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              Book with {params.dietitian}
            </h1>
            <p className="text-[#6b7280]">Select a time slot for your appointment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {step === "date" && (
              <div>
                <TimeSlotPicker
                  date={selectedDate}
                  duration={mockEventType.length}
                  onSelectTime={handleTimeSelect}
                  selectedTime={selectedTime}
                />
              </div>
            )}

            {step === "form" && (
              <>
                <div>
                  <TimeSlotPicker
                    date={selectedDate}
                    duration={mockEventType.length}
                    onSelectTime={handleTimeSelect}
                    selectedTime={selectedTime}
                  />
                </div>
                <div>
                  <BookingForm
                    eventType={mockEventType}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSubmit={handleFormSubmit}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={mockEventType.price}
        email={bookingData?.email || ""}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
