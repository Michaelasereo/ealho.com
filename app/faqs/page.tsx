import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SharedNav } from "@/components/layout/SharedNav";
import { SharedFooter } from "@/components/layout/SharedFooter";

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
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers to Prospa (0120103991, THE MICHAEL'S JOURNAL), Paystack payment gateway, and other approved payment methods.",
  },
  {
    question: "Is Ealho Therapy an emergency service?",
    answer: "No, EALHO THERAPY IS NOT AN EMERGENCY SERVICE. In crisis situations, call 112 (Nigeria Emergency Services), go to the nearest hospital, or contact a crisis hotline.",
  },
  {
    question: "How do I book a session?",
    answer: "Simply choose your plan, complete the quick intake form, and book your first session. Need help? Contact us at hello@ealho.com or book a free 15-minute consultation.",
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-[#474433] text-white">
      <SharedNav />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ❓ Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
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
                className="group rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-lg transition-all"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-white pr-8">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 text-white/60 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#EAF2CF]/20 to-[#d9e5b8]/20 rounded-2xl p-12 space-y-6 border border-[#EAF2CF]/30">
            <h2 className="text-3xl font-bold text-white">Still Have Questions?</h2>
            <p className="text-lg text-white/80">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:michaelasereoo@gmail.com"
                className="bg-[#EAF2CF] hover:bg-[#d9e5b8] text-[#3a3628] px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Contact Us
              </a>
              <Link
                href="/therapy"
                className="border-2 border-[#EAF2CF] text-[#EAF2CF] hover:bg-[#EAF2CF] hover:text-[#3a3628] px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
