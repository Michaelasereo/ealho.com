import { createClient } from "@/lib/supabase/server/client";
import { createAdminClientServer } from "@/lib/supabase/server";
import { findUserByAuthId } from "@/lib/auth/user-lookup";
import { redirect } from "next/navigation";
import { TherapistEnrollmentForm } from "./TherapistEnrollmentForm";

export default async function TherapistEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string }>;
}) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  const isConnected = params.connected === "true";

  // If user is NOT logged in, redirect to signup page
  if (authError || !authUser) {
    redirect("/therapist-signup");
  }

  // If user IS logged in but not connected param, redirect to signup
  // They need to go through the signup flow first
  if (!isConnected) {
    // Check if user already completed onboarding before redirecting
    const supabaseAdminCheck = createAdminClientServer();
    const { user: checkUser } = await findUserByAuthId(
      authUser.id,
      "THERAPIST",
      supabaseAdminCheck
    );
    
    if (checkUser && checkUser.onboarding_completed) {
      redirect("/therapist-dashboard");
    }
    
    // User is authenticated but hasn't gone through signup flow
    // Redirect to signup page to ensure proper flow
    redirect("/therapist-signup");
  }

  // Check if user already has a THERAPIST account
  const supabaseAdmin = createAdminClientServer();
  const { user: dbUser, error: userError } = await findUserByAuthId(
    authUser.id,
    "THERAPIST",
    supabaseAdmin
  );

  // If user already has THERAPIST account and completed onboarding, redirect to dashboard
  if (dbUser && dbUser.onboarding_completed) {
    redirect("/therapist-dashboard");
  }

  // User is logged in AND connected=true → SHOW ENROLLMENT FORM
  return (
    <TherapistEnrollmentForm
      authUserId={authUser.id}
      email={authUser.email!}
      existingUser={dbUser}
    />
  );
}
