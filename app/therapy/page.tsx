import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { SharedNav } from "@/components/layout/SharedNav";
import { SharedFooter } from "@/components/layout/SharedFooter";

const pricingTiers = [
  {
    name: "Ealho Access",
    price: "₦10,000",
    period: "per session",
    description: "Perfect for first-time therapy, stress management, anxiety, relationship issues, personal growth",
    features: [
      "45-minute virtual therapy",
      "Assigned therapist (best-fit matching)",
      "Secure video platform",
      "Session notes & progress tracking",
    ],
    buttonText: "BOOK SINGLE ACCESS SESSION",
    buttonLink: "/therapy/book",
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-400/30",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Ealho Deep Intensive",
    price: "₦50,000",
    period: "per session",
    description: "Perfect for trauma work, childhood patterns, executive coaching, rapid transformation, complex issues",
    features: [
      "60-90 minute flexible sessions",
      "Choose your therapist",
      "Weekly Q&A access",
      "Monthly progress assessments",
      "Priority scheduling",
      "In-person option (Lagos VI)",
    ],
    buttonText: "BOOK SINGLE DEEP INTENSIVE SESSION",
    buttonLink: "/therapy/book",
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-400/30",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    popular: true,
  },
];

const packages = [
  {
    name: "Access 4-Session Package",
    originalPrice: "₦40,000",
    discountedPrice: "₦40,000",
    savings: "₦5,000",
    perSession: "₦8,500",
    validity: "3 months from purchase",
    description: "Best for: Building momentum, addressing specific goals, developing skills",
    features: [
      "4 × 45-minute therapy sessions",
      "Consistent work with same therapist",
      "Structured progress tracking",
      "All Access tier features",
      "FREE: Digital therapy journal template",
    ],
    buttonText: "GET ACCESS PACKAGE (SAVE ₦5,000)",
    buttonLink: "/therapy/book",
  },
  {
    name: "Deep Intensive 4-Session Package",
    originalPrice: "₦225,000",
    discountedPrice: "₦200,000",
    savings: "₦25,000",
    perSession: "₦50,000",
    validity: "4 months from purchase",
    description: "Best for: Deep work commitment, complex trauma, major life transitions, executive development",
    features: [
      "4 × flexible 60-90 minute sessions",
      "Therapist choice and continuity",
      "Weekly Q&A access throughout",
      "Monthly progress assessments",
      "All Deep Intensive premium features",
      "FREE: Premium therapy journal + 1 free therapist switch",
    ],
    buttonText: "GET DEEP INTENSIVE PACKAGE (SAVE ₦25,000)",
    buttonLink: "/therapy/book",
    popular: true,
  },
];

const comparisonFeatures = [
  { feature: "Session Length", access: "45 minutes", deep: "60-90 minutes (flexible)" },
  { feature: "Therapist Selection", access: "Expert-matched by our team", deep: "Choose your therapist + switching option" },
  { feature: "Between-Session Support", access: "None", deep: "15-minute weekly Q&A access" },
  { feature: "Progress Tracking", access: "Basic goals", deep: "Monthly assessments + insights report" },
  { feature: "Rescheduling Notice", access: "24 hours", deep: "6 hours" },
  { feature: "Session Format", access: "Virtual only", deep: "Virtual + In-person options (Lagos VI)" },
  { feature: "Best For", access: "Starting therapy, specific issues, budget-conscious healing", deep: "Deep transformation, complex concerns, accelerated growth" },
];

export default function TherapyPage() {
  return (
    <div className="min-h-screen bg-[#474433] text-white">
      <SharedNav />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              💫 Your Healing Journey, Your Choice
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              At Ealho, we believe therapy should be accessible yet transformative. Choose the path that fits your needs, budget, and goals.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">📊 COMPARE OUR TIERS</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-white/20 rounded-lg overflow-hidden bg-white/5">
                <thead>
                  <tr className="bg-white/10">
                    <th className="border border-white/20 p-4 text-left font-semibold text-white">Feature</th>
                    <th className="border border-white/20 p-4 text-center font-semibold text-white">Ealho Access</th>
                    <th className="border border-white/20 p-4 text-center font-semibold text-white bg-[#EAF2CF]/20">Ealho Deep Intensive</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/5" : "bg-white/2"}>
                      <td className="border border-white/20 p-4 font-medium text-white">{item.feature}</td>
                      <td className="border border-white/20 p-4 text-center text-white/80">{item.access}</td>
                      <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">{item.deep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Single Session Pricing */}
        <section className="container mx-auto px-6 py-12 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">💰 SINGLE SESSION PRICING</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl border-2 ${tier.borderColor} bg-gradient-to-br ${tier.color} backdrop-blur-sm p-8 shadow-lg ${tier.popular ? "ring-4 ring-[#EAF2CF] ring-offset-2 ring-offset-[#474433]" : ""}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#EAF2CF] text-[#3a3628] px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{tier.price}</span>
                        <span className="text-white/70">{tier.period}</span>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed">{tier.description}</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-[#EAF2CF] mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.buttonLink}
                      className={`block w-full ${tier.buttonColor} text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors mt-6`}
                    >
                      {tier.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">🎁 SAVE MORE WITH OUR PACKAGES</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl border-2 ${pkg.popular ? "border-[#EAF2CF] ring-4 ring-[#EAF2CF]/30 ring-offset-2 ring-offset-[#474433]" : "border-white/20"} bg-white/5 backdrop-blur-sm p-8 shadow-lg`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#EAF2CF] text-[#3a3628] px-4 py-1 rounded-full text-sm font-semibold">
                      Best Value
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{pkg.discountedPrice}</span>
                        {pkg.originalPrice !== pkg.discountedPrice && (
                          <span className="text-lg text-white/50 line-through">{pkg.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-[#EAF2CF] text-[#3a3628] px-2 py-1 rounded">Save {pkg.savings}</span>
                        <span className="text-white/70">That's {pkg.perSession} per session!</span>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed font-medium">{pkg.description}</p>
                    <p className="text-sm text-white/70">Validity: {pkg.validity}</p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-[#EAF2CF] mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={pkg.buttonLink}
                      className="block w-full bg-[#EAF2CF] hover:bg-[#d9e5b8] text-[#3a3628] text-center py-3 px-6 rounded-lg font-semibold transition-colors mt-6"
                    >
                      {pkg.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Package Comparison */}
        <section className="container mx-auto px-6 py-12 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">📈 PACKAGE COMPARISON AT A GLANCE</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-white/20 rounded-lg overflow-hidden bg-white/5">
                <thead>
                  <tr className="bg-white/10">
                    <th className="border border-white/20 p-4 text-left font-semibold text-white">Package Benefit</th>
                    <th className="border border-white/20 p-4 text-center font-semibold text-white">Access Package</th>
                    <th className="border border-white/20 p-4 text-center font-semibold text-white bg-[#EAF2CF]/20">Deep Intensive Package</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/5">
                    <td className="border border-white/20 p-4 font-medium text-white">Total Savings</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">₦5,000</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">₦25,000</td>
                  </tr>
                  <tr className="bg-white/2">
                    <td className="border border-white/20 p-4 font-medium text-white">Per Session Cost</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">₦8,500</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">₦50,000</td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="border border-white/20 p-4 font-medium text-white">Therapist Consistency</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">✓ Same therapist</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">✓ Same therapist</td>
                  </tr>
                  <tr className="bg-white/2">
                    <td className="border border-white/20 p-4 font-medium text-white">Extended Features</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">Digital journal</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">Premium journal + assessments</td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="border border-white/20 p-4 font-medium text-white">Validity Period</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">3 months</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">4 months</td>
                  </tr>
                  <tr className="bg-white/2">
                    <td className="border border-white/20 p-4 font-medium text-white">Flexibility</td>
                    <td className="border border-white/20 p-4 text-center text-white/80">Standard</td>
                    <td className="border border-white/20 p-4 text-center text-white/80 bg-[#EAF2CF]/10">Enhanced (therapist switch option)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to Choose */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">🎯 HOW TO CHOOSE</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-6 py-4 bg-blue-500/20 rounded-r-lg">
                <h3 className="font-semibold text-white mb-2">"I'm new to therapy or have specific goals"</h3>
                <p className="text-white/80 mb-3">→ Choose Ealho Access Package</p>
                <p className="text-white/70 text-sm">Get consistent support at an accessible price. Perfect for building coping skills and addressing targeted issues.</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-6 py-4 bg-purple-500/20 rounded-r-lg">
                <h3 className="font-semibold text-white mb-2">"I want profound, accelerated transformation"</h3>
                <p className="text-white/80 mb-3">→ Choose Deep Intensive Package</p>
                <p className="text-white/70 text-sm">Invest in deep work with premium features. Ideal for complex concerns and rapid personal growth.</p>
              </div>
              <div className="border-l-4 border-[#EAF2CF] pl-6 py-4 bg-[#EAF2CF]/20 rounded-r-lg">
                <h3 className="font-semibold text-white mb-2">"I'm not sure which is right for me"</h3>
                <p className="text-white/80 mb-3">→ Book a Free 15-Minute Consultation</p>
                <p className="text-white/70 text-sm">Talk to our team about your goals and get personalized recommendations.</p>
                <Link
                  href="/contact"
                  className="inline-block mt-3 text-[#EAF2CF] hover:text-[#d9e5b8] font-medium"
                >
                  BOOK FREE CONSULTATION →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-6 py-12 bg-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">✅ WHAT'S INCLUDED FOR EVERYONE</h2>
            <p className="text-center text-white/80 mb-6 font-medium">All plans include:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Licensed, vetted Nigerian therapists",
                "Secure, encrypted platform (NDPA compliant)",
                "Cultural competence and understanding",
                "Professional ethics and confidentiality",
                "Easy online booking and scheduling",
                "Session reminders and follow-ups",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#EAF2CF] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#EAF2CF]/20 to-[#d9e5b8]/20 rounded-2xl p-12 space-y-6 border border-[#EAF2CF]/30">
            <h2 className="text-3xl font-bold text-white">🚀 READY TO BEGIN?</h2>
            <p className="text-lg text-white/80 mb-6">Simple 3-Step Process:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-full bg-[#EAF2CF] text-[#3a3628] flex items-center justify-center font-bold">1</div>
                <span className="font-medium">Choose your plan above</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-full bg-[#EAF2CF] text-[#3a3628] flex items-center justify-center font-bold">2</div>
                <span className="font-medium">Complete quick intake form</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-full bg-[#EAF2CF] text-[#3a3628] flex items-center justify-center font-bold">3</div>
                <span className="font-medium">Book your first session</span>
              </div>
            </div>
            <p className="text-white/80 mb-4">Need help deciding?</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <a href="mailto:michaelasereoo@gmail.com" className="text-[#EAF2CF] hover:text-[#d9e5b8] flex items-center gap-2">
                📧 hello@ealho.com
              </a>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-sm text-white/70 italic mb-4">
              "The best time to start healing was yesterday. The second best time is today."
            </p>
            <p className="text-xs text-white/60">
              Note: Prices are in Nigerian Naira (₦). Launch pricing valid for first 50 clients. Terms and conditions apply.
            </p>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
