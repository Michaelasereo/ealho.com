"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Info } from "lucide-react";
import { DateOverrideModal } from "@/components/availability/DateOverrideModal";

// Mock date overrides - in production, fetch from API
const mockOverrides = [
  {
    id: "1",
    date: new Date("2024-12-10"),
    type: "unavailable",
  },
  {
    id: "2",
    date: new Date("2024-12-12"),
    type: "available",
    startTime: "9:00 AM",
    endTime: "5:00 PM",
  },
];

export default function DateOverridesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [overrides, setOverrides] = useState(mockOverrides);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<string | null>(null);
  
  const isOverridesPage = pathname === "/dashboard/availability/overrides";

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this override?")) {
      setOverrides(overrides.filter((override) => override.id !== id));
    }
  };

  const handleAddOverride = () => {
    setEditingOverride(null);
    setIsModalOpen(true);
  };

  const handleEditOverride = (id: string) => {
    setEditingOverride(id);
    setIsModalOpen(true);
  };

  const handleSaveDates = (overrideData: Array<{ date: Date; type: "unavailable" | "available"; slots?: Array<{ start: string; end: string }> }>) => {
    if (editingOverride) {
      // Update existing override
      if (overrideData.length > 0) {
        const override = overrideData[0];
        setOverrides(
          overrides.map((o) =>
            o.id === editingOverride
              ? {
                  ...o,
                  date: override.date,
                  type: override.type,
                  startTime: override.type === "available" && override.slots?.[0] ? override.slots[0].start : undefined,
                  endTime: override.type === "available" && override.slots?.[0] ? override.slots[0].end : undefined,
                }
              : o
          )
        );
      }
    } else {
      // Add new overrides for each selected date
      const newOverrides = overrideData.map((override, index) => ({
        id: String(overrides.length + index + 1),
        date: override.date,
        type: override.type,
        startTime: override.type === "available" && override.slots?.[0] ? override.slots[0].start : undefined,
        endTime: override.type === "available" && override.slots?.[0] ? override.slots[0].end : undefined,
      }));
      setOverrides([...overrides, ...newOverrides]);
    }
    setIsModalOpen(false);
    setEditingOverride(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Availability</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Configure times when you are available for bookings.
            </p>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
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
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold text-[#f9fafb]">Date overrides</h2>
              <Info className="h-4 w-4 text-[#9ca3af]" />
            </div>
            <p className="text-sm text-[#9ca3af] mb-6">
              Add dates when your availability changes from your daily hours.
            </p>
          </div>

          {/* Override Entries */}
          {overrides.length > 0 ? (
            <div className="space-y-4 mb-6">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#f9fafb] mb-1">
                        {formatDate(override.date)}
                      </div>
                      {override.type === "unavailable" ? (
                        <div className="text-sm text-[#9ca3af]">Unavailable</div>
                      ) : (
                        <div className="text-sm text-[#d1d5db]">
                          {override.startTime} - {override.endTime}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditOverride(override.id)}
                        className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(override.id)}
                        className="text-[#D4D4D4] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-6">
              <p className="text-sm text-[#9ca3af]">No date overrides yet.</p>
            </div>
          )}

          {/* Add Override Button */}
          <Button
            onClick={handleAddOverride}
            variant="outline"
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add an override
          </Button>
        </div>
      </main>

      {/* Date Override Modal */}
      <DateOverrideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOverride(null);
        }}
        onSave={handleSaveDates}
        existingDates={
          editingOverride
            ? [overrides.find((o) => o.id === editingOverride)?.date || new Date()]
            : []
        }
      />
    </div>
  );
}
