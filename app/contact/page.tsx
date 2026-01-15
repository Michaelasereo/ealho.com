import Link from "next/link";
import { Mail, MessageSquare, MapPin, Clock, ArrowRight } from "lucide-react";
import { SharedNav } from "@/components/layout/SharedNav";
import { SharedFooter } from "@/components/layout/SharedFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#474433] text-white">
      <SharedNav />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Get in Touch
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              We're here to help. Reach out to us for questions, support, or to learn more about our therapy services.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Email */}
              <div className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-md hover:bg-white/10 transition-all text-center">
                <div className="w-16 h-16 rounded-full bg-[#EAF2CF]/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-[#EAF2CF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
                <p className="text-white/70 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:michaelasereoo@gmail.com"
                  className="text-[#EAF2CF] hover:text-[#d9e5b8] font-medium inline-flex items-center gap-2 transition-colors"
                >
                  michaelasereoo@gmail.com
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* General Contact */}
              <div className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-md hover:bg-white/10 transition-all text-center">
                <div className="w-16 h-16 rounded-full bg-[#EAF2CF]/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-[#EAF2CF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">General Inquiries</h3>
                <p className="text-white/70 mb-4">
                  For general questions about our services and pricing.
                </p>
                <a
                  href="mailto:michaelasereoo@gmail.com"
                  className="text-[#EAF2CF] hover:text-[#d9e5b8] font-medium inline-flex items-center gap-2 transition-colors"
                >
                  hello@ealho.com
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Support */}
              <div className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-sm hover:shadow-md hover:bg-white/10 transition-all text-center">
                <div className="w-16 h-16 rounded-full bg-[#EAF2CF]/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-[#EAF2CF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Support</h3>
                <p className="text-white/70 mb-4">
                  Need help with your account or booking? We're here for you.
                </p>
                <a
                  href="mailto:michaelasereoo@gmail.com"
                  className="text-[#EAF2CF] hover:text-[#d9e5b8] font-medium inline-flex items-center gap-2 transition-colors"
                >
                  Contact Support
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              <form className="space-y-6" action="mailto:michaelasereoo@gmail.com" method="post" encType="text/plain">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#EAF2CF] transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#EAF2CF] transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#EAF2CF] transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#EAF2CF] transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#EAF2CF] hover:bg-[#d9e5b8] text-[#3a3628] py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="container mx-auto px-6 py-12 bg-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#EAF2CF]" />
                  Response Time
                </h3>
                <p className="text-white/80">
                  We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please mention "URGENT" in your subject line.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#EAF2CF]" />
                  Office Hours
                </h3>
                <p className="text-white/80">
                  <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM WAT<br />
                  <strong>Saturday:</strong> 10:00 AM - 4:00 PM WAT<br />
                  <strong>Sunday:</strong> Closed
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
