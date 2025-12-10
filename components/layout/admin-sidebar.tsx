"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck2,
  BarChart3,
  Wallet,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Dietitians", href: "/admin/dietitians", icon: Stethoscope },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck2 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Payouts", href: "/admin/payouts", icon: Wallet },
  { name: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { name: "Meal Plans", href: "/admin/meal-plans", icon: CalendarCheck2 },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    subItems: [
      { name: "General", href: "/admin/settings" },
      { name: "Branding", href: "/admin/settings/branding" },
      { name: "Pricing", href: "/admin/settings/pricing" },
    ],
  },
];

export function AdminSidebar() {
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
    <aside className="w-64 bg-[#171717] flex flex-col h-screen fixed left-0 top-0 overflow-hidden border-r border-[#262626]">
      <div className="p-4 pb-3 flex-shrink-0">
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
        </div>
      </div>

      <div className="border-t border-[#262626] mx-4"></div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
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
                        : "text-[#D4D4D4] hover:bg-[#262626] hover:text-[#f9fafb]"
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
                                : "text-[#D4D4D4] hover:bg-[#262626] hover:text-[#f9fafb]"
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
                      : "text-[#D4D4D4] hover:bg-[#262626] hover:text-[#f9fafb]"
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
    </aside>
  );
}
