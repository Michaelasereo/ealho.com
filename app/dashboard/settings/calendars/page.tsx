"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MoreVertical, ChevronDown } from "lucide-react";

export default function CalendarsPage() {
  const [addToCalendar, setAddToCalendar] = useState("asereopeyemimichael@gmail.com (Google - asereopeyemimichael@gmail.com)");
  const [conflictCalendars, setConflictCalendars] = useState({
    "asereopeyemimichael@gmail.com": true,
    "Holidays in Nigeria": false,
  });

  const toggleConflictCalendar = (calendar: string) => {
    setConflictCalendars((prev) => ({
      ...prev,
      [calendar]: !prev[calendar as keyof typeof prev],
    }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold text-[#f9fafb] mb-1">Calendars</h1>
            <p className="text-sm text-[#9ca3af]">
              Configure how your event types interact with your calendars.
            </p>
          </div>
          <Button className="bg-white hover:bg-gray-100 text-black px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Calendar
          </Button>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Add to Calendar Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[#f9fafb]">Add to calendar</h2>
          <p className="text-sm text-[#9ca3af]">
            Select where to add events when you're booked.
          </p>
          <div className="relative">
            <select
              value={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#262626] text-[#f9fafb] text-sm rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-0 focus:border-[#404040]"
            >
              <option value="asereopeyemimichael@gmail.com (Google - asereopeyemimichael@gmail.com)">
                asereopeyemimichael@gmail.com (Google - asereopeyemimichael@gmail.com)
              </option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9ca3af] pointer-events-none" />
          </div>
          <p className="text-xs text-[#9ca3af]">
            You can override this setting for individual event types in their advanced options.
          </p>
        </div>

        {/* Check for Conflicts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#f9fafb]">Check for conflicts</h2>
              <p className="text-sm text-[#9ca3af] mt-1">
                Select which calendars you want to check for conflicts to prevent double bookings.
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Calendar Cards */}
          <div className="space-y-3">
            <div className="border border-[#262626] rounded-lg px-4 py-3 bg-transparent hover:bg-[#171717] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#9ca3af]" />
                  <div>
                    <div className="text-sm font-medium text-[#f9fafb]">Google Calendar</div>
                    <div className="text-xs text-[#9ca3af]">asereopeyemimichael@gmail.com</div>
                  </div>
                </div>
                <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#9ca3af]">
            Toggle the calendars you want to check for conflicts to prevent double bookings.
          </p>

          {/* Conflict Calendar Toggles */}
          <div className="space-y-3 pt-2">
            {Object.entries(conflictCalendars).map(([calendar, enabled]) => (
              <div key={calendar} className="flex items-center justify-between">
                <span className="text-sm text-[#D4D4D4]">{calendar}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleConflictCalendar(calendar)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9ca3af]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
