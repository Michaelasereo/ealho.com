"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

interface TherapistEnrollmentFormProps {
  authUserId: string;
  email: string;
  existingUser?: any;
}

export function TherapistEnrollmentForm({
  authUserId,
  email,
  existingUser,
}: TherapistEnrollmentFormProps) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    existingUser?.onboarding_completed || false
  );

  useEffect(() => {
    // If user already completed onboarding, redirect to dashboard
    if (onboardingCompleted && existingUser?.onboarding_completed) {
      router.push("/therapist-dashboard");
    }
  }, [onboardingCompleted, existingUser, router]);

  const handleOnboardingComplete = async () => {
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    // Use window.location for a hard redirect to ensure server-side checks happen
    // This ensures the dashboard layout can properly verify the user's enrollment status
    window.location.href = "/therapist-dashboard";
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {showOnboarding && (
        <OnboardingModal
          role="THERAPIST"
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

