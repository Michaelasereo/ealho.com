'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function SharedNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-white bg-[#3a3628] backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/ealho logo.png"
            alt="Ealho"
            width={180}
            height={48}
            className="h-10 sm:h-12 w-auto object-contain"
            priority
          />
          <span className="hidden sm:inline text-xs sm:text-sm text-white/60">Therapy for all</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link 
            href="/about" 
            className={`text-sm transition-colors ${
              isActive('/about') 
                ? 'text-white font-semibold border-b-2 border-white pb-1' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            About Us
          </Link>
          <Link 
            href="/therapy" 
            className={`text-sm transition-colors ${
              isActive('/therapy') 
                ? 'text-white font-semibold border-b-2 border-white pb-1' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Therapy
          </Link>
          <Link 
            href="/blog" 
            className={`text-sm transition-colors ${
              isActive('/blog') 
                ? 'text-white font-semibold border-b-2 border-white pb-1' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Blog
          </Link>
          <Link 
            href="/faqs" 
            className={`text-sm transition-colors ${
              isActive('/faqs') 
                ? 'text-white font-semibold border-b-2 border-white pb-1' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            FAQs
          </Link>
          <span className="relative text-sm text-white/40 cursor-not-allowed">
            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#474433] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              Coming Soon
            </span>
            Ealho Notes API
          </span>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/contact"
            className={`hidden sm:inline text-sm transition-colors ${
              isActive('/contact') 
                ? 'text-white font-semibold' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Contact Us
          </Link>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSf_aIC5Z0Ir27XaqX9j2sxvr5trYpFwGPMUhZbhln3IUNNe6Q/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFF4E0] text-black hover:bg-[#ffe9c2] text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md inline-flex items-center justify-center font-medium transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
