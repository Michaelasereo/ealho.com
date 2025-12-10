"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Bookmark, ChevronDown, Clock, Pencil, Trash2 } from "lucide-react";
import { OutOfOfficeModal } from "@/components/settings/OutOfOfficeModal";

interface OOOEntry {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  notes: string;
  forwardToTeam: boolean;
}

export default function OutOfOfficePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oooEntries, setOooEntries] = useState<OOOEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const handleCreateOOO = (data: {
    startDate: Date;
    endDate: Date;
    reason: string;
    notes: string;
    forwardToTeam: boolean;
  }) => {
    const newEntry: OOOEntry = {
      id: String(Date.now()),
      ...data,
    };
    setOooEntries([...oooEntries, newEntry]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this out-of-office entry?")) {
      setOooEntries(oooEntries.filter((entry) => entry.id !== id));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold text-[#f9fafb] mb-1">Out of office</h1>
            <p className="text-sm text-[#9ca3af]">
              Let your bookers know when you're OOO.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-black px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A2A2A2]" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#A2A2A2] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040] w-64"
            />
          </div>
          <Button
            variant="outline"
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
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

      {/* OOO Entries List or Empty State */}
      {oooEntries.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-[#f9fafb]">
            Out of office ({oooEntries.length})
          </h2>
          {oooEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-[#9ca3af]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#f9fafb] mb-1">
                      {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                    </div>
                    <div className="text-sm text-[#9ca3af]">
                      {entry.forwardToTeam ? "Forwarding enabled" : "No forwarding"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingEntry(entry.id);
                      setIsModalOpen(true);
                    }}
                    className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#262626] flex items-center justify-center">
                <Clock className="h-12 w-12 text-[#9ca3af]" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-[#f9fafb] mb-2">Create an OOO</h2>
            <p className="text-sm text-[#9ca3af] mb-6">
              Communicate to your bookers when you're not available to take bookings. They can still book you upon your return or you can forward them to a team member.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-black px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Out of Office Modal */}
      <OutOfOfficeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onCreate={handleCreateOOO}
      />
    </div>
  );
}
