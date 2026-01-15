"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, X } from "lucide-react";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingTitle?: string;
  isLoading?: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
  isLoading = false,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#171717] border border-[#262626] rounded-lg w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-[#262626]">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#f9fafb] mb-1">
              Cancel booking
            </h2>
            <p className="text-sm text-[#9ca3af]">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#9ca3af] hover:text-[#f9fafb] transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {bookingTitle && (
          <div className="p-6 border-b border-[#262626]">
            <p className="text-sm text-[#d1d5db]">
              <span className="text-[#9ca3af]">Booking:</span> {bookingTitle}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#262626] px-4 py-2 disabled:opacity-50"
          >
            Keep booking
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 disabled:opacity-50"
          >
            {isLoading ? "Canceling..." : "Cancel booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}
