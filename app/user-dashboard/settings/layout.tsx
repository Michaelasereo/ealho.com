"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { ArrowLeft, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  { name: "Profile", href: "/user-dashboard/settings/profile", icon: User },
  { name: "Notifications", href: "/user-dashboard/settings/notifications", icon: Bell },
];

export default function UserSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <UserDashboardSidebar />
      {/* Settings Sidebar */}
      <aside className="w-64 bg-[#0f0f0f] border-r border-[#262626] flex flex-col h-screen fixed left-64">
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => router.push("/user-dashboard")}
            className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {settingsNavigation.map((item) => {
            const isActive = pathname === item.href;
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
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-[512px] rounded-tl-lg">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
