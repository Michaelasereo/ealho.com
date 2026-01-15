import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Can I upgrade from Access to Deep Intensive later?",
    answer: "Yes! Many clients start with Access and upgrade as they progress. We'll credit your remaining sessions.",
  },
  {
    question: "What if I don't connect with my therapist?",
    answer: "Access: One free therapist change. Deep Intensive: Choose initially or switch once free.",
  },
  {
    question: "Are the packages refundable?",
    answer: "No, all packages are non-refundable and non-transferable, as stated in our Terms.",
  },
  {
    question: "Can I extend my package validity?",
    answer: "Yes, for medical or emergency reasons with documentation.",
  },
  {
    question: "Do you offer payment plans?",
    answer: "Currently single payments only. Contact us for corporate or special arrangement inquiries.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers to Prospa (0120103991, THE MICHAEL'S JOURNAL), Paystack payment gateway, and other approved payment methods.",
  },
  {
    question: "How do I reschedule a session?",
    answer: "Ealho Access: 24-hour notice required for rescheduling. Ealho Deep Intensive: 6-hour notice required for rescheduling.",
  },
  {
    question: "What happens if I miss a session?",
    answer: "No refunds for missed sessions. Late cancellations forfeit the session fee.",
  },
  {
    question: "Is Ealho Therapy an emergency service?",
    answer: "No, EALHO THERAPY IS NOT AN EMERGENCY SERVICE. In crisis situations, call 112 (Nigeria Emergency Services), go to the nearest hospital, or contact a crisis hotline.",
  },
  {
    question: "Do you guarantee therapeutic outcomes?",
    answer: "We do not guarantee specific therapeutic outcomes. Progress depends on multiple factors.",
  },
  {
    question: "What information is shared with my therapist?",
    answer: "We share necessary information for therapeutic work, including assessment results, progress notes, and scheduling information.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use end-to-end encryption for sessions, secure data storage, regular security audits, and access controls. We are NDPA 2023 compliant.",
  },
  {
    question: "Can I request my data to be deleted?",
    answer: "Yes, under Nigeria's Data Protection Act 2023, you have the right to request deletion. Contact privacy@ealho.com to exercise this right.",
  },
  {
    question: "Do you offer in-person sessions?",
    answer: "Yes, Deep Intensive package includes in-person option at Lagos VI location.",
  },
  {
    question: "How do I book a session?",
    answer: "Simply choose your plan, complete the quick intake form, and book your first session. Need help? Contact us at hello@ealho.com or book a free 15-minute consultation.",
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-white text-[#3a3628]">
      {/* Header */}
      <header className="border-b border-[#3a3628]/10 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/ealho logo.png"
              alt="Ealho"
              width={180}
              height={48}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[#3a3628]/70 hover:text-[#3a3628] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3a3628]">
              ❓ Frequently Asked Questions
            </h1>
            <p className="text-lg text-[#3a3628]/80 max-w-2xl mx-auto">
              Find answers to common questions about Ealho Therapy services, pricing, and policies.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-lg border border-[#3a3628]/20 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-[#3a3628] pr-8">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 text-[#3a3628]/60 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-[#3a3628]/80 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center bg-[#EAF2CF]/20 rounded-2xl p-12 space-y-6">
            <h2 className="text-3xl font-bold text-[#3a3628]">Still Have Questions?</h2>
            <p className="text-lg text-[#3a3628]/80">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:michaelasereoo@gmail.com"
                className="bg-[#3a3628] hover:bg-[#474433] text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Contact Us
              </a>
              <Link
                href="/therapy"
                className="border-2 border-[#3a3628] text-[#3a3628] hover:bg-[#3a3628] hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3a3628]/10 bg-[#3a3628] text-white/70">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm">
            <p>© {new Date().getFullYear()} Ealho Therapy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
