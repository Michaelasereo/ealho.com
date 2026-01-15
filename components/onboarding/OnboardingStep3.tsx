"use client";

import { useRef, useState } from "react";

interface OnboardingStep3Props {
  termsRead: boolean;
  privacyRead: boolean;
  termsAccepted: boolean;
  onTermsReadChange: (read: boolean) => void;
  onPrivacyReadChange: (read: boolean) => void;
  onTermsAcceptedChange: (accepted: boolean) => void;
}

const TERMS_SECTIONS = [
  {
    title: "Using Daiyet",
    bullets: [
      "Provide accurate information and use the platform only for lawful scheduling and care.",
      "Keep your account secure; you are responsible for activity under your login.",
      "We may update these terms—continuing to use the service means you accept changes.",
    ],
  },
  {
    title: "Bookings, payments, and refunds",
    bullets: [
      "Sessions and meal plans follow the pricing and policies shown at booking time.",
      "Cancellations/refunds follow the rules presented during checkout or by your provider.",
      "Charges, payouts, and fees may be adjusted for fraud prevention or compliance.",
    ],
  },
  {
    title: "Provider obligations",
    bullets: [
      "Dietitians must maintain valid credentials and comply with local laws and standards.",
      "We may verify credentials and pause or remove accounts that breach policy or safety.",
      "Client communications and records should be handled securely and respectfully.",
    ],
  },
  {
    title: "Acceptable use",
    bullets: [
      "No misuse, fraud, harassment, or attempts to disrupt the service.",
      "Do not upload malicious content or attempt unauthorized access.",
      "Respect privacy, confidentiality, and applicable regulations.",
    ],
  },
  {
    title: "Liability",
    bullets: [
      'Service is provided "as is" to the fullest extent permitted by law.',
      "We are not liable for indirect or incidental damages from use of the platform.",
      "Your remedy is to stop using the service; refunds apply only per stated policies.",
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "What we collect",
    bullets: [
      "Profile and account details you provide to use the platform.",
      "Booking, session, and payment records to power scheduling and payouts.",
      "Uploaded files (e.g., plans, documents) and limited technical metadata for security.",
    ],
  },
  {
    title: "How we use data",
    bullets: [
      "To run core features: bookings, reminders, payments, and support.",
      "To protect accounts, prevent fraud, and meet legal or compliance needs.",
      "We do not sell personal data; sharing is limited to essential processors.",
    ],
  },
  {
    title: "Security & storage",
    bullets: [
      "Transport security (TLS) plus secure storage for sensitive items.",
      "Role-based access for admins and providers; activity is monitored.",
      "Data may be retained where required for payments, audits, or legal reasons.",
    ],
  },
  {
    title: "Your choices",
    bullets: [
      "Update your profile and notification preferences anytime.",
      "Request access, export, or deletion where permitted by law.",
      "Contact us to report security concerns or privacy questions.",
    ],
  },
];

export function OnboardingStep3({
  termsRead,
  privacyRead,
  termsAccepted,
  onTermsReadChange,
  onPrivacyReadChange,
  onTermsAcceptedChange,
}: OnboardingStep3Props) {
  const termsRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);

  const checkTermsScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      const reachedBottom = scrollTop + clientHeight >= scrollHeight - 10;
      if (reachedBottom && !termsRead) {
        onTermsReadChange(true);
      }
    }
  };

  const checkPrivacyScroll = () => {
    if (privacyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = privacyRef.current;
      const reachedBottom = scrollTop + clientHeight >= scrollHeight - 10;
      if (reachedBottom && !privacyRead) {
        onPrivacyReadChange(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-32 h-32 mx-auto mb-4 bg-[#1f1f1f] rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Terms & Privacy</h2>
        <p className="text-white/60 text-sm">Please read and accept our terms</p>
      </div>

      <div className="space-y-6">
        {/* Terms of Service */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Terms of Service</h3>
            {termsRead && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Read
              </span>
            )}
          </div>
          <div
            ref={termsRef}
            onScroll={checkTermsScroll}
            className="h-64 overflow-y-auto bg-[#0b0b0b] border border-[#1f1f1f] rounded-lg p-4 space-y-4"
          >
            {TERMS_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                <h4 className="text-sm font-semibold text-white">{section.title}</h4>
                <ul className="space-y-1 text-xs text-white/80">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/60" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsRead}
              onChange={(e) => {
                onTermsReadChange(e.target.checked);
                // Also trigger scroll check in case user checks without scrolling
                if (e.target.checked) {
                  setTimeout(checkTermsScroll, 100);
                }
              }}
              className="w-4 h-4 rounded border-[#1f1f1f] bg-[#0b0b0b] text-white focus:ring-white/20"
            />
            <span className="text-sm text-white/80">I have read the Terms of Service</span>
          </label>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Privacy Policy</h3>
            {privacyRead && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Read
              </span>
            )}
          </div>
          <div
            ref={privacyRef}
            onScroll={checkPrivacyScroll}
            className="h-64 overflow-y-auto bg-[#0b0b0b] border border-[#1f1f1f] rounded-lg p-4 space-y-4"
          >
            {PRIVACY_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                <h4 className="text-sm font-semibold text-white">{section.title}</h4>
                <ul className="space-y-1 text-xs text-white/80">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/60" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyRead}
              onChange={(e) => {
                onPrivacyReadChange(e.target.checked);
                // Also trigger scroll check in case user checks without scrolling
                if (e.target.checked) {
                  setTimeout(checkPrivacyScroll, 100);
                }
              }}
              className="w-4 h-4 rounded border-[#1f1f1f] bg-[#0b0b0b] text-white focus:ring-white/20"
            />
            <span className="text-sm text-white/80">I have read the Privacy Policy</span>
          </label>
        </div>

        {/* Accept Terms */}
        <div className="pt-4 border-t border-[#1f1f1f]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsAcceptedChange(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-[#1f1f1f] bg-[#0b0b0b] text-white focus:ring-white/20"
            />
            <span className="text-sm text-white/90">
              I accept the Terms of Service and Privacy Policy *
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

