import Link from "next/link";

const lastUpdated = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const sections = [
  {
    title: "1. DATA COLLECTION",
    subsections: [
      {
        title: "1.1 Information We Collect",
        bullets: [
          "Personal Data: Name, email, phone, age, location",
          "Health Information: Therapy goals, mental health history",
          "Payment Information: Transaction records",
          "Technical Data: IP address, device information",
        ],
      },
      {
        title: "1.2 How We Collect",
        bullets: [
          "Intake forms",
          "Platform usage",
          "Therapist session notes",
          "Assessments",
        ],
      },
    ],
  },
  {
    title: "2. DATA USE",
    subsections: [
      {
        title: "2.1 Primary Purposes",
        bullets: [
          "Therapist matching and service delivery",
          "Platform operation and improvement",
          "Payment processing",
          "Compliance with legal obligations",
        ],
      },
      {
        title: "2.2 Secondary Purposes",
        bullets: [
          "Anonymous analytics for service improvement",
          "Research (with explicit consent only)",
          "Marketing (with opt-out option)",
        ],
      },
    ],
  },
  {
    title: "3. DATA SHARING",
    subsections: [
      {
        title: "3.1 With Therapists",
        bullets: [
          "Necessary information for therapeutic work",
          "Assessment results and progress notes",
          "Scheduling information",
        ],
      },
      {
        title: "3.2 With Third Parties",
        bullets: [
          "Payment processors: Minimal transaction data",
          "Technical providers: Hosting, analytics",
          "Legal authorities: When required by Nigerian law",
        ],
      },
      {
        title: "3.3 We Do Not Sell Data",
        content: "We never sell personal or health information.",
      },
    ],
  },
  {
    title: "4. DATA SECURITY",
    subsections: [
      {
        title: "4.1 Protection Measures",
        bullets: [
          "End-to-end encryption for sessions",
          "Secure data storage",
          "Regular security audits",
          "Access controls",
        ],
      },
      {
        title: "4.2 Breach Protocol",
        content: "In case of data breach:",
        bullets: [
          "Immediate investigation",
          "Notification to affected users within 72 hours",
          "Report to Nigerian Data Protection Commission",
        ],
      },
    ],
  },
  {
    title: "5. DATA RETENTION",
    subsections: [
      {
        title: "5.1 Retention Periods",
        bullets: [
          "Active client data: Duration of service + 7 years",
          "Inactive accounts: 2 years after last activity",
          "Payment records: 7 years",
        ],
      },
      {
        title: "5.2 Data Deletion",
        content: "Upon request, we will:",
        bullets: [
          "Anonymize data where possible",
          "Delete identifiable information",
          "Retain only legally required records",
        ],
      },
    ],
  },
  {
    title: "6. USER RIGHTS (NDPA 2023)",
    content: "Under Nigeria's Data Protection Act 2023, you have the right to:",
    bullets: [
      "Access your personal data",
      "Request corrections",
      "Withdraw consent",
      "Request deletion",
      "Data portability",
    ],
    footer: "To exercise these rights, email: privacy@ealho.com",
  },
  {
    title: "7. COOKIES & TRACKING",
    subsections: [
      {
        title: "7.1 Types Used",
        bullets: [
          "Essential cookies (platform functionality)",
          "Analytics cookies (anonymous usage data)",
          "Preference cookies (user settings)",
        ],
      },
      {
        title: "7.2 Control Options",
        bullets: [
          "Browser settings to manage cookies",
          "Platform opt-out for non-essential tracking",
        ],
      },
    ],
  },
  {
    title: "8. CHILDREN'S PRIVACY",
    content: "We do not knowingly collect data from minors under 18 without parental consent. Adolescent therapy (13-17 years) requires:",
    bullets: [
      "Parental/guardian consent",
      "Joint account setup",
    ],
  },
  {
    title: "9. CONTACT & COMPLAINTS",
    bullets: [
      "Data Protection Officer: dpo@ealho.com",
      "Regulatory Authority: Nigeria Data Protection Commission",
    ],
  },
  {
    title: "10. POLICY UPDATES",
    content: "We will notify users of material changes via:",
    bullets: [
      "Platform notifications",
      "Email announcements",
      "Updated effective dates",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold">Ealho Therapy - Privacy Policy</h1>
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

                {section.footer && (
                  <p className="text-white/80 leading-relaxed mt-4">
                    {section.footer}
                  </p>
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
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-white">Contact Us</h2>
          <p className="text-white/80 leading-relaxed">
            For privacy requests or questions, email{" "}
            <a href="mailto:privacy@ealho.com" className="text-[#EAF2CF] hover:text-[#d9e5b8] underline">
              privacy@ealho.com
            </a>
            {" "}or{" "}
            <a href="mailto:dpo@ealho.com" className="text-[#EAF2CF] hover:text-[#d9e5b8] underline">
              dpo@ealho.com
            </a>
            . We aim to respond within a reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
