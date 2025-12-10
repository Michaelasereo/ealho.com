import { AuthScreen } from "@/components/auth/AuthScreen";

export default function LoginPage() {
  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in with Google to access your Daiyet workspace."
      redirectPath="/user-dashboard"
    />
  );
}
