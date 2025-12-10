"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

// Placeholder layout without auth guard for testing; add auth checks later.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />
      <main className="flex-1 md:ml-72">
        <header className="sticky top-0 z-10 bg-[#0b0b0b]/80 backdrop-blur border-b border-[#1f1f1f] px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs uppercase tracking-widest text-white/50">
              Admin
            </div>
            <div className="text-base sm:text-lg font-semibold">
              {pathname?.replace("/admin", "") || "Overview"}
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
