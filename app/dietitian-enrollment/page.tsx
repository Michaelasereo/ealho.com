"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Step = 1 | 2 | 3;

const experiences = ["0-1", "1-3", "3-5", "5-10", "10+"];
const specializations = [
  "Weight management",
  "Sports nutrition",
  "Pediatrics",
  "Clinical/medical",
  "Plant-based",
  "General wellness",
];

export default function DietitianEnrollmentPage() {
  const [step, setStep] = useState<Step>(1);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");

  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const termsRef = useRef<HTMLDivElement | null>(null);
  const privacyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setGoogleConnected(true);
        const name =
          (session.user.user_metadata as any)?.full_name ||
          session.user.user_metadata?.name ||
          "";
        const mail = session.user.email || "";
        setFullName((prev) => prev || name);
        setEmail((prev) => prev || mail);
      }
    };
    void init();
  }, []);

  const handleGoogle = () => {
    // Placeholder: simulate Google connect for testing without auth.
    setConnecting(true);
    setError(null);
    setTimeout(() => {
      setGoogleConnected(true);
      setConnecting(false);
      if (!fullName) setFullName("Dietitian Tester");
      if (!email) setEmail("tester@example.com");
    }, 300);
  };

  const bioWordCount = useMemo(() => {
    return bio.trim() === "" ? 0 : bio.trim().split(/\s+/).length;
  }, [bio]);

  const stepOneValid =
    googleConnected &&
    fullName.trim() &&
    email.trim() &&
    phone.trim() &&
    dob &&
    location.trim() &&
    profilePicture;

  const stepTwoValid =
    licenseNumber.trim() &&
    experience &&
    specialization.trim() &&
    bio.trim() &&
    bioWordCount <= 100;

  const stepThreeValid =
    googleConnected && stepOneValid && stepTwoValid && termsRead && privacyRead && confirmChecked;

  const handleSubmit = () => {
    if (!stepThreeValid) return;
    setSubmitted(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/dietitian-login";
      }
    }, 1200);
  };

  const handleNext = () => {
    if (step === 1 && stepOneValid) setStep(2);
    if (step === 2 && stepTwoValid) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const onScrollCheck = (ref: React.RefObject<HTMLDivElement | null>, setter: (v: boolean) => void) => {
    const el = ref.current;
    if (!el) return;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (reachedBottom) setter(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b0b] text-white overflow-hidden flex items-center justify-center px-4 sm:px-6 md:px-8 py-10 md:py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          maskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 75%)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left column: Steps */}
        <div className="lg:col-span-1 space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Image
              src="/daiyet logo.svg"
              alt="Daiyet"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          <div className="text-xs md:text-sm text-white/60">Dietitian enrollment</div>
          <h1 className="text-xl md:text-2xl font-semibold leading-tight">3-step application</h1>

          {/* Progress tracker */}
          <div className="pt-4">
            <div className="flex flex-col gap-3">
              {[
                { id: 1, title: "Basic information", short: "Step 1" },
                { id: 2, title: "Professional details", short: "Step 2" },
                { id: 3, title: "Agreement & submit", short: "Step 3" },
              ].map((item, idx) => {
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`relative flex items-center gap-3 ${
                        active || done ? "text-white" : "text-white/60"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                          active
                            ? "bg-white text-black"
                            : done
                              ? "bg-emerald-500/20 text-emerald-200"
                              : "bg-white/10 text-white/70"
                        }`}
                      >
                        {item.id}
                      </div>
                      <div className="hidden md:block text-sm font-medium">
                        <span className="md:hidden">{item.short}</span>
                        <span className="hidden md:inline xl:hidden">{item.short}</span>
                        <span className="hidden xl:inline">{item.title}</span>
                      </div>
                      <div className="md:hidden text-xs font-medium">{item.id}</div>
                    </div>
                    {idx < 2 && (
                      <div className="hidden xl:block flex-1 h-px bg-white/15 ml-1 mr-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 text-[11px] md:text-xs text-white/60">
            Cannot proceed past Step 1 without Google. Submit disabled until all requirements are
            met.
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-7 lg:p-8 backdrop-blur-sm shadow-2xl shadow-black/40">
          {submitted ? (
            <div className="flex flex-col items-center text-center space-y-4 py-10 md:py-12">
              <CheckCircle2 className="h-12 w-12 text-emerald-300" />
              <h2 className="text-2xl font-semibold">Application submitted</h2>
              <p className="text-white/70 max-w-xl text-sm md:text-base">
                Thanks for applying. You’ll be redirected to the dietitian login page to sign in with
                Google and continue to your dietitian dashboard.
              </p>
              <Button
                className="bg-white text-black hover:bg-white/90 h-12 px-5"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "/dietitian-login";
                }}
              >
                Go to dietitian login
              </Button>
            </div>
          ) : (
            <>
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold">Step 1: Basic information</h2>
                      <p className="text-white/60 text-sm">
                        Connect Google, then complete your profile basics.
                      </p>
                    </div>
                    <Button
                      onClick={handleGoogle}
                      disabled={connecting || googleConnected}
                      className={`h-12 w-full sm:w-auto px-5 ${
                        googleConnected
                          ? "bg-emerald-500 text-black hover:bg-emerald-400"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {googleConnected ? "Google connected" : connecting ? "Connecting..." : "Continue with Google"}
                    </Button>
                  </div>
                  {error && <div className="text-sm text-red-300">{error}</div>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Full name</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Email address</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Phone number</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                        placeholder="+234 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Date of birth</Label>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                      <Label className="text-white/80 text-sm">Location (City, State)</Label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                      <Label className="text-white/80 text-sm">Profile picture</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                      />
                      {profilePicture && (
                        <div className="text-xs text-white/60 truncate">{profilePicture.name}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <div className="text-sm text-white/60">
                      You must connect Google before continuing.
                    </div>
                    <Button
                      disabled={!stepOneValid}
                      onClick={handleNext}
                      className="bg-white text-black hover:bg-white/90 h-12 w-full sm:w-auto"
                    >
                      Continue to Step 2 →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold">Step 2: Professional details</h2>
                      <p className="text-white/60 text-sm">
                        Four quick questions to validate your credentials.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="border-white/20 text-white hover:bg-white/10 h-11"
                      >
                        ← Back
                      </Button>
                      <Button
                        disabled={!stepTwoValid}
                        onClick={handleNext}
                        className="bg-white text-black hover:bg-white/90 h-11"
                      >
                        Continue to Step 3 →
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">License number</Label>
                      <Input
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
                        placeholder="State-issued license"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Years of experience</Label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full rounded-md bg-[#0b0b0b] border border-[#1f1f1f] text-white px-3 py-3 min-h-[52px]"
                      >
                        <option value="">Select</option>
                        {experiences.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Primary specialization</Label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full rounded-md bg-[#0b0b0b] border border-[#1f1f1f] text-white px-3 py-3 min-h-[52px]"
                      >
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/80 text-sm">Professional bio (100 words max)</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[160px]"
                        placeholder="Briefly describe your background, approach, and focus areas."
                      />
                      <div
                        className={`text-xs ${
                          bioWordCount > 100 ? "text-red-300" : "text-white/60"
                        }`}
                      >
                        {bioWordCount} / 100 words
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold">Step 3: Agreement & submit</h2>
                      <p className="text-white/60 text-sm">
                        Read both documents fully, then confirm to submit.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="border-white/20 text-white hover:bg-white/10 h-11"
                      >
                        ← Back
                      </Button>
                      <Button
                        disabled={!stepThreeValid}
                        className="bg-white text-black hover:bg-white/90 h-11"
                        onClick={handleSubmit}
                      >
                        Submit application
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Terms of Service</Label>
                      <div
                        ref={termsRef}
                        onScroll={() => onScrollCheck(termsRef, setTermsRead)}
                        className="h-44 md:h-52 overflow-y-auto rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] p-4 text-sm text-white/70"
                      >
                        <p className="mb-2">
                          Please review these terms. By applying, you agree to abide by Daiyet&apos;s
                          standards of practice, maintain accurate availability, and honor bookings made
                          by patients. You consent to communication for scheduling, reminders, and
                          compliance needs. You agree to keep patient data confidential and use the
                          platform only for its intended purpose. Violations may lead to suspension or
                          removal. Payments and cancellations will follow platform policies. Continue
                          scrolling to confirm you have read this section.
                        </p>
                        <p>
                          You certify that all information you provide is accurate and up to date. You
                          acknowledge that Daiyet may verify your credentials and take action if any
                          misrepresentation is found. These terms may be updated; continued use indicates
                          acceptance. Please contact support with any questions before proceeding.
                        </p>
                      </div>
                      <div className="text-xs text-white/60">
                        Status: {termsRead ? "read" : "scroll to bottom to mark read"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Privacy Policy</Label>
                      <div
                        ref={privacyRef}
                        onScroll={() => onScrollCheck(privacyRef, setPrivacyRead)}
                        className="h-44 md:h-52 overflow-y-auto rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] p-4 text-sm text-white/70"
                      >
                        <p className="mb-2">
                          We collect your profile, licensing, scheduling, and communications data to
                          operate the platform. We do not sell personal data. Information may be shared
                          with patients for scheduling, with payment processors for payouts, and with
                          compliance vendors as needed. Security measures are applied to protect data,
                          but you should also safeguard your account.
                        </p>
                        <p>
                          You may request data access or deletion as permitted by law. Usage is subject
                          to ongoing compliance and audit. Continue scrolling to confirm you have read
                          this section.
                        </p>
                      </div>
                      <div className="text-xs text-white/60">
                        Status: {privacyRead ? "read" : "scroll to bottom to mark read"}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border border-white/50 bg-transparent"
                    />
                    <span>I have read and understood both documents.</span>
                  </label>

                  <div className="text-xs text-white/60">
                    Submit is disabled until: Google is connected, all fields in Steps 1-2 are
                    completed, both documents are fully read, and the confirmation box is checked.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
