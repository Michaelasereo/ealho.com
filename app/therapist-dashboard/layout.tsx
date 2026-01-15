import { createClient } from "@/lib/supabase/server/client";
import { createAdminClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UnifiedUserSystem } from "@/lib/auth/unified-user-system";
import { OnboardingStateMachine } from "@/lib/onboarding/state-machine";
import { DashboardProfileInitializer } from "./DashboardProfileInitializer";
import { OnboardingWrapper } from "./OnboardingWrapper";

/**
 * Dashboard layout that fetches user profile server-side and initializes
 * the AuthProvider context. This ensures profile data is available immediately
 * without client-side fetching, preventing flickering and race conditions.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Fetch user and profile server-side
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("DashboardLayout: Auth check failed", { error: authError?.message });
      redirect("/therapist-login");
    }

    // Fetch profile from database using unified user system
    const supabaseAdmin = createAdminClientServer();
    const { user: dbUser, error: userError } = await UnifiedUserSystem.getUser(
      user.id,
      "THERAPIST",
      supabaseAdmin
    );

    if (userError || !dbUser) {
      // User doesn't have therapist account yet - redirect to signup
      // Check if they're authenticated first
      if (user) {
        console.error("DashboardLayout: User not found in database", {
          userId: user.id,
          error: userError?.message,
        });
        redirect("/therapist-signup");
      } else {
        redirect("/therapist-login");
      }
    }

    if (dbUser.role !== "THERAPIST") {
      if (dbUser.role === "USER") redirect("/user-dashboard");
      else if (dbUser.role === "ADMIN") redirect("/admin");
      else redirect("/");
    }

    // Prepare profile for context initialization
    // Use fallback values if data is missing
    const initialProfile = {
      name: dbUser.name || null,
      image: dbUser.image || null,
    };

    // Check onboarding status from state machine with error handling
    let onboardingCompleted = false;
    try {
      const { progress: onboardingProgress } = await OnboardingStateMachine.getCurrentStage(
        dbUser.id,
        supabaseAdmin
      );
      onboardingCompleted = onboardingProgress?.current_stage === "COMPLETED" || dbUser.onboarding_completed === true;
    } catch (error) {
      console.warn("DashboardLayout: Onboarding check failed, defaulting to false", error);
      onboardingCompleted = dbUser.onboarding_completed === true;
    }

    return (
      <DashboardProfileInitializer initialProfile={initialProfile}>
        <OnboardingWrapper
          onboardingCompleted={onboardingCompleted}
          userRole="THERAPIST"
        >
          {children}
        </OnboardingWrapper>
      </DashboardProfileInitializer>
    );
  } catch (error) {
    console.error("DashboardLayout: Error", error);
    // Don't redirect on every error - let the page handle it
    // Only redirect if it's definitely an auth error
    if (error instanceof Error && (
      error.message.includes("auth") || 
      error.message.includes("unauthorized") ||
      error.message.includes("session")
    )) {
      redirect("/therapist-login");
    }
    // Otherwise, render children with null profile - let pages handle their own errors
    return (
      <DashboardProfileInitializer initialProfile={null}>
        {children}
      </DashboardProfileInitializer>
    );
  }
}