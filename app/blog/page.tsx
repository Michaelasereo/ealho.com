import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

// Placeholder blog posts - replace with actual content when available
const blogPosts = [
  {
    id: 1,
    title: "Understanding Mental Health in Nigeria",
    excerpt: "Exploring the unique challenges and opportunities for mental health support in Nigeria, and how therapy can make a difference.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Mental Health",
    image: "/placeholder-blog.jpg",
    slug: "understanding-mental-health-nigeria",
  },
  {
    id: 2,
    title: "The Benefits of Virtual Therapy",
    excerpt: "How online therapy sessions are making mental health support more accessible and convenient for Nigerians.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Therapy",
    image: "/placeholder-blog.jpg",
    slug: "benefits-virtual-therapy",
  },
  {
    id: 3,
    title: "Choosing the Right Therapist for You",
    excerpt: "A guide to finding a therapist who understands your needs, cultural background, and therapeutic goals.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Therapy",
    image: "/placeholder-blog.jpg",
    slug: "choosing-right-therapist",
  },
  {
    id: 4,
    title: "Managing Stress and Anxiety: Practical Tips",
    excerpt: "Evidence-based strategies for managing daily stress and anxiety, tailored for Nigerian professionals and students.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Wellness",
    image: "/placeholder-blog.jpg",
    slug: "managing-stress-anxiety",
  },
  {
    id: 5,
    title: "Therapy vs. Counseling: What's the Difference?",
    excerpt: "Understanding the distinctions between therapy and counseling to help you make informed decisions about your mental health journey.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Education",
    image: "/placeholder-blog.jpg",
    slug: "therapy-vs-counseling",
  },
  {
    id: 6,
    title: "Breaking the Stigma: Mental Health in Nigerian Culture",
    excerpt: "How we can work together to reduce mental health stigma and create a more supportive environment for seeking help.",
    author: "Ealho Team",
    date: "Coming Soon",
    category: "Culture",
    image: "/placeholder-blog.jpg",
    slug: "breaking-mental-health-stigma",
  },
];

const categories = ["All", "Mental Health", "Therapy", "Wellness", "Education", "Culture"];

export default function BlogPage() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a3628]/20 bg-[#EAF2CF]/20 px-4 py-2">
              <BookOpen className="h-4 w-4 text-[#3a3628]" />
              <span className="text-sm font-medium text-[#3a3628]">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#3a3628]">
              Insights & Resources
            </h1>
            <p className="text-lg text-[#3a3628]/80 max-w-2xl mx-auto">
              Explore our articles on mental health, therapy, wellness, and personal growth. Written by experts and designed for the Nigerian context.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full border border-[#3a3628]/20 bg-white hover:bg-[#EAF2CF]/20 text-[#3a3628] text-sm font-medium transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {blogPosts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-[#3a3628]/30 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#3a3628] mb-2">Coming Soon</h2>
                <p className="text-[#3a3628]/70">
                  We're working on bringing you valuable content. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group rounded-lg border border-[#3a3628]/20 bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#EAF2CF] to-[#d9e5b8] relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-[#3a3628]/20" />
                      </div>
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-xs text-[#3a3628]/60">
                        <span className="px-2 py-1 rounded bg-[#EAF2CF]/30 text-[#3a3628] font-medium">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#3a3628] group-hover:text-[#474433] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-[#3a3628]/70 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-[#3a3628]/60">By {post.author}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="flex items-center gap-2 text-sm font-medium text-[#3a3628] hover:text-[#474433] transition-colors group/link"
                        >
                          Read more
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#EAF2CF] to-[#d9e5b8] rounded-2xl p-12 space-y-6">
            <h2 className="text-3xl font-bold text-[#3a3628]">Stay Updated</h2>
            <p className="text-lg text-[#3a3628]/80">
              Subscribe to our newsletter to get the latest articles and mental health tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-[#3a3628]/20 bg-white text-[#3a3628] focus:outline-none focus:ring-2 focus:ring-[#EAF2CF]"
              />
              <button className="bg-[#3a3628] hover:bg-[#474433] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
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
