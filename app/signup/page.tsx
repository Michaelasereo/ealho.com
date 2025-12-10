import { AuthScreen } from "@/components/auth/AuthScreen";

export default function SignupPage() {
  return (
    <AuthScreen
      title="Get started for free"
      subtitle="Join Daiyet with your Google account to book and manage consultations."
      redirectPath="/user-dashboard"
    />
  );
}
