"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { CheckCircle, Clock, XCircle } from "lucide-react";

// Mock bookings - in production, fetch from API
const mockBookings = [
  {
    id: "1",
    title: "Nutrition Consultation",
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 86400000 + 30 * 60000),
    status: "CONFIRMED",
    eventType: {
      title: "Nutrition Consultation",
    },
  },
  {
    id: "2",
    title: "Meal Planning Session",
    startTime: new Date(Date.now() + 172800000),
    endTime: new Date(Date.now() + 172800000 + 60 * 60000),
    status: "PENDING",
    eventType: {
      title: "Meal Planning Session",
    },
  },
];

const statusConfig = {
  CONFIRMED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

function BookingsContent() {
  const searchParams = useSearchParams();
  const [bookings] = useState(mockBookings);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      // Show success message
      alert("Booking confirmed successfully!");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#111827] mb-8">My Bookings</h1>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6b7280]">No bookings yet</p>
                <Button className="mt-4" asChild>
                  <a href="/">Book an Appointment</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || Clock;
                const statusColor = statusConfig[booking.status as keyof typeof statusConfig]?.color || "text-gray-600";
                const statusBg = statusConfig[booking.status as keyof typeof statusConfig]?.bg || "bg-gray-100";

                return (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{booking.eventType.title}</CardTitle>
                          <CardDescription>
                            {dayjs(booking.startTime).format("dddd, MMMM D, YYYY")} at{" "}
                            {dayjs(booking.startTime).format("h:mm A")} -{" "}
                            {dayjs(booking.endTime).format("h:mm A")}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBg} ${statusColor}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {booking.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {booking.status === "PENDING" && (
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
