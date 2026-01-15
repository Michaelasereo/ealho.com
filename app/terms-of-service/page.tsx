import Link from "next/link";

const lastUpdated = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const sections = [
  {
    title: "1. AGREEMENT TO TERMS",
    content: "These Terms of Service (\"Terms\") constitute a legally binding agreement between you (\"User\", \"Client\") and Ealho Therapy (\"we\", \"us\", \"our\", \"Platform\"), operated by THE MICHAEL'S JOURNAL. By accessing our platform at www.ealho.com and using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.",
  },
  {
    title: "2. SERVICES DESCRIPTION",
    content: "Ealho Therapy provides an online platform connecting clients with licensed mental health professionals (\"Therapists\") in Nigeria. We offer two service tiers:",
    subsections: [
      {
        title: "2.1 Ealho Access (Starting from ₦10,000 per session)",
        bullets: [
          "45-minute virtual therapy sessions",
          "Therapist assigned by our matching system",
          "Basic platform features",
        ],
      },
      {
        title: "2.2 Ealho Deep Intensive Care (Starting from ₦50,000 per session)",
        bullets: [
          "60-90 minute flexible sessions",
          "Therapist selection option",
          "Additional features including between-session Q&A and assessments",
        ],
      },
    ],
  },
  {
    title: "3. USER ELIGIBILITY",
    content: "To use our services, you must:",
    bullets: [
      "Be at least 18 years old (or 13-17 with parental consent)",
      "Be located in Nigeria or jurisdictions where our services are legally permitted",
      "Have the legal capacity to enter into binding contracts",
      "Provide accurate and complete registration information",
    ],
  },
  {
    title: "4. PAYMENT TERMS",
    subsections: [
      {
        title: "4.1 Fees",
        bullets: [
          "All fees are in Nigerian Naira (₦)",
          "Session packages are non-refundable and non-transferable",
          "Platform fees are disclosed during booking",
        ],
      },
      {
        title: "4.2 Payment Methods",
        content: "We accept payments through:",
        bullets: [
          "Bank transfer to Prospa (0120103991, THE MICHAEL'S JOURNAL)",
          "Paystack payment gateway",
          "Other approved payment methods",
        ],
      },
      {
        title: "4.3 Rescheduling & Cancellation",
        bullets: [
          "Ealho Access: 24-hour notice required for rescheduling",
          "Ealho Deep Intensive: 6-hour notice required for rescheduling",
          "Late cancellations forfeit the session fee",
          "No refunds for missed sessions",
        ],
      },
    ],
  },
  {
    title: "5. THERAPIST-CLIENT RELATIONSHIP",
    subsections: [
      {
        title: "5.1 No Immediate Relationship",
        content: "Submitting an intake form does not establish a therapist-client relationship. This relationship is formed only when:",
        bullets: [
          "Both parties mutually agree to work together",
          "Informed consent is completed",
          "Payment is verified for the first session",
        ],
      },
      {
        title: "5.2 Therapist Independence",
        content: "Therapists on our platform are independent professionals. We facilitate connections but do not:",
        bullets: [
          "Control therapeutic methods or decisions",
          "Guarantee specific outcomes",
          "Assume liability for therapeutic interventions",
        ],
      },
    ],
  },
  {
    title: "6. LIMITATIONS OF SERVICE",
    subsections: [
      {
        title: "6.1 NOT EMERGENCY SERVICES",
        content: "EALHO THERAPY IS NOT AN EMERGENCY SERVICE. In crisis situations:",
        bullets: [
          "Call 112 (Nigeria Emergency Services)",
          "Go to the nearest hospital",
          "Contact a crisis hotline",
        ],
      },
      {
        title: "6.2 No Guarantee of Results",
        content: "We do not guarantee specific therapeutic outcomes. Progress depends on multiple factors.",
      },
    ],
  },
  {
    title: "7. USER RESPONSIBILITIES",
    content: "You agree to:",
    bullets: [
      "Provide accurate information",
      "Use services only for personal therapeutic purposes",
      "Not record sessions without consent",
      "Respect therapist boundaries",
      "Not engage in abusive behavior",
    ],
  },
  {
    title: "8. TERMINATION",
    content: "We may terminate access for:",
    bullets: [
      "Violation of these Terms",
      "Fraudulent activity",
      "Non-payment",
      "Abuse of platform or therapists",
    ],
  },
  {
    title: "9. LIMITATION OF LIABILITY",
    content: "To the extent permitted by Nigerian law, we shall not be liable for:",
    bullets: [
      "Indirect, incidental, or consequential damages",
      "Therapist actions or omissions",
      "Technical issues or service interruptions",
    ],
  },
  {
    title: "10. GOVERNING LAW",
    content: "These Terms are governed by Nigerian law. Disputes shall be resolved in Lagos State, Nigeria.",
  },
];

const legalClauses = [
  {
    title: "Arbitration Clause",
    content: "Any dispute arising from these Terms shall be resolved through binding arbitration in Lagos, Nigeria, under Nigerian Arbitration and Conciliation Act.",
  },
  {
    title: "Disclaimer of Warranties",
    content: "Services are provided 'as is' without warranties of merchantability or fitness for particular purpose.",
  },
  {
    title: "Indemnification",
    content: "User agrees to indemnify Ealho Therapy against claims arising from user's violation of these Terms.",
  },
  {
    title: "Force Majeure",
    content: "We are not liable for delays or failures due to circumstances beyond reasonable control.",
  },
  {
    title: "Severability",
    content: "If any provision is found invalid, remaining provisions remain in effect.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#474433] via-[#3a3628] to-[#474433] text-white">
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Home
        </Link>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/70">
            Legal
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold">Ealho Therapy - Terms of Service</h1>
            <p className="text-white/70">Effective Date: {lastUpdated}</p>
          </div>
        </header>

        <div className="grid gap-6 md:gap-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 shadow-[0_10px_50px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold text-white">{section.title}</h2>
                
                {section.content && (
                  <p className="text-white/80 leading-relaxed">{section.content}</p>
                )}

                {section.bullets && (
                  <ul className="space-y-2 text-white/80 leading-relaxed">
                    {section.bullets.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#EAF2CF]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && (
                  <div className="space-y-4 mt-4">
                    {section.subsections.map((subsection, idx) => (
                      <div key={idx} className="pl-4 border-l-2 border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-2">{subsection.title}</h3>
                        {subsection.content && (
                          <p className="text-white/80 leading-relaxed mb-2">{subsection.content}</p>
                        )}
                        {subsection.bullets && (
                          <ul className="space-y-2 text-white/80 leading-relaxed">
                            {subsection.bullets.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex gap-2">
                                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#EAF2CF]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-white">Key Legal Clauses</h2>
            <div className="space-y-4">
              {legalClauses.map((clause, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-[#EAF2CF]">
                  <h3 className="text-lg font-semibold text-white mb-1">{clause.title}</h3>
                  <p className="text-white/80 leading-relaxed">{clause.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-white">11. CONTACT INFORMATION</h2>
          <p className="text-white/80 leading-relaxed">
            For questions about these terms, email{" "}
            <a href="mailto:hello@ealho.com" className="text-[#EAF2CF] hover:text-[#d9e5b8] underline">
              hello@ealho.com
            </a>
            . We aim to respond within a reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
