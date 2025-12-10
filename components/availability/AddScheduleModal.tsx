"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (name: string) => void;
}

export function AddScheduleModal({
  isOpen,
  onClose,
  onContinue,
}: AddScheduleModalProps) {
  const [scheduleName, setScheduleName] = useState("Working Hours");

  if (!isOpen) return null;

  const handleContinue = () => {
    if (scheduleName.trim()) {
      onContinue(scheduleName.trim());
      setScheduleName("Working Hours");
    }
  };

  const handleClose = () => {
    setScheduleName("Working Hours");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#171717] border border-[#262626] rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#f9fafb] mb-6">
          Add a new schedule
        </h2>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#D4D4D4] mb-2">
            Name
          </label>
          <Input
            type="text"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040]"
            placeholder="Working Hours"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleContinue();
              } else if (e.key === "Escape") {
                handleClose();
              }
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#262626] px-4 py-2"
          >
            Close
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-white hover:bg-gray-100 text-black px-4 py-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
