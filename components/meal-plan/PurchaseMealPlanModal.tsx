"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { formatDietitianName } from "@/lib/utils/dietitian-name";

interface Dietician {
  id: string;
  name: string;
  email: string;
}

interface PurchaseMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: { id: string; name: string; price: number; currency: string } | null;
  onCheckout: (data: { dieticianId: string; packageName: string; packageId: string; price: number }) => void;
}

// Mock dieticians the user has seen - in production, fetch from API based on user's bookings
const mockDieticians: Dietician[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "michael@example.com",
  },
  {
    id: "3",
    name: "Dr. Emily Davis",
    email: "emily@example.com",
  },
];

export function PurchaseMealPlanModal({ 
  isOpen, 
  onClose, 
  selectedPackage,
  onCheckout 
}: PurchaseMealPlanModalProps) {
  const [selectedDietician, setSelectedDietician] = useState<string>("");

  useEffect(() => {
    if (selectedPackage && isOpen) {
      // Reset dietician selection when package changes
      setSelectedDietician("");
    }
  }, [selectedPackage, isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (selectedDietician && selectedPackage) {
      onCheckout({
        dieticianId: selectedDietician,
        packageName: selectedPackage.name,
        packageId: selectedPackage.id,
        price: selectedPackage.price,
      });
      setSelectedDietician("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#171717] border border-[#262626] rounded-lg w-full max-w-2xl p-6 shadow-lg">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#f9fafb]">Purchase Meal Plan</h2>
          <button
            onClick={onClose}
            className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 mb-6">
          {/* Selected Package (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#D4D4D4]">
              Meal Plan Package
            </label>
            <div className="bg-[#0a0a0a] border border-[#262626] text-[#f9fafb] text-sm rounded px-3 py-2">
              {selectedPackage ? selectedPackage.name : "No package selected"}
            </div>
            {selectedPackage && (
              <div className="text-sm text-[#9ca3af] mt-1">
                Price: ₦{selectedPackage.price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Select Dietician */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#D4D4D4]">
              Select Dietician
            </label>
            <div className="relative">
              <select
                value={selectedDietician}
                onChange={(e) => setSelectedDietician(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] text-[#f9fafb] text-sm rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-0 focus:border-[#404040]"
              >
                <option value="">Select a dietician...</option>
                {mockDieticians.map((dietician) => (
                  <option key={dietician.id} value={dietician.id}>
                    {formatDietitianName(dietician.name)} ({dietician.email})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9ca3af] pointer-events-none" />
            </div>
            <p className="text-xs text-[#9ca3af] mt-1">
              Only dieticians you've had sessions with are shown
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#262626] px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={!selectedDietician || !selectedPackage}
            className="bg-white hover:bg-gray-100 text-black px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
