export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-white/60">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-white/70">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
        </header>

        <section className="space-y-4 text-white/80 leading-relaxed">
          <p>
            By using Daiyet, you agree to these terms. You must provide accurate information and use
            the platform only for lawful scheduling, payments, and delivery of services. We may
            update these terms; continued use means acceptance of updates.
          </p>
          <p>
            Bookings and payments: sessions and meal plans are subject to availability and applicable
            fees. Cancellations and refunds follow the policies presented at the time of booking.
            You are responsible for keeping your account secure and for all activity under it.
          </p>
          <p>
            Providers: dietitians must maintain valid credentials and comply with applicable laws and
            professional standards. We may verify credentials and suspend accounts that violate these
            terms or user safety.
          </p>
        </section>

        <section className="space-y-3 text-white/80 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">Acceptable use</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>No misuse, fraud, or interference with platform operations.</li>
            <li>No uploading of malicious content or unauthorized data access.</li>
            <li>Respect privacy, confidentiality, and applicable regulations.</li>
          </ul>
        </section>

        <section className="space-y-3 text-white/80 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">Limitation of liability</h2>
          <p>
            The service is provided “as is.” To the fullest extent permitted by law, Daiyet is not
            liable for indirect or incidental damages arising from use of the platform. Your remedies
            are limited to discontinuing use and, where applicable, refunds per stated policies.
          </p>
        </section>

        <section className="space-y-3 text-white/80 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p>
            For questions about these terms, contact support@daiyet.com. We will respond within a
            reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
