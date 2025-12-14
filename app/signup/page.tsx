import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <AuthScreen
        title="Get started for free"
        subtitle="Join Daiyet with your Google account to book and manage consultations."
        redirectPath="/user-dashboard"
      />
    </Suspense>
  );
}
