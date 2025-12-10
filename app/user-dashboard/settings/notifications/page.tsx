"use client";

import { Button } from "@/components/ui/button";

export default function UserNotificationsSettingsPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Notifications</h1>
        <p className="text-[13px] text-[#9ca3af] mb-6">
          Manage your notification preferences.
        </p>
      </div>

      {/* Notifications Content */}
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[#f9fafb] mb-2">Push Notifications</h2>
            <Button className="bg-white hover:bg-gray-100 text-black px-4 py-2">
              Allow Browser Notifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
