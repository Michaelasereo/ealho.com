import Link from "next/link";

export function SharedFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#3a3628]">
      <div className="container mx-auto px-6 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-white/70">
        <span>© {new Date().getFullYear()} Ealho. All rights reserved.</span>
        <div className="flex gap-4">
          <Link 
            href="/terms-of-service" 
            className="hover:text-white transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            href="/privacy-policy" 
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
