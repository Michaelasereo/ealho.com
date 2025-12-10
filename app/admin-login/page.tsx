import { AuthScreen } from "@/components/auth/AuthScreen";

export default function AdminLoginPage() {
  return (
    <AuthScreen
      title="Admin login"
      subtitle="Sign in with Google to access the admin dashboard."
      redirectPath="/admin"
    />
  );
}
