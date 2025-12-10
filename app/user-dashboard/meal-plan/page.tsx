"use client";

import { useState } from "react";
import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, ShoppingCart, Clock } from "lucide-react";
import { PurchaseMealPlanModal } from "@/components/meal-plan/PurchaseMealPlanModal";

interface MealPlan {
  id: string;
  packageName: string;
  receivedDate: Date;
  pdfUrl: string;
  status: "pending" | "received";
  dieticianName?: string;
  purchasedDate?: Date;
}

interface MealPlanPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

// Mock available meal plan packages - in production, fetch from API
const availablePackages: MealPlanPackage[] = [
  {
    id: "1",
    name: "Weight Loss Plan",
    description: "A comprehensive 4-week meal plan designed to help you achieve your weight loss goals",
    price: 15000,
    currency: "NGN",
  },
  {
    id: "2",
    name: "Muscle Gain Plan",
    description: "High-protein meal plan to support muscle growth and recovery",
    price: 18000,
    currency: "NGN",
  },
  {
    id: "3",
    name: "Diabetes Management Plan",
    description: "Carefully curated meals to help manage blood sugar levels",
    price: 20000,
    currency: "NGN",
  },
  {
    id: "4",
    name: "General Wellness Plan",
    description: "Balanced nutrition plan for overall health and wellness",
    price: 12000,
    currency: "NGN",
  },
];

// Mock data - in production, fetch from API
const mockReceivedMealPlans: MealPlan[] = [
  {
    id: "1",
    packageName: "Weight Loss Plan",
    receivedDate: new Date("2024-12-10"),
    pdfUrl: "/meal-plans/weight-loss-plan.pdf",
    status: "received",
  },
  {
    id: "2",
    packageName: "Muscle Gain Plan",
    receivedDate: new Date("2024-12-05"),
    pdfUrl: "/meal-plans/muscle-gain-plan.pdf",
    status: "received",
  },
];

const mockPendingMealPlans: MealPlan[] = [
  {
    id: "3",
    packageName: "Diabetes Management Plan",
    purchasedDate: new Date("2024-12-15"),
    dieticianName: "Dr. Sarah Johnson",
    status: "pending",
    receivedDate: new Date(),
    pdfUrl: "",
  },
];

// Mock dieticians - in production, fetch from API based on user's bookings
const mockDieticians = [
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

export default function UserMealPlanPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ id: string; name: string; price: number; currency: string } | null>(null);
  const [pendingPlans, setPendingPlans] = useState<MealPlan[]>(mockPendingMealPlans);
  const [receivedPlans, setReceivedPlans] = useState<MealPlan[]>(mockReceivedMealPlans);

  const handlePurchaseClick = (pkg: MealPlanPackage) => {
    setSelectedPackage({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      currency: pkg.currency,
    });
    setIsModalOpen(true);
  };

  const handleCheckout = (data: { dieticianId: string; packageName: string; packageId: string; price: number }) => {
    // In production, this would redirect to checkout/payment page
    // For now, add to pending plans
    const dietician = mockDieticians.find((d) => d.id === data.dieticianId);
    const newPendingPlan: MealPlan = {
      id: String(Date.now()),
      packageName: data.packageName,
      purchasedDate: new Date(),
      dieticianName: dietician?.name || "Unknown",
      status: "pending",
      receivedDate: new Date(),
      pdfUrl: "",
    };
    setPendingPlans((prev) => [...prev, newPendingPlan]);
    console.log("Proceeding to checkout:", data);
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <UserDashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Meal Plans</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Browse available meal plan packages and view your purchased plans.
            </p>
          </div>

          {/* Pending Meal Plans Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#f9fafb] mb-4">Pending Meal Plans</h2>
            {pendingPlans.length > 0 ? (
              <div className="space-y-4">
                {pendingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#f9fafb] mb-1">
                          {plan.packageName}
                        </div>
                        <div className="text-sm text-[#9ca3af] mb-1">
                          {plan.dieticianName && `From: ${plan.dieticianName}`}
                        </div>
                        <div className="text-sm text-[#9ca3af]">
                          {plan.purchasedDate && `Purchased on ${plan.purchasedDate.toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#9ca3af]" />
                        <span className="text-sm text-[#9ca3af]">Pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-[#262626] rounded-lg">
                <Clock className="h-12 w-12 text-[#9ca3af] mx-auto mb-4" />
                <p className="text-sm text-[#9ca3af]">No pending meal plans.</p>
              </div>
            )}
          </div>

          {/* Available Packages Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#f9fafb] mb-4">Available Meal Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#f9fafb] mb-1">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-[#9ca3af] mb-3">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-[#f9fafb]">
                      ₦{pkg.price.toLocaleString()}
                    </div>
                    <Button
                      onClick={() => handlePurchaseClick(pkg)}
                      className="bg-white hover:bg-gray-100 text-black px-4 py-2"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Received Meal Plans Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#f9fafb] mb-4">Received Meal Plans</h2>
            {receivedPlans.length > 0 ? (
              <div className="space-y-4">
                {receivedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#f9fafb] mb-1">
                          {plan.packageName}
                        </div>
                        <div className="text-sm text-[#9ca3af]">
                          Received on {plan.receivedDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => window.open(plan.pdfUrl, '_blank')}
                          variant="outline"
                          className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = plan.pdfUrl;
                            link.download = `${plan.packageName}.pdf`;
                            link.click();
                          }}
                          variant="outline"
                          className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-[#262626] rounded-lg">
                <FileText className="h-12 w-12 text-[#9ca3af] mx-auto mb-4" />
                <p className="text-sm text-[#9ca3af]">No meal plans received yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Purchase Meal Plan Modal */}
      <PurchaseMealPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPackage(null);
        }}
        selectedPackage={selectedPackage}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
