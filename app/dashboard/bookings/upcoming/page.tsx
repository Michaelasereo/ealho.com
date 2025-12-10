"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { BookingsList } from "@/components/bookings/BookingsList";
import { Button } from "@/components/ui/button";
import { Filter, Bookmark, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// Mock bookings - in production, fetch from API
const mockBookings = [
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

export default function UpcomingBookingsPage() {
  const [bookings] = useState(mockBookings);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalBookings = bookings.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBookings = bookings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalBookings / rowsPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Bookings</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              See upcoming and past events booked through your event type links.
            </p>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline"
                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline"
                  className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                >
                  Saved filters
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <BookingsList bookings={paginatedBookings} type="upcoming" />

          {/* Pagination */}
          {totalBookings > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#262626]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9ca3af]">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#171717] border border-[#262626] text-[#f9fafb] text-sm rounded px-2 py-1 focus:outline-none focus:ring-0"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#9ca3af]">
                  {startIndex + 1}-{Math.min(endIndex, totalBookings)} of {totalBookings}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
