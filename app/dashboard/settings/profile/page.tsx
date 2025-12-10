"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, MoreVertical, Plus, Bold, Italic, Link as LinkIcon } from "lucide-react";

export default function ProfilePage() {
  const [username, setUsername] = useState("daiyet.co");
  const [fullName, setFullName] = useState("Daiyet.com");
  const [email, setEmail] = useState("asereopeyemimichael@gmail.com");
  const [about, setAbout] = useState(
    "Struggling with diets that don't work? Get matched with a certified dietitian for 1-on-1 consultations. Receive a science-backed assessment, a tailored meal plan that fits your lifestyle, and continuous support to reach your health goals."
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-[#f9fafb] mb-1">Profile</h1>
        <p className="text-sm text-[#9ca3af]">
          Manage settings for your Cal.com profile
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Profile Picture Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#404040] to-[#525252] flex items-center justify-center">
              <span className="text-white text-lg font-semibold">D</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Avatar
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Username Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Username
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-[#0a0a0a] border border-r-0 border-[#262626] text-[#9ca3af] text-sm rounded-l-md">
              cal.com/
            </span>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] rounded-l-none rounded-r-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040]"
            />
          </div>
          <p className="text-xs text-[#9ca3af]">
            Tip: You can add a '+' between usernames: cal.com/anna+brian to make a dynamic group meeting
          </p>
        </div>

        {/* Full Name Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Full name
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040]"
          />
        </div>

        {/* Email Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Email
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border-[#262626] text-[#f9fafb] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040]"
            />
            <span className="text-xs text-[#9ca3af] bg-[#262626] px-2 py-1 rounded">
              Primary
            </span>
            <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
            <Button
              variant="outline"
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            About
          </label>
          <div className="border border-[#262626] rounded-md bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-[#262626]">
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <Bold className="h-4 w-4" />
              </button>
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <Italic className="h-4 w-4" />
              </button>
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
            {/* Textarea */}
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="bg-transparent border-0 text-[#f9fafb] resize-none focus:outline-none focus:ring-0 min-h-[120px]"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Connected Accounts Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Connected accounts
          </label>
          <div className="flex items-center justify-between p-4 border border-[#262626] rounded-lg bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">G</span>
              </div>
              <span className="text-sm text-[#f9fafb]">Google</span>
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
