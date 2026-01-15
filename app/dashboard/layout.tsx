import { createClient } from "@/lib/supabase/server/client";
import { createAdminClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardProfileInitializer } from "./DashboardProfileInitializer";
import { OnboardingWrapper } from "./OnboardingWrapper";
import { UnifiedUserSystem } from "@/lib/auth/unified-user-system";
import { OnboardingStateMachine } from "@/lib/onboarding/state-machine";

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
      redirect("/dietitian-login");
    }

    // Fetch profile from database using unified user system
    const supabaseAdmin = createAdminClientServer();
    const { user: dbUser, error: userError } = await UnifiedUserSystem.getUser(
      user.id,
      "DIETITIAN",
      supabaseAdmin
    );

    if (userError || !dbUser) {
      redirect("/dietitian-enrollment");
    }

    if (dbUser.role !== "DIETITIAN") {
      if (dbUser.role === "USER") redirect("/user-dashboard");
      else if (dbUser.role === "ADMIN") redirect("/admin");
      else redirect("/");
    }

    // Prepare profile for context initialization
    const initialProfile = {
      name: dbUser.name || null,
      image: dbUser.image || null,
    };

    // Check onboarding status from state machine
    const { progress: onboardingProgress } = await OnboardingStateMachine.getCurrentStage(
      dbUser.id,
      supabaseAdmin
    );
    const onboardingCompleted = onboardingProgress?.current_stage === "COMPLETED" || dbUser.onboarding_completed === true;

    return (
      <DashboardProfileInitializer initialProfile={initialProfile}>
        <OnboardingWrapper
          onboardingCompleted={onboardingCompleted}
          userRole="DIETITIAN"
        >
          {children}
        </OnboardingWrapper>
      </DashboardProfileInitializer>
    );
  } catch (error) {
    console.error("DashboardLayout: Error", error);
    redirect("/dietitian-login");
  }
}