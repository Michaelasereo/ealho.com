"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { OnboardingStage } from "@/lib/onboarding/state-machine";

interface OnboardingModalProps {
  role: "THERAPIST" | "DIETITIAN";
  isOpen: boolean;
  onComplete: () => void;
}

type Step = 1 | 2 | 3;

// Map stage to step number
const stageToStep = (stage: OnboardingStage): Step => {
  switch (stage) {
    case "STARTED":
    case "PERSONAL_INFO":
      return 1;
    case "PROFESSIONAL_INFO":
      return 2;
    case "TERMS":
      return 3;
    case "COMPLETED":
      return 3;
    default:
      return 1;
  }
};

// Map step to stage
const stepToStage = (step: Step): OnboardingStage => {
  switch (step) {
    case 1:
      return "PERSONAL_INFO";
    case 2:
      return "PROFESSIONAL_INFO";
    case 3:
      return "TERMS";
    default:
      return "STARTED";
  }
};

export function OnboardingModal({ role, isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const { setProfileDirect, user } = useAuth();

  // Reset submitting state if it gets stuck (safety mechanism)
  useEffect(() => {
    if (submitting) {
      const timeout = setTimeout(() => {
        console.warn("Onboarding submission timeout - resetting state");
        setSubmitting(false);
        setError("Request timed out. Please try again.");
      }, 35000); // 35 seconds (slightly longer than fetch timeout)
      return () => clearTimeout(timeout);
    }
  }, [submitting]);

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Step 2 fields
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState<string[]>([]);

  // Step 3 fields
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch CSRF token when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf-token", {
          credentials: "include",
        });
        if (response.ok) {
          const { token } = await response.json();
          setCsrfToken(token);
        }
      } catch (err) {
        console.warn("Failed to fetch CSRF token:", err);
      }
    };

    fetchCsrfToken();
  }, [isOpen]);

  // Load saved progress on mount
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadProgress = async () => {
      try {
        setLoadingProgress(true);
        const response = await fetch("/api/onboarding/progress");
        if (response.ok) {
          const { progress } = await response.json();
          if (progress && progress.data) {
            // Restore form data
            if (progress.data.fullName) setFullName(progress.data.fullName);
            if (progress.data.age) setAge(String(progress.data.age));
            if (progress.data.gender) setGender(progress.data.gender);
            if (progress.data.state) setState(progress.data.state);
            if (progress.data.profileImage) setProfileImage(progress.data.profileImage);
            if (progress.data.bio) setBio(progress.data.bio);
            if (progress.data.licenseNumber) setLicenseNumber(progress.data.licenseNumber);
            if (progress.data.qualifications) setQualifications(progress.data.qualifications);
            if (progress.data.experience) setExperience(progress.data.experience);
            if (progress.data.specialization) setSpecialization(progress.data.specialization);
            if (progress.data.termsRead) setTermsRead(progress.data.termsRead);
            if (progress.data.privacyRead) setPrivacyRead(progress.data.privacyRead);
            if (progress.data.termsAccepted) setTermsAccepted(progress.data.termsAccepted);

            // Restore step from stage
            if (progress.current_stage && progress.current_stage !== "COMPLETED") {
              setStep(stageToStep(progress.current_stage));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load onboarding progress:", err);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, [isOpen, user]);

  // Auto-save progress on field changes (debounced)
  const saveProgress = useCallback(
    async (currentStep: Step) => {
      if (!user) return;

      setIsAutoSaving(true);
      try {
        const stage = stepToStage(currentStep);
        const formData: any = {};

        // Include relevant fields based on step
        if (currentStep >= 1) {
          formData.fullName = fullName;
          formData.age = age ? parseInt(age) : undefined;
          formData.gender = gender;
          formData.state = state;
          formData.profileImage = profileImage;
        }
        if (currentStep >= 2) {
          formData.bio = bio;
          formData.licenseNumber = licenseNumber;
          formData.qualifications = qualifications;
          formData.experience = experience;
          formData.specialization = specialization;
        }
        if (currentStep >= 3) {
          formData.termsRead = termsRead;
          formData.privacyRead = privacyRead;
          formData.termsAccepted = termsAccepted;
        }

        await fetch("/api/onboarding/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, formData }),
        });
      } catch (err) {
        console.warn("Failed to save onboarding progress:", err);
        // Don't show error to user - auto-save is best effort
      } finally {
        setIsAutoSaving(false);
      }
    },
    [user, fullName, age, gender, state, profileImage, bio, licenseNumber, qualifications, experience, specialization, termsRead, privacyRead, termsAccepted]
  );

  // Debounced auto-save
  useEffect(() => {
    if (!isOpen || loadingProgress) return;

    const timeoutId = setTimeout(() => {
      saveProgress(step);
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [isOpen, loadingProgress, step, saveProgress]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: any) => {
    switch (field) {
      case "fullName":
        setFullName(value);
        break;
      case "age":
        setAge(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "state":
        setState(value);
        break;
      case "bio":
        setBio(value);
        break;
      case "licenseNumber":
        setLicenseNumber(value);
        break;
      case "qualifications":
        setQualifications(value);
        break;
      case "experience":
        setExperience(value);
        break;
      case "specialization":
        setSpecialization(value);
        break;
    }
  };

  const handleImageChange = (image: string | null) => {
    setProfileImage(image);
  };

  const step1Valid = fullName.trim() && age && gender && state;
  const bioWordCount = bio.trim().split(/\s+/).filter(Boolean).length;
  const step2Valid =
    bio.trim() &&
    bioWordCount <= 100 &&
    licenseNumber.trim() &&
    experience &&
    specialization.length > 0 &&
    specialization.length <= 5;
  const step3Valid = termsRead && privacyRead && termsAccepted;

  const handleNext = async () => {
    if (step === 1 && step1Valid) {
      // Save progress before moving to next step
      await saveProgress(1);
      setStep(2);
      setError(null);
    } else if (step === 2 && step2Valid) {
      // Save progress before moving to next step
      await saveProgress(2);
      setStep(3);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!step3Valid) {
      setError("Please complete all required fields and accept the terms");
      return;
    }

    if (!csrfToken) {
      setError("Security token missing. Please refresh the page and try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get session token for authentication (with timeout to prevent blocking)
      const supabase = createBrowserClient();
      
      // Try to get session with a timeout
      let session = null;
      let accessToken: string | null = null;
      
      try {
        // Use Promise.race to timeout session retrieval after 5 seconds
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 5000)
        );
        
        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (sessionResult && 'data' in sessionResult) {
          session = sessionResult.data?.session || null;
          accessToken = session?.access_token || null;
        }
      } catch (err) {
        console.warn("Session retrieval failed, will use cookies:", err);
        // Continue without session token - API can use cookies
      }

      console.log("Submitting onboarding data...", {
        role,
        fullName,
        hasSession: !!session,
        hasAccessToken: !!accessToken,
        usingCookies: !accessToken,
      });

      // Prepare headers - include Authorization if we have token, otherwise rely on cookies
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      
      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers,
          credentials: "include", // Include cookies for authentication
          body: JSON.stringify({
            role,
            fullName,
            age: parseInt(age),
            gender,
            state,
            bio,
            licenseNumber,
            qualifications,
            experience,
            specialization,
            termsAccepted,
            profileImage,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Onboarding API response status:", response.status);

        const data = await response.json();
        console.log("Onboarding API response data:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to complete onboarding");
        }

        // Update AuthProvider context immediately if imageUrl is returned
        if (data.imageUrl) {
          setProfileDirect({
            name: fullName || null,
            image: data.imageUrl || null,
          });
        } else if (fullName) {
          // Update name even if no image
          setProfileDirect({
            name: fullName || null,
            image: null,
          });
        }

        // Mark onboarding as completed in state machine
        try {
          await fetch("/api/onboarding/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: "COMPLETED", formData: {} }),
          });
        } catch (err) {
          console.warn("Failed to mark onboarding as completed:", err);
        }

        // Onboarding complete, close modal
        onComplete();
        setSubmitting(false);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setError("Request timed out. Please check your network and try again.");
        } else {
          setError(fetchError.message || "Failed to complete onboarding");
        }
        setSubmitting(false);
        throw fetchError;
      }
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#171717] border border-[#262626] rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header with Progress Bar */}
        <div className="p-6 border-b border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <ProgressBar currentStep={step} totalSteps={3} />
            {isAutoSaving && (
              <span className="text-xs text-white/50">Saving...</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <OnboardingStep1
              fullName={fullName}
              age={age}
              gender={gender}
              state={state}
              profileImage={profileImage}
              onFieldChange={handleFieldChange}
              onImageChange={handleImageChange}
            />
          )}

          {step === 2 && (
            <OnboardingStep2
              role={role}
              bio={bio}
              licenseNumber={licenseNumber}
              qualifications={qualifications}
              experience={experience}
              specialization={specialization}
              onFieldChange={handleFieldChange}
            />
          )}

          {step === 3 && (
            <OnboardingStep3
              termsRead={termsRead}
              privacyRead={privacyRead}
              termsAccepted={termsAccepted}
              onTermsReadChange={setTermsRead}
              onPrivacyReadChange={setPrivacyRead}
              onTermsAcceptedChange={setTermsAccepted}
            />
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="p-6 border-t border-[#262626] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={submitting}
                className="border-[#1f1f1f] text-white hover:bg-[#1f1f1f]"
              >
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                variant="outline"
                onClick={async () => {
                  await saveProgress(step);
                  alert("Progress saved! You can continue later.");
                }}
                disabled={submitting}
                className="border-[#1f1f1f] text-white hover:bg-[#1f1f1f] text-sm"
              >
                Save & Continue Later
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !step1Valid) ||
                  (step === 2 && !step2Valid) ||
                  submitting
                }
                className="bg-white text-black hover:bg-white/90 min-w-[120px]"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!step3Valid || submitting}
                className="bg-white text-black hover:bg-white/90 min-w-[120px]"
              >
                {submitting ? "Submitting..." : "Complete Onboarding"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

