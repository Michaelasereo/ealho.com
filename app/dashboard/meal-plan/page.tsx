"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Eye } from "lucide-react";
import { SendMealPlanModal } from "@/components/meal-plan/SendMealPlanModal";

// Mock users - in production, fetch from API
const mockUsers = [
  {
    id: "1",
    name: "Michael Opeyemi",
    email: "michael@example.com",
  },
  {
    id: "2",
    name: "Opeyemi Michael Asere",
    email: "opeyemi@example.com",
  },
];

interface MealPlan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageName: string;
  status: "pending" | "sent";
  pdfUrl?: string;
  uploadedAt?: Date;
}

// Mock data - in production, fetch from API
const mockPendingMealPlans: MealPlan[] = [
  {
    id: "1",
    userId: "1",
    userName: "Michael Opeyemi",
    userEmail: "michael@example.com",
    packageName: "Weight Loss Plan",
    status: "pending",
  },
  {
    id: "2",
    userId: "2",
    userName: "Opeyemi Michael Asere",
    userEmail: "opeyemi@example.com",
    packageName: "Muscle Gain Plan",
    status: "pending",
  },
];

const mockSentMealPlans: MealPlan[] = [
  {
    id: "3",
    userId: "3",
    userName: "John Doe",
    userEmail: "john@example.com",
    packageName: "Diabetes Management Plan",
    status: "sent",
    pdfUrl: "/meal-plans/john-doe-diabetes-plan.pdf",
    uploadedAt: new Date("2024-12-10"),
  },
];

export default function MealPlanPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingPlans, setPendingPlans] = useState<MealPlan[]>(mockPendingMealPlans);
  const [sentPlans, setSentPlans] = useState<MealPlan[]>(mockSentMealPlans);

  const handleSendMealPlan = (data: { userId: string; packageName: string; file: File }) => {
    // In production, upload file and create meal plan entry via API
    const user = mockUsers.find((u) => u.id === data.userId);
    if (user) {
      const newPlan: MealPlan = {
        id: String(Date.now()),
        userId: data.userId,
        userName: user.name,
        userEmail: user.email,
        packageName: data.packageName,
        status: "sent",
        pdfUrl: URL.createObjectURL(data.file),
        uploadedAt: new Date(),
      };
      setSentPlans((prev) => [...prev, newPlan]);
    }
  };

  const handleUpload = (planId: string) => {
    // In production, open file picker and upload PDF
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Find the pending plan
        const pendingPlan = pendingPlans.find((p) => p.id === planId);
        if (pendingPlan) {
          // Upload file and update plan status
          setPendingPlans((prev) =>
            prev.filter((plan) => plan.id !== planId)
          );
          setSentPlans((prev) => [
            ...prev,
            {
              ...pendingPlan,
              status: "sent" as const,
              pdfUrl: URL.createObjectURL(file),
              uploadedAt: new Date(),
            },
          ]);
        }
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg">
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Meal Plan</h1>
                <p className="text-[13px] text-[#9ca3af]">
                  Manage meal plans for your clients.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-white hover:bg-gray-100 text-black px-4 py-2"
              >
                Send Meal Plan
              </Button>
            </div>
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
                          {plan.userName}
                        </div>
                        <div className="text-sm text-[#9ca3af] mb-2">
                          {plan.userEmail}
                        </div>
                        <div className="text-sm text-[#d1d5db]">
                          {plan.packageName}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUpload(plan.id)}
                        variant="outline"
                        className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-[#262626] rounded-lg">
                <p className="text-sm text-[#9ca3af]">No pending meal plans.</p>
              </div>
            )}
          </div>

          {/* Sent Meal Plans Section */}
          <div>
            <h2 className="text-sm font-semibold text-[#f9fafb] mb-4">Sent Plans</h2>
            {sentPlans.length > 0 ? (
              <div className="space-y-4">
                {sentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-[#262626] rounded-lg px-6 py-4 bg-transparent hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#f9fafb] mb-1">
                          {plan.userName}
                        </div>
                        <div className="text-sm text-[#9ca3af] mb-2">
                          {plan.userEmail}
                        </div>
                        <div className="text-sm text-[#d1d5db]">
                          {plan.packageName}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (plan.pdfUrl) {
                            window.open(plan.pdfUrl, '_blank');
                          }
                        }}
                        variant="outline"
                        className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-[#262626] rounded-lg">
                <p className="text-sm text-[#9ca3af]">No sent meal plans yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Send Meal Plan Modal */}
      <SendMealPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendMealPlan}
      />
    </div>
  );
}
