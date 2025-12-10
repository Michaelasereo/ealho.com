"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Copy, 
  Info,
  ChevronDown,
  ArrowLeft
} from "lucide-react";

// Mock data - in production, fetch from API based on id
const mockSchedule = {
  id: "1",
  name: "Extra working",
  isDefault: false,
  timezone: "Africa/Lagos",
  days: {
    Sunday: { enabled: false, slots: [] },
    Monday: { enabled: true, slots: [{ start: "9:00am", end: "5:00pm" }] },
    Tuesday: { enabled: true, slots: [{ start: "9:00am", end: "5:00pm" }] },
    Wednesday: { enabled: true, slots: [{ start: "9:00am", end: "5:00pm" }] },
    Thursday: { enabled: true, slots: [{ start: "9:00am", end: "5:00pm" }] },
    Friday: { enabled: true, slots: [{ start: "9:00am", end: "5:00pm" }] },
    Saturday: { enabled: false, slots: [] },
  },
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState(mockSchedule);
  const [isEditingName, setIsEditingName] = useState(false);
  const [scheduleName, setScheduleName] = useState(schedule.name);

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const dayData = prev.days[day as keyof typeof prev.days];
      const isCurrentlyEnabled = dayData.enabled;
      
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day as keyof typeof prev.days],
            enabled: !isCurrentlyEnabled,
            // If toggling on and no slots exist, add a default slot
            // If toggling off, keep slots but they won't be visible
            slots: !isCurrentlyEnabled && dayData.slots.length === 0
              ? [{ start: "9:00am", end: "5:00pm" }]
              : dayData.slots,
          },
        },
      };
    });
  };

  const addTimeSlot = (day: string) => {
    setSchedule((prev) => {
      const currentSlots = prev.days[day as keyof typeof prev.days].slots;
      const lastSlot = currentSlots[currentSlots.length - 1];
      // If there's a last slot, start the new one where it ended, otherwise default
      const newStart = lastSlot ? lastSlot.end : "9:00am";
      // Calculate end time (add 1 hour to start, or default to 5:00pm)
      const newEnd = lastSlot ? lastSlot.end : "5:00pm";
      
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day as keyof typeof prev.days],
            slots: [
              ...currentSlots,
              { start: newStart, end: newEnd },
            ],
          },
        },
      };
    });
  };

  const copyTimeSlot = (day: string, slotIndex: number) => {
    const slot = schedule.days[day as keyof typeof schedule.days].slots[slotIndex];
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day as keyof typeof prev.days],
          slots: [...prev.days[day as keyof typeof prev.days].slots, { ...slot }],
        },
      },
    }));
  };

  const deleteTimeSlot = (day: string, slotIndex: number) => {
    setSchedule((prev) => {
      const newSlots = [...prev.days[day as keyof typeof prev.days].slots];
      newSlots.splice(slotIndex, 1);
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day as keyof typeof prev.days],
            slots: newSlots,
          },
        },
      };
    });
  };

  const updateTimeSlot = (day: string, slotIndex: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => {
      const newSlots = [...prev.days[day as keyof typeof prev.days].slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day as keyof typeof prev.days],
            slots: newSlots,
          },
        },
      };
    });
  };

  const getSummary = () => {
    const enabledDays = daysOfWeek.filter(
      (day) => schedule.days[day as keyof typeof schedule.days].enabled
    );
    if (enabledDays.length === 0) return "No days selected";
    if (enabledDays.length === 5 && enabledDays.includes("Monday") && enabledDays.includes("Friday") && !enabledDays.includes("Sunday") && !enabledDays.includes("Saturday")) {
      return "Mon - Fri, 9:00 AM - 5:00 PM";
    }
    return `${enabledDays.map((d) => d.slice(0, 3)).join(", ")}, 9:00 AM - 5:00 PM`;
  };

  const handleSave = () => {
    // In production, save to API
    console.log("Saving schedule:", schedule);
    router.push("/dashboard/availability");
  };

  const handleDelete = () => {
    // In production, delete via API
    if (confirm("Are you sure you want to delete this schedule?")) {
      router.push("/dashboard/availability");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/dashboard/availability")}
              className="mb-4 text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isEditingName ? (
                  <Input
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    onBlur={() => {
                      setIsEditingName(false);
                      setSchedule((prev) => ({ ...prev, name: scheduleName }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingName(false);
                        setSchedule((prev) => ({ ...prev, name: scheduleName }));
                      }
                    }}
                    className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] text-lg font-semibold px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <>
                    <h1 className="text-lg font-semibold text-[#f9fafb]">
                      {schedule.name}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[#9ca3af] hover:text-[#f9fafb]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#D4D4D4]">Set as Default</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.isDefault}
                      onChange={(e) =>
                        setSchedule((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9ca3af]"></div>
                  </label>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-[#D4D4D4] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <Button
                  onClick={handleSave}
                  className="bg-white hover:bg-gray-100 text-black px-4 py-2"
                >
                  Save
                </Button>
              </div>
            </div>
            <p className="text-sm text-[#9ca3af]">{getSummary()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Days Configuration */}
            <div className="lg:col-span-2 space-y-4">
              {daysOfWeek.map((day) => {
                const dayData = schedule.days[day as keyof typeof schedule.days];
                return (
                  <div
                    key={day}
                    className="border border-[#262626] rounded-lg p-4 bg-transparent"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayData.enabled}
                          onChange={() => toggleDay(day)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9ca3af]"></div>
                      </label>
                      <span className="text-sm font-medium text-[#f9fafb] min-w-[80px]">
                        {day}
                      </span>
                      
                      {dayData.enabled && dayData.slots.length > 0 && (
                        <>
                          {/* First time slot on the same line */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={dayData.slots[0].start}
                              onChange={(e) =>
                                updateTimeSlot(day, 0, "start", e.target.value)
                              }
                              className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] text-sm w-24"
                            />
                            <span className="text-[#9ca3af]">-</span>
                            <Input
                              type="text"
                              value={dayData.slots[0].end}
                              onChange={(e) =>
                                updateTimeSlot(day, 0, "end", e.target.value)
                              }
                              className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] text-sm w-24"
                            />
                            <button
                              onClick={() => addTimeSlot(day)}
                              className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => copyTimeSlot(day, 0)}
                              className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Additional time slots below on separate lines - aligned with first slot */}
                    {dayData.enabled && dayData.slots.length > 1 && (
                      <div className="mt-2 space-y-2">
                        {dayData.slots.slice(1).map((slot, slotIndex) => (
                          <div key={slotIndex + 1} className="flex items-center gap-2 ml-[148px]">
                            <Input
                              type="text"
                              value={slot.start}
                              onChange={(e) =>
                                updateTimeSlot(day, slotIndex + 1, "start", e.target.value)
                              }
                              className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] text-sm w-24"
                            />
                            <span className="text-[#9ca3af]">-</span>
                            <Input
                              type="text"
                              value={slot.end}
                              onChange={(e) =>
                                updateTimeSlot(day, slotIndex + 1, "end", e.target.value)
                              }
                              className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] text-sm w-24"
                            />
                            <button
                              onClick={() => deleteTimeSlot(day, slotIndex + 1)}
                              className="text-[#D4D4D4] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Timezone */}
              <div className="border border-[#262626] rounded-lg p-4 bg-transparent">
                <label className="block text-sm font-medium text-[#D4D4D4] mb-2">
                  Timezone
                </label>
                <div className="relative">
                  <select
                    value={schedule.timezone}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-[#f9fafb] text-sm rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-0 focus:border-[#404040]"
                  >
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9ca3af] pointer-events-none" />
                </div>
              </div>

              {/* Troubleshooter */}
              <div className="border border-[#262626] rounded-lg p-4 bg-[#171717]">
                <h3 className="text-sm font-medium text-[#f9fafb] mb-2">
                  Something doesn't look right?
                </h3>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#262626]"
                >
                  Launch troubleshooter
                </Button>
              </div>
            </div>
          </div>

          {/* Date Overrides Section */}
          <div className="mt-8 pt-6 border-t border-[#262626]">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-[#f9fafb]">Date overrides</h2>
              <Info className="h-4 w-4 text-[#9ca3af]" />
            </div>
            <p className="text-sm text-[#9ca3af] mb-4">
              Add dates when your availability changes from your daily hours.
            </p>
            <Button
              variant="outline"
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add an override
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
