const lastUpdated = new Date().toLocaleDateString("en-US");

const sections = [
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/70">
            Policy
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold">Privacy Policy</h1>
            <p className="text-white/70">Last updated: {lastUpdated}</p>
          </div>
          <p className="text-white/80 leading-relaxed max-w-3xl">
            We handle your data to deliver care, bookings, and payments securely. This page
            explains what we collect, how we use it, and the choices you have.
          </p>
        </header>

        <div className="grid gap-6 md:gap-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 md:px-8 py-6 md:py-7 shadow-[0_10px_50px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
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
            For privacy requests or questions, email{" "}
            <a href="mailto:support@daiyet.com" className="text-emerald-300 hover:text-emerald-200">
              support@daiyet.com
            </a>
            . We aim to respond within a reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
