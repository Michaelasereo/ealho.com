"use client";

import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { BookingsList } from "@/components/bookings/BookingsList";

// Mock data - in production, fetch from API
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
];

export default function UserDashboardPage() {
  // Mock summary data - in production, fetch from API
  const totalSessions = 24;
  const upcomingMeetings = 3;
  const mealPlansPurchased = 2;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <UserDashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Dashboard</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Overview of your sessions and meal plans.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Sessions Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Total Sessions</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">{totalSessions.toLocaleString()}</div>
            </div>

            {/* Upcoming Meetings Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Upcoming Meetings</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">{upcomingMeetings.toLocaleString()}</div>
            </div>

            {/* Meal Plans Purchased Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Meal Plans Purchased</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">{mealPlansPurchased.toLocaleString()}</div>
            </div>
          </div>

          {/* Upcoming Meetings Section */}
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Upcoming Meetings</h2>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              See your upcoming meetings and bookings.
            </p>
          </div>

          {/* Bookings List */}
          <BookingsList bookings={mockUpcomingBookings} type="upcoming" />
        </div>
      </main>
    </div>
  );
}
