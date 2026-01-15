import { SharedNav } from "@/components/layout/SharedNav";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Heart, Users, Shield, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#474433] text-white">
      <SharedNav />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              About Ealho Therapy
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Making mental health support accessible, culturally relevant, and transformative for Nigerians.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-8 md:p-12 space-y-6">
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                At Ealho Therapy, we believe that mental health support should be accessible, culturally competent, and tailored to the unique needs of Nigerians. We're building a platform that connects individuals with licensed therapists who understand the cultural context, challenges, and opportunities of mental health in Nigeria.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                Our mission is to break down barriers to mental health care, reduce stigma, and empower individuals to take control of their mental wellness journey.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-6 py-12 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
                <Heart className="h-12 w-12 text-[#EAF2CF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Compassion</h3>
                <p className="text-white/70 text-sm">We approach every interaction with empathy and understanding.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
                <Users className="h-12 w-12 text-[#EAF2CF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Accessibility</h3>
                <p className="text-white/70 text-sm">Making quality mental health care available to all Nigerians.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
                <Shield className="h-12 w-12 text-[#EAF2CF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Privacy</h3>
                <p className="text-white/70 text-sm">Your data and sessions are protected with the highest security standards.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
                <Target className="h-12 w-12 text-[#EAF2CF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Excellence</h3>
                <p className="text-white/70 text-sm">We maintain the highest standards in therapy and platform quality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Ealho */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Ealho?</h2>
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">🇳🇬 Built for Nigeria</h3>
                <p className="text-white/80">
                  Our platform is designed with Nigerian internet conditions, cultural context, and payment preferences in mind. We understand the unique challenges and opportunities in the Nigerian mental health landscape.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">👥 Licensed Therapists</h3>
                <p className="text-white/80">
                  All our therapists are licensed, vetted, and experienced professionals who understand the Nigerian context. We ensure cultural competence and professional excellence.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">🔒 Privacy & Security</h3>
                <p className="text-white/80">
                  We are NDPA 2023 compliant and use end-to-end encryption to protect your data. Your privacy and confidentiality are our top priorities.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">💰 Affordable Options</h3>
                <p className="text-white/80">
                  We offer flexible pricing tiers to make therapy accessible. From Ealho Access starting at ₦10,000 to Deep Intensive packages, there's an option for every budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#EAF2CF]/20 to-[#d9e5b8]/20 rounded-2xl p-12 space-y-6 border border-[#EAF2CF]/30">
            <h2 className="text-3xl font-bold text-white">Ready to Start Your Journey?</h2>
            <p className="text-lg text-white/80">
              Join thousands of Nigerians who are taking control of their mental health with Ealho Therapy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSf_aIC5Z0Ir27XaqX9j2sxvr5trYpFwGPMUhZbhln3IUNNe6Q/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#EAF2CF] hover:bg-[#d9e5b8] text-[#3a3628] px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Get Started
              </a>
              <a
                href="mailto:michaelasereoo@gmail.com"
                className="border-2 border-[#EAF2CF] text-[#EAF2CF] hover:bg-[#EAF2CF] hover:text-[#3a3628] px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
