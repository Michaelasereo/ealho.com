"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
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
  FileText,
  Send,
  Menu,
  X
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
      { name: "Past", href: "/dashboard/bookings/past" },
      { name: "Canceled", href: "/dashboard/bookings/canceled" },
    ]
  },
  { name: "Session Request", href: "/dashboard/session-request", icon: Send },
  { name: "Availability", href: "/dashboard/availability", icon: Clock },
  { name: "Assessment Tests", href: "/dashboard/meal-plan", icon: FileText },
];

// Therapist-specific navigation items
const therapistNavigation = [
  { name: "Dashboard", href: "/therapist-dashboard", icon: LayoutDashboard },
  { name: "Event Types", href: "/therapist-dashboard/event-types", icon: Link2 },
  { 
    name: "Bookings", 
    href: "/therapist-dashboard/bookings", 
    icon: Calendar,
    subItems: [
      { name: "Upcoming", href: "/therapist-dashboard/bookings/upcoming" },
      { name: "Past", href: "/therapist-dashboard/bookings/past" },
      { name: "Canceled", href: "/therapist-dashboard/bookings/canceled" },
    ]
  },
  { name: "Session Request", href: "/therapist-dashboard/session-request", icon: Send },
  { name: "Availability", href: "/therapist-dashboard/availability", icon: Clock },
  { name: "Session Notes", href: "/therapist-dashboard/session-notes", icon: FileText },
  { name: "Assessment Tests", href: "/therapist-dashboard/meal-plan", icon: FileText },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);
  
  // Get profile from AuthProvider context - single source of truth
  const { profile: userProfile, signOut } = useAuth();

  // Prevent hydration mismatch by only rendering image after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when pathname changes on mobile
  useEffect(() => {
    if (onClose && isOpen) {
      // Small delay to allow navigation to start
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, isOpen, onClose]);

  // Clear navigating state when pathname changes
  useEffect(() => {
    setNavigating(null);
  }, [pathname]);

  // Auto-expand items when on their sub-pages, and close others
  useEffect(() => {
    const navItems = pathname?.startsWith("/therapist-dashboard") ? therapistNavigation : navigation;
    navItems.forEach((item) => {
      if (item.subItems) {
        const isOnSubPage = item.subItems.some(subItem => pathname === subItem.href);
        const isOnMainPage = pathname === item.href || 
          (item.href !== "/dashboard" && item.href !== "/therapist-dashboard" && pathname?.startsWith(item.href));
        
        if (isOnSubPage || isOnMainPage) {
          setExpandedItems((prev) => {
            if (!prev.includes(item.name)) {
              // Close other items with sub-items when opening this one
              const otherItemsWithSubs = navItems
                .filter(n => n.subItems && n.name !== item.name)
                .map(n => n.name);
              return [...prev.filter(name => !otherItemsWithSubs.includes(name)), item.name];
            }
            return prev;
          });
        }
      }
    });
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemName)) {
        // Check if we're currently on a sub-page of this item
        const navItems = pathname?.startsWith("/therapist-dashboard") ? therapistNavigation : navigation;
        const item = navItems.find(n => n.name === itemName);
        if (item?.subItems) {
          const isOnSubPage = item.subItems.some(subItem => pathname === subItem.href);
          const isOnMainPage = pathname === item.href || 
            (item.href !== "/dashboard" && item.href !== "/therapist-dashboard" && pathname?.startsWith(item.href));
          
          // Don't allow closing if we're on a sub-page or main page
          if (isOnSubPage || isOnMainPage) {
            return prev;
          }
        }
        return prev.filter((name) => name !== itemName);
      } else {
        // When opening a new item, close others that have sub-items
        const navItems = pathname?.startsWith("/therapist-dashboard") ? therapistNavigation : navigation;
        const otherItemsWithSubs = navItems
          .filter(n => n.subItems && n.name !== itemName)
          .map(n => n.name);
        return [...prev.filter(name => !otherItemsWithSubs.includes(name)), itemName];
      }
    });
  };

  // Handle navigation with proper client-side routing
  const handleNavigation = async (href: string, e?: React.MouseEvent) => {
    // Don't navigate if already on this page
    if (pathname === href) {
      if (e) {
        e.preventDefault();
      }
      return;
    }

    // Set navigating state to show loading indicator
    setNavigating(href);
    
    try {
      // Use router.push for client-side navigation without full page reload
      // This prevents the full page reload that Link might cause with server components
      await router.push(href);
    } catch (error) {
      console.error("Navigation error:", error);
      // Clear navigating state on error
      setNavigating(null);
      // Optionally show error to user
      // You could add a toast notification here if needed
    }
    
    // Clear navigating state after navigation completes
    // The pathname change will also clear it in the useEffect
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>

      {/* Sidebar - Hidden on mobile, always visible on desktop */}
      <aside
        className={cn(
          "w-64 bg-[#171717] flex flex-col h-screen fixed left-0 top-0 overflow-hidden z-50",
          "hidden lg:flex", // Hide completely on mobile, flex on desktop
          // Desktop mode (when onClose doesn't exist): always visible
          !onClose && "translate-x-0"
        )}
      >
      {/* Top Section with Logo and Search */}
        <div className="p-4 pb-3 flex-shrink-0 relative">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/ealho-logo.svg"
                alt="Eahlo"
                width={120}
                height={32}
                className="h-8 w-auto"
                style={{ width: "auto", height: "2rem" }}
              />
              {pathname?.startsWith("/therapist-dashboard") && (
                <span className="text-xs font-medium text-white/60">Therapy</span>
              )}
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
        {(pathname?.startsWith("/therapist-dashboard") ? therapistNavigation : navigation).map((item) => {
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
                      "w-full flex items-center justify-between gap-3 px-3 py-3 rounded-md text-[15px] font-medium transition-colors min-h-[48px]",
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
                        const isNavigating = navigating === subItem.href;
                        return (
                          <button
                            key={subItem.name}
                            onClick={(e) => handleNavigation(subItem.href, e)}
                            disabled={isNavigating || isSubActive}
                            className={cn(
                              "block w-full text-left px-3 py-2 rounded-md text-[15px] transition-colors",
                              isSubActive
                                ? "bg-[#404040] text-[#f9fafb]"
                                : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]",
                              (isNavigating || isSubActive) && "opacity-75 cursor-not-allowed"
                            )}
                          >
                            {isNavigating ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin">⟳</span>
                                Loading...
                              </span>
                            ) : (
                              subItem.name
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={(e) => handleNavigation(item.href, e)}
                  disabled={navigating === item.href || isActive}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-md text-[15px] font-medium transition-colors min-h-[48px]",
                    isActive
                      ? "bg-[#404040] text-[#f9fafb]"
                      : "text-[#D4D4D4] hover:bg-[#374151] hover:text-[#f9fafb]",
                    (navigating === item.href || isActive) && "opacity-75 cursor-not-allowed"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>
                    {navigating === item.href ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span>
                        Loading...
                      </span>
                    ) : (
                      item.name
                    )}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </nav>


      {/* Bottom Links */}
      <div className="p-4 border-t border-[#374151] space-y-2 flex-shrink-0">
        {/* Profile with online status */}
        <div className="flex items-center gap-2 pb-2">
          <div className="relative">
            {mounted && userProfile?.image ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={userProfile.image}
                  alt={userProfile.name || "Profile"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#404040] to-[#525252] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {userProfile?.name ? getInitials(userProfile.name) : "D"}
                </span>
            </div>
            )}
            {/* Online status indicator */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#171717]"
              style={{ backgroundColor: "#E5FF53" }}
            ></div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-[#D4D4D4]">
              {userProfile?.name || "Dietitian"}
            </div>
          </div>
        </div>
        <Link
          href={pathname?.startsWith("/therapist-dashboard") ? "/therapist-dashboard/settings/profile" : "/dashboard/settings/profile"}
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Settings className="h-4 w-4" />
          Profile Settings
        </Link>
        <div
          className="flex items-center gap-2 text-sm text-[#9ca3af] opacity-50 cursor-not-allowed rounded px-2 py-1"
          title="Refer and earn is disabled for now"
        >
          <Gift className="h-4 w-4" />
          Refer and earn
        </div>
        <Link
          href={pathname?.startsWith("/therapist-dashboard") ? "/therapist-dashboard/settings/profile" : "/dashboard/settings/profile"}
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors rounded px-2 py-1"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button 
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-[#D4D4D4] hover:text-[#f9fafb] hover:bg-[#374151] transition-colors w-full rounded px-2 py-1"
        >
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
    </>
  );
}

/**
 * Mobile Menu Button Component
 */
export function DashboardSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#171717] text-[#D4D4D4] hover:text-[#f9fafb] rounded-md border border-[#374151] hover:bg-[#374151] transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
