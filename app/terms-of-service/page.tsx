import Link from "next/link";

const lastUpdated = new Date().toLocaleDateString("en-US");

const sections = [
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

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
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
            <h1 className="text-3xl md:text-4xl font-semibold">Terms of Service</h1>
            <p className="text-white/70">Last updated: {lastUpdated}</p>
          </div>
          <p className="text-white/80 leading-relaxed max-w-3xl">
            These terms outline how you can use Daiyet, what you can expect from us, and what we
            expect from you. Please read them carefully before using the platform.
          </p>
        </header>

        <div className="grid gap-6 md:gap-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 shadow-[0_10px_50px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-semibold text-white">{section.title}</h2>
                  <ul className="space-y-2 text-white/80 leading-relaxed">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold text-white">Contact</h2>
          <p className="text-white/80 leading-relaxed">
            For questions about these terms, email{" "}
            <a href="mailto:support@daiyet.com" className="text-amber-200 hover:text-amber-100">
              support@daiyet.com
            </a>
            . We aim to respond within a reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
