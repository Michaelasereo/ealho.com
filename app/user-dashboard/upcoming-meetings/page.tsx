"use client";

import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { BookingsList } from "@/components/bookings/BookingsList";

// Mock data - in production, fetch from API (roles reversed - user sees their own bookings)
const mockUpcomingBookings = [
  {
    id: "1",
    date: new Date("2024-12-17"),
    startTime: new Date("2024-12-17T02:00:00"),
    endTime: new Date("2024-12-17T02:45:00"),
    title: "1-on-1 with a Licensed Dietician",
    description: "1-on-1 with a Licensed Dietician between You and Dr. Sarah Johnson",
    message: "I just want to understand my diet",
    participants: ["You", "Dr. Sarah Johnson"],
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    date: new Date("2024-12-22"),
    startTime: new Date("2024-12-22T12:00:00"),
    endTime: new Date("2024-12-22T12:30:00"),
    title: "Chat with a Dietician",
    description: "Chat with a Dietician between You and Dr. Michael Chen",
    message: "I am getting the hang of this",
    participants: ["You", "Dr. Michael Chen"],
    meetingLink: "https://meet.google.com/xyz-uvwx-rst",
  },
  {
    id: "3",
    date: new Date("2024-12-25"),
    startTime: new Date("2024-12-25T10:00:00"),
    endTime: new Date("2024-12-25T10:30:00"),
    title: "Nutrition Consultation",
    description: "Nutrition Consultation between You and Dr. Emily Davis",
    message: "Follow-up on meal plan progress",
    participants: ["You", "Dr. Emily Davis"],
    meetingLink: "https://meet.google.com/mno-pqrs-tuv",
  },
];

export default function UpcomingMeetingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <UserDashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Upcoming Meetings</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              View and manage your upcoming meetings with dieticians.
            </p>
          </div>

          {/* Bookings List */}
          <BookingsList bookings={mockUpcomingBookings} type="upcoming" />
        </div>
      </main>
    </div>
  );
}
