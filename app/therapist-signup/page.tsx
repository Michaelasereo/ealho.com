"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function TherapistSignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Get redirect path from query params (callbackUrl from middleware or redirect param)
  const callbackUrl = searchParams.get("callbackUrl");
  const redirectParam = searchParams.get("redirect");
  const redirectPath = callbackUrl || redirectParam || "/therapist-dashboard";

  // Check if user is already authenticated and has a therapist account
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("Error getting session:", sessionError);
          setIsChecking(false);
          return;
        }
        
        if (session?.user) {
          setIsSignedIn(true);
          // Check if user already has a therapist account
          try {
            const response = await fetch("/api/therapists/profile", {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (response.ok) {
              // User has a therapist account, redirect to dashboard
              router.push("/therapist-dashboard");
              return;
            }
          } catch (error) {
            // Error checking - allow them to proceed
            console.warn("Error checking therapist account:", error);
          }
        }
      } catch (error) {
        // Catch any unexpected errors
        console.error("Error in checkAuth:", error);
      } finally {
        // Always set checking to false, even if there's an error
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setIsSignedIn(false);
    // Refresh the page to clear any cached state
    window.location.reload();
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show OAuth button - if user is authenticated, show sign out option
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {isSignedIn && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm text-yellow-300">
              You're signed in with a different account. Sign out to create a new therapist account.
            </p>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-transparent border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
      <AuthScreen
        title="Get Started as a Therapist"
        subtitle="Sign in with Google to begin your therapist enrollment. You'll complete your profile after signing in."
        redirectPath={redirectPath}
        source="therapist-signup"
      />
    </div>
  );
}

export default function TherapistSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <TherapistSignupContent />
    </Suspense>
  );
}

