"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings, 
  Gift,
  ChevronDown,
  ChevronUp,
  Search,
  Link2,
  LogOut,
  FileText
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Event Types", href: "/dashboard/event-types", icon: Link2 },
  { 
    name: "Bookings", 
    href: "/dashboard/bookings", 
    icon: Calendar,
    subItems: [
      { name: "Upcoming", href: "/dashboard/bookings/upcoming" },
      { name: "Unconfirmed", href: "/dashboard/bookings/unconfirmed" },
      { name: "Recurring", href: "/dashboard/bookings/recurring" },
      { name: "Past", href: "/dashboard/bookings/past" },
      { name: "Canceled", href: "/dashboard/bookings/canceled" },
    ]
  },
  { name: "Availability", href: "/dashboard/availability", icon: Clock },
  { name: "Meal Plan", href: "/dashboard/meal-plan", icon: FileText },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

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
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const isExpanded = expandedItems.includes(item.name);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.name}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-[15px] font-medium transition-colors",
                      isActive
                        ? "bg-[#404040] text-[#f9fafb]"
                        : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && item.subItems && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              "block px-3 py-2 rounded-md text-[15px] transition-colors",
                              isSubActive
                                ? "bg-[#404040] text-[#f9fafb]"
                                : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
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
              )}
            </div>
          );
        })}
      </nav>

      {/* Availability Toggles - Only show on availability page */}
      {pathname === "/dashboard/availability" && (
        <div className="px-4 pb-4 border-t border-[#374151] pt-4 space-y-3">
          {/* Dietician Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#D4D4D4]">Dietician</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9ca3af]"></div>
            </label>
          </div>

          {/* Toggle All Availability Off */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#D4D4D4]">Toggle all availability off</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9ca3af]"></div>
            </label>
          </div>
        </div>
      )}

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
          href="/dashboard/settings/profile"
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Settings className="h-4 w-4" />
          Profile Settings
        </Link>
        <Link
          href="/refer"
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Gift className="h-4 w-4" />
          Refer and earn
        </Link>
        <Link
          href="/dashboard/settings/profile"
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
