"use client";

import { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

interface OnboardingWrapperProps {
  children: React.ReactNode;
  onboardingCompleted: boolean;
  userRole: "THERAPIST" | "DIETITIAN";
}

export function OnboardingWrapper({
  children,
  onboardingCompleted: initialOnboardingCompleted,
  userRole,
}: OnboardingWrapperProps) {
  const [onboardingCompleted, setOnboardingCompleted] = useState(initialOnboardingCompleted);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    // Refresh the page to ensure all data is updated
    window.location.reload();
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Lock sidebar when onboarding is not completed */}
      <div
        className={onboardingCompleted ? "" : "pointer-events-none opacity-50"}
        style={onboardingCompleted ? {} : { position: "relative", zIndex: 1 }}
      >
        {children}
      </div>
      {!onboardingCompleted && (
        <OnboardingModal
          role={userRole}
          isOpen={!onboardingCompleted}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}

