"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { EventTypesList } from "@/components/event-types/EventTypesList";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock event types - in production, fetch from API
const mockEventTypes = [
  {
    id: "1",
    title: "1-on-1 with a Licensed Dietician",
    slug: "chat-with-a-dietician",
    description: "This discovery call is your first step toward sustainable health. Book a personalized nutrition consultation with our certified dietitian. Discuss your health goals, dietary restrictions, and receive a customized meal plan tailored to your lifestyle and preferences.",
    duration: 45,
    price: 15000,
    currency: "₦",
    guests: 1,
    isActive: true,
    isHidden: false,
    dietitianName: "dt-oluwaseun",
  },
  {
    id: "2",
    title: "Secret Meeting",
    slug: "secret",
    description: "",
    duration: 15,
    price: 5000,
    currency: "₦",
    guests: 1,
    isActive: false,
    isHidden: true,
    dietitianName: "dt-oluwaseun",
  },
  {
    id: "3",
    title: "30 Min Meeting",
    slug: "30-min",
    description: "",
    duration: 30,
    price: 10000,
    currency: "₦",
    guests: 1,
    isActive: false,
    isHidden: true,
    dietitianName: "dt-oluwaseun",
  },
  {
    id: "4",
    title: "15 Min Meeting",
    slug: "15-min",
    description: "",
    duration: 15,
    price: 5000,
    currency: "₦",
    guests: 1,
    isActive: false,
    isHidden: true,
    dietitianName: "dt-oluwaseun",
  },
];

export default function EventTypesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEventTypes = mockEventTypes.filter((eventType) =>
    eventType.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eventType.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Event Types</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Create events to share for people to book on your calendar.
            </p>
            
            {/* Search Bar and New Button */}
            <div className="flex items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A2A2A2]" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-[#262626] text-[#A2A2A2] placeholder:text-[#A2A2A2] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#262626]"
                />
              </div>
              <Button className="bg-white hover:bg-gray-100 text-black px-4 py-2">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>

          {/* Event Types List */}
          <EventTypesList eventTypes={filteredEventTypes} />
        </div>
      </main>
    </div>
  );
}
