import { AuthScreen } from "@/components/auth/AuthScreen";

export default function DietitianLoginPage() {
  return (
    <AuthScreen
      title="Dietitian login"
      subtitle="Sign in with Google to access your dietitian dashboard."
      redirectPath="/dashboard"
    />
  );
}
