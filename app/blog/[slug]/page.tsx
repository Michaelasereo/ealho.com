import Link from "next/link";
import { Calendar, ArrowLeft, User, Share2 } from "lucide-react";
import { SharedNav } from "@/components/layout/SharedNav";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { notFound } from "next/navigation";

// This would typically come from a CMS or database
const blogPosts: Record<string, {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image?: string;
  slug: string;
}> = {
  "understanding-mental-health-nigeria": {
    id: 1,
    title: "Understanding Mental Health in Nigeria",
    excerpt: "Exploring the unique challenges and opportunities for mental health support in Nigeria, and how therapy can make a difference.",
    content: `
      <p class="mb-4">Mental health awareness in Nigeria has been growing steadily over the past decade, yet significant challenges remain. Understanding these challenges is the first step toward creating a more supportive environment for mental wellness.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">The Current Landscape</h2>
      <p class="mb-4">Nigeria faces unique challenges in mental health care, including limited access to professional services, cultural stigma, and economic barriers. However, there's also growing recognition of the importance of mental wellness, especially among younger generations.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Breaking Down Barriers</h2>
      <p class="mb-4">Therapy can play a crucial role in addressing mental health concerns, but accessibility remains a key issue. Online therapy platforms like Ealho are working to bridge this gap by making professional mental health support more accessible and affordable.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Cultural Considerations</h2>
      <p class="mb-4">Understanding Nigerian cultural context is essential for effective therapy. Our therapists are trained to work within cultural frameworks while providing evidence-based therapeutic interventions.</p>
      
      <p class="mb-4">If you're considering therapy, know that seeking help is a sign of strength, not weakness. Taking the first step toward better mental health is an investment in yourself and your future.</p>
    `,
    author: "Ealho Team",
    date: "January 15, 2024",
    category: "Mental Health",
    slug: "understanding-mental-health-nigeria",
  },
  "benefits-virtual-therapy": {
    id: 2,
    title: "The Benefits of Virtual Therapy",
    excerpt: "How online therapy sessions are making mental health support more accessible and convenient for Nigerians.",
    content: `
      <p class="mb-4">Virtual therapy has revolutionized mental health care, making professional support accessible to more people than ever before. For Nigerians, this is particularly significant given the challenges of traditional in-person therapy.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Accessibility</h2>
      <p class="mb-4">One of the biggest advantages of virtual therapy is accessibility. You can attend sessions from anywhere with an internet connection, eliminating the need for long commutes or finding time to visit a therapist's office.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Convenience</h2>
      <p class="mb-4">Virtual therapy fits into your schedule. Whether you're at home, at work, or traveling, you can maintain consistency in your therapeutic journey without disrupting your daily routine.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Privacy and Comfort</h2>
      <p class="mb-4">Many people find it easier to open up in the comfort of their own space. Virtual therapy provides a sense of privacy that can make difficult conversations feel more manageable.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Cost-Effectiveness</h2>
      <p class="mb-4">Online therapy often costs less than traditional in-person sessions, making mental health support more affordable for more people.</p>
    `,
    author: "Ealho Team",
    date: "January 20, 2024",
    category: "Therapy",
    slug: "benefits-virtual-therapy",
  },
  "choosing-right-therapist": {
    id: 3,
    title: "Choosing the Right Therapist for You",
    excerpt: "A guide to finding a therapist who understands your needs, cultural background, and therapeutic goals.",
    content: `
      <p class="mb-4">Finding the right therapist is crucial for a successful therapeutic journey. The relationship between you and your therapist is one of the most important factors in therapy outcomes.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Consider Your Needs</h2>
      <p class="mb-4">Before choosing a therapist, take time to reflect on what you're looking for. Are you dealing with anxiety, depression, relationship issues, or something else? Understanding your needs helps you find a therapist with relevant expertise.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Cultural Competence</h2>
      <p class="mb-4">For Nigerians, finding a therapist who understands your cultural context can make a significant difference. Look for therapists who are familiar with Nigerian culture, values, and the unique challenges you might face.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Therapeutic Approach</h2>
      <p class="mb-4">Different therapists use different approaches. Some focus on cognitive-behavioral therapy (CBT), while others might use psychodynamic or humanistic approaches. Research different methods to see what resonates with you.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Trust Your Instincts</h2>
      <p class="mb-4">The most important factor is how you feel with the therapist. You should feel heard, understood, and comfortable. If something doesn't feel right, it's okay to try a different therapist.</p>
    `,
    author: "Ealho Team",
    date: "January 25, 2024",
    category: "Therapy",
    slug: "choosing-right-therapist",
  },
  "managing-stress-anxiety": {
    id: 4,
    title: "Managing Stress and Anxiety: Practical Tips",
    excerpt: "Evidence-based strategies for managing daily stress and anxiety, tailored for Nigerian professionals and students.",
    content: `
      <p class="mb-4">Stress and anxiety are common experiences, especially in today's fast-paced world. For Nigerian professionals and students, managing these feelings is essential for maintaining mental wellness and productivity.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Recognize Your Triggers</h2>
      <p class="mb-4">The first step in managing stress and anxiety is recognizing what triggers these feelings. Keep a journal to track when you feel most stressed or anxious, and identify patterns.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Practice Mindfulness</h2>
      <p class="mb-4">Mindfulness techniques, such as deep breathing and meditation, can help you stay grounded in the present moment. Even just a few minutes a day can make a significant difference.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Establish Boundaries</h2>
      <p class="mb-4">Learning to say no and setting healthy boundaries is crucial for managing stress. This is especially important in work and academic environments where demands can be overwhelming.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Seek Professional Support</h2>
      <p class="mb-4">If stress and anxiety are significantly impacting your life, consider seeking professional help. A therapist can provide personalized strategies and support tailored to your specific situation.</p>
    `,
    author: "Ealho Team",
    date: "February 1, 2024",
    category: "Wellness",
    slug: "managing-stress-anxiety",
  },
  "therapy-vs-counseling": {
    id: 5,
    title: "Therapy vs. Counseling: What's the Difference?",
    excerpt: "Understanding the distinctions between therapy and counseling to help you make informed decisions about your mental health journey.",
    content: `
      <p class="mb-4">Many people use the terms "therapy" and "counseling" interchangeably, but there are important distinctions that can help you choose the right type of support for your needs.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Therapy (Psychotherapy)</h2>
      <p class="mb-4">Therapy typically involves longer-term work focused on understanding deep-rooted patterns, addressing past trauma, and making fundamental changes in how you think, feel, and behave. Therapists often have advanced degrees and specialized training.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Counseling</h2>
      <p class="mb-4">Counseling is often more short-term and solution-focused. It typically addresses specific issues or life challenges, such as career decisions, relationship problems, or adjusting to life changes.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Which is Right for You?</h2>
      <p class="mb-4">The choice between therapy and counseling depends on your specific needs. If you're dealing with deep-seated issues or want to understand yourself better, therapy might be the right choice. If you need help with a specific problem or situation, counseling could be more appropriate.</p>
      
      <p class="mb-4">At Ealho, our therapists are trained to provide both therapeutic and counseling support, adapting their approach to meet your unique needs.</p>
    `,
    author: "Ealho Team",
    date: "February 5, 2024",
    category: "Education",
    slug: "therapy-vs-counseling",
  },
  "breaking-mental-health-stigma": {
    id: 6,
    title: "Breaking the Stigma: Mental Health in Nigerian Culture",
    excerpt: "How we can work together to reduce mental health stigma and create a more supportive environment for seeking help.",
    content: `
      <p class="mb-4">Mental health stigma remains a significant barrier to seeking help in Nigeria. However, through education, open conversation, and cultural sensitivity, we can work together to create a more supportive environment.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Understanding the Stigma</h2>
      <p class="mb-4">Mental health stigma in Nigeria often stems from misconceptions, cultural beliefs, and lack of awareness. Many people view mental health issues as a sign of weakness or spiritual problems rather than medical conditions that can be treated.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">The Power of Conversation</h2>
      <p class="mb-4">Open, honest conversations about mental health can help break down barriers. When we share our experiences and normalize seeking help, we create space for others to do the same.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Education and Awareness</h2>
      <p class="mb-4">Education is key to reducing stigma. Understanding that mental health issues are common, treatable, and nothing to be ashamed of can change perspectives and encourage people to seek help.</p>
      
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">Cultural Integration</h2>
      <p class="mb-4">Integrating mental health support with cultural values and practices can make it more acceptable. This includes working with religious leaders, community elders, and family structures to promote mental wellness.</p>
      
      <p class="mb-4">At Ealho, we're committed to breaking down these barriers and making mental health support accessible, culturally relevant, and stigma-free for all Nigerians.</p>
    `,
    author: "Ealho Team",
    date: "February 10, 2024",
    category: "Culture",
    slug: "breaking-mental-health-stigma",
  },
};

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#474433] text-white">
      <SharedNav />

      <main>
        {/* Article Header */}
        <article className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Article Meta */}
            <div className="mb-8">
              <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#EAF2CF]/20 text-[#EAF2CF] font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Article Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-[#EAF2CF]/20 to-[#d9e5b8]/20 rounded-lg mb-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-white/50">Article Image</p>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="max-w-none text-white/80 text-lg leading-relaxed [&_p]:mb-6 [&_h2]:text-white [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-white [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_a]:text-[#EAF2CF] [&_a]:underline [&_a:hover]:text-[#d9e5b8] [&_strong]:text-white [&_strong]:font-semibold [&_ul]:mb-6 [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:pl-6 [&_li]:mb-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center gap-4">
                <span className="text-white/70 font-medium">Share this article:</span>
                <div className="flex gap-3">
                  <button className="p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles CTA */}
        <section className="container mx-auto px-6 py-16 bg-white/5">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Explore More Articles</h2>
            <p className="text-lg text-white/80">
              Discover more insights on mental health, therapy, and wellness.
            </p>
            <Link
              href="/blog"
              className="inline-block bg-[#EAF2CF] hover:bg-[#d9e5b8] text-[#3a3628] px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
