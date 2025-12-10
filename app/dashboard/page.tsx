"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { BookingsList } from "@/components/bookings/BookingsList";

// Mock data - in production, fetch from API
const mockUpcomingBookings = [
  {
    id: "1",
    date: new Date("2024-12-17"),
    startTime: new Date("2024-12-17T02:00:00"),
    endTime: new Date("2024-12-17T02:45:00"),
    title: "1-on-1 with a Licensed Dietician",
    description: "1-on-1 with a Licensed Dietician between Daiyet.com and Michael Opeyemi",
    message: "I just want to understand my diet",
    participants: ["You", "Michael Opeyemi"],
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    date: new Date("2024-12-22"),
    startTime: new Date("2024-12-22T12:00:00"),
    endTime: new Date("2024-12-22T12:30:00"),
    title: "Chat with a Dietician",
    description: "Chat with a Dietician between Official Daiyet App and Opeyemi Michael Asere",
    message: "I am gettitng the hand og this",
    participants: ["You", "Opeyemi Michael Asere"],
    meetingLink: "https://meet.google.com/xyz-uvwx-rst",
  },
];

export default function DashboardPage() {
  // Mock summary data - in production, fetch from API
  const totalSessions = 156;
  const upcomingSessions = 12;
  const totalRevenue = 2340000;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Dashboard</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Overview of your bookings and revenue.
            </p>
          </div>
            
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Sessions Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Total Sessions</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">{totalSessions.toLocaleString()}</div>
            </div>

            {/* Upcoming Sessions Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Upcoming Sessions</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">{upcomingSessions.toLocaleString()}</div>
              </div>

            {/* Total Revenue Card */}
            <div className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent">
              <div className="text-sm text-[#9ca3af] mb-2">Total Revenue</div>
              <div className="text-2xl font-semibold text-[#f9fafb]">₦{totalRevenue.toLocaleString()}</div>
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
