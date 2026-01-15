"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function ClearSessionPage() {
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      try {
        const supabase = createBrowserClient();
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/therapist-enrollment');
        }, 1000);
      } catch (error) {
        console.error('Error clearing session:', error);
        // Still redirect even if there's an error
        router.push('/therapist-enrollment');
      }
    };

    clearSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">Clearing session...</div>
        <div className="text-sm text-gray-400 mt-2">Redirecting to therapist enrollment...</div>
      </div>
    </div>
  );
}

