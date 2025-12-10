"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Phone,
  FileText,
  Settings, 
  Gift,
  Search,
  User,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/user-dashboard", icon: LayoutDashboard },
  { name: "Book a Call", href: "/user-dashboard/book-a-call", icon: Phone },
  { name: "Upcoming Meetings", href: "/user-dashboard/upcoming-meetings", icon: Calendar },
  { name: "Meal Plan", href: "/user-dashboard/meal-plan", icon: FileText },
  { name: "Profile Settings", href: "/user-dashboard/profile-settings", icon: User },
];

export function UserDashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#171717] flex flex-col h-screen fixed left-0 top-0 overflow-hidden">
      {/* Top Section with Logo and Search */}
      <div className="p-4 pb-3 flex-shrink-0 relative">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/daiyet logo.svg"
              alt="Daiyet"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <button className="text-[#D4D4D4] hover:text-[#f9fafb]">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#374151] mx-4"></div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/user-dashboard" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] font-medium transition-colors",
                isActive
                  ? "bg-[#404040] text-[#f9fafb]"
                  : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="p-4 border-t border-[#374151] space-y-2 flex-shrink-0">
        {/* Profile with online status */}
        <div className="flex items-center gap-2 pb-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#404040] to-[#525252] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">JD</span>
            </div>
            {/* Online status indicator */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#171717]"
              style={{ backgroundColor: "#E5FF53" }}
            ></div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-[#D4D4D4]">John Doe</div>
          </div>
        </div>
        <Link
          href="/user-dashboard/refer-and-earn"
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Gift className="h-4 w-4" />
          Refer and earn
        </Link>
        <Link
          href="/user-dashboard/settings/profile"
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors w-full rounded px-2 py-1">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#374151] flex-shrink-0">
        <p className="text-xs text-[#D4D4D4]">
          © 2025 Daiyet.com, Inc. v.1.0.0
        </p>
      </div>
    </aside>
  );
}
