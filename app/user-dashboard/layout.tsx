import { createClient } from "@/lib/supabase/server/client";
import { createAdminClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UnifiedUserSystem } from "@/lib/auth/unified-user-system";
import UserDashboardLayoutClient from "./layout-client";

/**
 * Server-side layout that enforces USER role for user dashboard
 */
export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Fetch user and role server-side
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("UserDashboardLayout: Auth check failed", { error: authError?.message });
      redirect("/login");
    }

    // Fetch profile from database using unified user system
    const supabaseAdmin = createAdminClientServer();
    const { user: dbUser, error: userError } = await UnifiedUserSystem.getUser(
      user.id,
      "USER",
      supabaseAdmin
    );

    if (userError || !dbUser) {
      // User doesn't have USER account yet - redirect to login
      if (user) {
        console.error("UserDashboardLayout: User not found in database", {
          userId: user.id,
          error: userError?.message,
        });
      }
      redirect("/login");
    }

    // Enforce USER role - redirect to appropriate dashboard if not USER
    if (dbUser.role !== "USER") {
      if (dbUser.role === "DIETITIAN") {
        redirect("/dashboard");
      } else if (dbUser.role === "THERAPIST") {
        redirect("/therapist-dashboard");
      } else if (dbUser.role === "ADMIN") {
        redirect("/admin");
      } else {
        redirect("/");
      }
    }

    // User has correct role, render the client layout
    return <UserDashboardLayoutClient>{children}</UserDashboardLayoutClient>;
  } catch (error) {
    console.error("UserDashboardLayout: Error", error);
    redirect("/login");
  }
}
