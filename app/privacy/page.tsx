export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-white/60">Policy</p>
          <h1 className="mt-2 text-3xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-white/70">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
        </header>

        <section className="space-y-4 text-white/80 leading-relaxed">
          <p>
            We collect only the information needed to operate your scheduling, payments, and care
            coordination experience. This includes profile details, booking history, payment and
            payout data, and uploaded files such as meal plans or enrollment documents.
          </p>
          <p>
            Information is used to deliver services (bookings, reminders, payments), support,
            security, and compliance. We do not sell personal data. Access is limited to authorized
            staff and your assigned providers; third parties are limited to processors required to
            deliver the service (e.g., payments, storage, communications).
          </p>
          <p>
            You may request access, updates, or deletion of your data as permitted by applicable
            law. Data may be retained for legal, auditing, or payment reconciliation purposes.
          </p>
        </section>

        <section className="space-y-3 text-white/80 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">Security & storage</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Data in transit is protected with TLS.</li>
            <li>Sensitive files and payment references are stored securely.</li>
            <li>Access is role-based; admin-only areas are restricted.</li>
          </ul>
        </section>

        <section className="space-y-3 text-white/80 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p>
            For privacy questions or requests, contact support@daiyet.com. We will respond within a
            reasonable timeframe.
          </p>
        </section>
      </div>
    </main>
  );
}
