import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <AuthScreen
        title="Welcome back"
        subtitle="Sign in with Google to access your Daiyet workspace."
        redirectPath="/user-dashboard"
      />
    </Suspense>
  );
}
