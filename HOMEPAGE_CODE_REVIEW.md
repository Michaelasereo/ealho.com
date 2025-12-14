# Homepage Code Review - Best Practices Discussion

## File: `app/page.tsx`

### Current Implementation

```tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Video, Globe, ChevronDown, ArrowRight } from "lucide-react";

const navLinks: { name: string; href: string }[] = [];

export default function HomePage() {
  const today = new Date();
  const currentMonthName = today.toLocaleString("en-US", { month: "long" });
  const currentYear = today.getFullYear();
  const startOfWeek = (() => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay()); // start on Sunday
    return d;
  })();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/daiyet logo.svg"
              alt="Daiyet"
              width={120}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
            <span className="hidden sm:inline text-xs sm:text-sm text-white/60">Scheduling reinvented</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="flex items-center text-white/80 hover:text-white transition-colors text-xs sm:text-sm px-2 sm:px-0"
              prefetch={false}
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="bg-[#FFF4E0] text-black hover:bg-[#ffe9c2] text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md inline-flex items-center justify-center font-medium transition-colors"
              prefetch={false}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 sm:px-6 min-h-[calc(100vh-80px)] flex items-center justify-center py-8 sm:py-16">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 self-center text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#E5FF53" }}></span>
                Now serving patients in Nigeria
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                Book dietitian consultations without the back-and-forth.
              </h1>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Daiyet pairs you with licensed dietitians and handles scheduling, reminders, and meal-plan delivery with a Cal.com–inspired experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link 
                  href="/signup"
                  className="bg-[#FFF4E0] text-black hover:bg-[#ffe9c2] h-10 sm:h-12 px-6 py-2 sm:py-3 rounded-md inline-flex items-center justify-center font-medium transition-colors"
                  prefetch={false}
                >
                  Book a Call <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <button 
                  type="button"
                  className="border border-white/20 text-white hover:bg-white/5 h-10 sm:h-12 px-6 py-2 sm:py-3 rounded-md inline-flex items-center justify-center font-medium transition-colors"
                  onClick={() => {
                    // TODO: Navigate to dietitians page or scroll to section
                    console.log("Meet Dietitians clicked");
                  }}
                >
                  Meet Dietitians
                </button>
              </div>
              <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <span style={{ color: "#E5FF53" }}>●</span> Instant confirmations
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: "#E5FF53" }}>●</span> Video or in-person
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="hidden sm:flex relative mt-8 sm:mt-16 lg:mt-14 mb-8 sm:mb-16 justify-center self-center w-full">
              <Card className="relative z-10 bg-[#FFF4E0] border border-[#f1e2c0] shadow-xl w-full max-w-[520px]">
                <CardContent className="p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-[#374151] mb-1">Dt. Odeyemi Makinde</h3>
                <h4 className="text-xl font-semibold mb-1 text-[#111827]">Nutrition Consultation</h4>
                <p className="text-sm text-[#4b5563] mb-6">
                  1-on-1 consult to review goals, history, and build a tailored plan.
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1 text-sm text-[#111827]">
                    <Clock className="h-4 w-4 text-[#6b7280]" />
                    <span>Duration</span>
                  </div>
                  <div className="text-sm text-white font-medium bg-[#111827] border border-[#111827] rounded-md px-4 py-2 inline-flex">
                    45 minutes
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-[#111827]">
                  <Video className="h-4 w-4 text-[#6b7280]" />
                  <span>Google Meet</span>
                </div>

                <div className="flex items-center gap-2 mb-6 text-sm text-[#111827]">
                  <Globe className="h-4 w-4 text-[#6b7280]" />
                  <span>Africa/Lagos</span>
                  <ChevronDown className="h-4 w-4 text-[#9ca3af]" />
                </div>

                <div className="border-t border-[#e5e7eb] pt-6">
                  <div className="flex items-center justify-between mb-4 text-sm text-[#111827]">
                    <h5 className="font-semibold">
                      {currentMonthName} {currentYear}
                    </h5>
                    <div className="flex gap-2 text-[#9ca3af]">
                      <button className="p-1 hover:bg-[#f3f4f6] rounded">{"<"}</button>
                      <button className="p-1 hover:bg-[#f3f4f6] rounded">{">"}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] text-[#9ca3af]">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                      <div key={day} className="text-center py-2 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dateObj = new Date(startOfWeek);
                      dateObj.setDate(startOfWeek.getDate() + i);
                      const dateNum = dateObj.getDate();
                      const isCurrentMonth = dateObj.getMonth() === today.getMonth();
                      const isSelected = dateObj.toDateString() === today.toDateString();
                      const isAvailable = true;
                      const hasDot = isSelected;
                      return (
                        <button
                          key={dateObj.toISOString()}
                          className={`aspect-square text-sm rounded-md transition-colors flex items-center justify-center ${
                            isSelected
                              ? "bg-[#111827] text-white"
                              : isAvailable
                                ? `hover:bg-white hover:text-[#111827] ${
                                    isCurrentMonth ? "text-[#111827]" : "text-[#9ca3af]"
                                  }`
                                : "text-[#cbd5e1] cursor-not-allowed"
                          }`}
                          disabled={!isAvailable}
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span>{dateNum}</span>
                            {hasDot && (
                              <span className="w-1 h-1 bg-[#111827] rounded-full mt-0.5"></span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="container mx-auto px-6 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-white/70">
          <span>© {new Date().getFullYear()} Daiyet. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## Areas for Best Practices Review

### 1. **Date Calculations in Component Body**
**Current:** Date calculations happen on every render
```tsx
const today = new Date();
const currentMonthName = today.toLocaleString("en-US", { month: "long" });
const currentYear = today.getFullYear();
const startOfWeek = (() => {
  const d = new Date(today);
  d.setDate(today.getDate() - today.getDay());
  return d;
})();
```

**Questions:**
- Should these be memoized with `useMemo`?
- Should they be calculated server-side since this is a server component?
- Is there a risk of hydration mismatch if server/client dates differ?

### 2. **Inline Styles vs Tailwind**
**Current:** Mix of inline styles and Tailwind classes
```tsx
<span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#E5FF53" }}></span>
<span style={{ color: "#E5FF53" }}>●</span>
```

**Questions:**
- Should we use Tailwind arbitrary values instead: `bg-[#E5FF53]`?
- Should these colors be in a theme/config file?
- Are inline styles acceptable for dynamic colors?

### 3. **Unused Variables**
**Current:** 
```tsx
const navLinks: { name: string; href: string }[] = [];
const Calendar = ...; // imported but not used
```

**Questions:**
- Should unused imports/variables be removed?
- Is `navLinks` placeholder for future use?

### 4. **Calendar Component Logic**
**Current:** Calendar buttons have no functionality
```tsx
<button className="p-1 hover:bg-[#f3f4f6] rounded">{"<"}</button>
<button className="p-1 hover:bg-[#f3f4f6] rounded">{">"}</button>
```

**Questions:**
- Should this be extracted to a separate component?
- Should it be a client component if it needs interactivity?
- Is this just a visual mockup or should it be functional?

### 5. **Accessibility Concerns**
**Current:** Some buttons lack proper labels
```tsx
<button className="p-1 hover:bg-[#f3f4f6] rounded">{"<"}</button>
```

**Questions:**
- Should navigation buttons have `aria-label`?
- Are icon-only buttons accessible?
- Should we add keyboard navigation for calendar?

### 6. **SEO & Metadata**
**Current:** No page-specific metadata

**Questions:**
- Should we add metadata export for SEO?
- Should we add structured data (JSON-LD)?
- Are Open Graph tags needed?

### 7. **Performance Considerations**
**Current:** All content renders on server

**Questions:**
- Should the calendar be lazy-loaded?
- Should images be optimized further?
- Is the booking card too heavy for initial load?

### 8. **Code Organization**
**Current:** Everything in one file (202 lines)

**Questions:**
- Should header be extracted to a component?
- Should footer be extracted to a component?
- Should booking card be a separate component?
- Should date utilities be in a separate file?

### 9. **Type Safety**
**Current:** No TypeScript types for props/data

**Questions:**
- Should we add interfaces for component props?
- Should calendar dates be typed?
- Are there any `any` types that should be avoided?

### 10. **Error Handling**
**Current:** No error boundaries

**Questions:**
- Should we add error boundaries?
- What happens if date calculations fail?
- Should we handle image loading errors?

---

## Specific Questions for Senior Developer

1. **Server Component Best Practices:**
   - Is it okay to do date calculations in a server component body?
   - Should we use `useMemo` even in server components?
   - Are there hydration concerns with date-dependent content?

2. **Styling Approach:**
   - When should we use inline styles vs Tailwind?
   - Should brand colors be in a config/theme file?
   - Is the current Tailwind class organization maintainable?

3. **Component Architecture:**
   - At what point should we extract components (header, footer, card)?
   - Should the calendar be a separate component even if non-functional?
   - Is 200 lines too long for a single component?

4. **Performance:**
   - Is `prefetch={false}` the right approach for auth pages?
   - Should we lazy-load the booking card?
   - Are there any performance red flags?

5. **Accessibility:**
   - What's the minimum accessibility standard we should meet?
   - Should all interactive elements have ARIA labels?
   - Are there keyboard navigation requirements?

6. **Code Quality:**
   - Should unused imports be removed immediately?
   - Is the TODO comment acceptable or should it be implemented?
   - Are there any code smells in the current implementation?

---

## Suggested Improvements (For Discussion)

### 1. Extract Components
```tsx
// components/layout/Header.tsx
export function Header() { ... }

// components/layout/Footer.tsx
export function Footer() { ... }

// components/home/BookingCard.tsx
export function BookingCard() { ... }
```

### 2. Extract Utilities
```tsx
// lib/utils/dates.ts
export function getStartOfWeek(date: Date): Date { ... }
export function formatMonthYear(date: Date): string { ... }
```

### 3. Add Metadata
```tsx
export const metadata: Metadata = {
  title: "Daiyet - Book Dietitian Consultations",
  description: "Book appointments with certified dietitians in Nigeria...",
  openGraph: { ... },
};
```

### 4. Add Constants
```tsx
// lib/constants/colors.ts
export const BRAND_COLORS = {
  primary: "#E5FF53",
  accent: "#FFF4E0",
  // ...
};
```

### 5. Improve Accessibility
```tsx
<button 
  aria-label="Previous month"
  className="..."
>
  {"<"}
</button>
```

---

## Current Status

✅ **Working:**
- Page renders correctly
- Navigation links work
- Responsive design
- Server component (good for SEO)

⚠️ **Needs Review:**
- Date calculations in component body
- Inline styles vs Tailwind
- Unused imports
- Non-functional calendar buttons
- Accessibility concerns
- Code organization

---

**Please review and provide feedback on:**
1. Best practices for server components
2. Code organization and component extraction
3. Performance optimizations
4. Accessibility requirements
5. Any other concerns or improvements
