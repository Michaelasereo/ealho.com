"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { AddScheduleModal } from "@/components/availability/AddScheduleModal";
import { useRouter, usePathname } from "next/navigation";

// Mock availability schedules
const mockSchedules = [
  {
    id: "1",
    name: "Working Hours",
    isDefault: true,
    timezone: "Africa/Lagos",
    slots: [
      { day: "Mon", start: "9:00 AM", end: "5:00 PM" },
      { day: "Wed", start: "2:00 PM", end: "5:00 PM" },
      { day: "Wed", start: "1:15 AM", end: "10:00 AM" },
    ],
  },
  {
    id: "2",
    name: "Free day",
    isDefault: false,
    timezone: "Africa/Lagos",
    slots: [
      { day: "Mon - Fri", start: "9:00 AM", end: "5:00 PM" },
    ],
  },
];

export default function AvailabilityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [schedules, setSchedules] = useState(mockSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isOverridesPage = pathname === "/dashboard/availability/overrides";

  const handleAddSchedule = (name: string) => {
    // In production, this would create a new schedule via API
    const newSchedule = {
      id: String(schedules.length + 1),
      name,
      isDefault: false,
      timezone: "Africa/Lagos",
      slots: [],
    };
    setSchedules([...schedules, newSchedule]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Availability</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Configure times when you are available for bookings.
            </p>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push("/dashboard/availability")}
                  className={isOverridesPage 
                    ? "bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                    : "bg-[#404040] border-[#404040] text-[#f9fafb] hover:bg-[#525252] px-4 py-2"
                  }
                >
                  My Availability
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/dashboard/availability/overrides")}
                  className={isOverridesPage
                    ? "bg-[#404040] border-[#404040] text-[#f9fafb] hover:bg-[#525252] px-4 py-2"
                    : "bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                  }
                >
                  Date Overrides
                </Button>
              </div>
              {!isOverridesPage && (
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white hover:bg-gray-100 text-black px-4 py-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              )}
            </div>
          </div>

          {/* Availability Schedules */}
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                onClick={() => router.push(`/dashboard/availability/${schedule.id}`)}
                className="w-full border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-medium text-[#f9fafb] text-[14px]">
                        {schedule.name}
                      </h3>
                      {schedule.isDefault && (
                        <span className="text-xs text-[#9ca3af] bg-[#262626] px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {schedule.slots.map((slot, index) => (
                        <div key={index} className="text-sm text-[#d1d5db]">
                          {slot.day}, {slot.start} - {slot.end}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-[#A2A2A2]">
                      {schedule.timezone}
                    </div>
                  </div>

                  <div className="flex items-center ml-6">
                    <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#262626]">
            <p className="text-sm text-[#9ca3af]">
              Temporarily Out-Of-Office?{" "}
              <button className="text-[#f9fafb] hover:underline">
                Add a redirect
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={handleAddSchedule}
      />
    </div>
  );
}
