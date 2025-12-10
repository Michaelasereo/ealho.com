"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Upload } from "lucide-react";

export default function UserProfileSettingsPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">Profile</h1>
        <p className="text-[13px] text-[#9ca3af] mb-6">
          Manage your profile information.
        </p>
      </div>

      {/* Profile Form */}
      <div className="space-y-6 max-w-2xl">
        {/* Profile Picture */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#404040] to-[#525252] flex items-center justify-center">
              <User className="h-10 w-10 text-[#9ca3af]" />
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Username
          </label>
          <Input
            type="text"
            defaultValue="johndoe"
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Full Name
          </label>
          <Input
            type="text"
            defaultValue="John Doe"
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Email
          </label>
          <Input
            type="email"
            defaultValue="john@example.com"
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
          />
        </div>

        {/* About */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            About
          </label>
          <Textarea
            rows={4}
            defaultValue="Tell us about yourself..."
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <Button className="bg-white hover:bg-gray-100 text-black px-4 py-2">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
