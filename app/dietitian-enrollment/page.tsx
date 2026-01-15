"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";

export default function DietitianEnrollmentPage() {
  return (
    <AuthScreen
      title="Dietitian Enrollment"
      subtitle="Sign in with Google to get started. You'll complete your profile after signing in."
      redirectPath="/dashboard"
      source="dietitian-enrollment"
    />
  );
}
