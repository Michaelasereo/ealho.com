"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ArrowLeft, User, Settings as SettingsIcon, Calendar, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  { name: "Profile", href: "/dashboard/settings/profile", icon: User },
  { name: "General", href: "/dashboard/settings/general", icon: SettingsIcon },
  { name: "Calendars", href: "/dashboard/settings/calendars", icon: Calendar },
  { name: "Out of office", href: "/dashboard/settings/out-of-office", icon: Clock },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <div className="flex-1 flex ml-64">
        {/* Settings Sidebar */}
        <aside className="w-64 bg-[#0f0f0f] border-r border-[#262626] flex flex-col">
          {/* Back Button */}
          <div className="p-4 border-b border-[#262626]">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {/* Settings Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-[15px] font-medium transition-colors",
                    isActive
                      ? "bg-[#404040] text-[#f9fafb]"
                      : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]"
                  )}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#101010] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
