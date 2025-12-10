"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-[#404040]" />
          <span className="text-xl font-semibold text-[#111827]">Daiyet</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
              Solutions
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <Link href="/enterprise" className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
            Enterprise
          </Link>
          <Link href="/ai" className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
            Daiyet AI
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
              Developer
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
              Resources
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <Link href="/pricing" className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-[#111827] hover:bg-[#292929] text-white">
              Go to app →
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
