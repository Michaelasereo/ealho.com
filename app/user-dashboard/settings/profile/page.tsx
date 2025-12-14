import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server/client";
import UserProfileSettingsClient from "./UserProfileSettingsClient";

export default async function UserProfileSettingsPage() {
  // Server-side: Fetch user data securely from Supabase session
  const supabase = await createClient();
  
  // Use getUser() instead of getSession() for more reliable auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login - middleware should also handle this, but this provides server-side protection
    redirect("/login");
  }
  
  // Extract name and email from Google auth metadata (server-side - secure)
  // Use user object directly (from getUser) which is more reliable
  const extractedSessionName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    "";
  const extractedSessionEmail = user.email || "";

  // Get Google auth image
  const googleImage =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.image ||
    null;

  // Try to fetch additional profile data from database
  let userProfile = {
    name: extractedSessionName || "User",
    email: extractedSessionEmail || "",
    image: googleImage,
  };

  try {
    // Fetch from database for additional fields
    const { data: dbUser } = await supabase
      .from("users")
      .select("name, email, image, role")
      .eq("id", user.id)
      .single();

    if (dbUser) {
      // Priority: Database > Google Auth > Fallback
      // For regular users, prefer Google image; for dietitians, use uploaded image
      const profileImage = dbUser.role === "DIETITIAN" 
        ? (dbUser.image || googleImage)
        : (googleImage || dbUser.image);

      userProfile = {
        name: dbUser.name || extractedSessionName || "User",
        email: dbUser.email || extractedSessionEmail || "",
        image: profileImage,
      };
    }
  } catch (dbError) {
    // If database fetch fails, use session data
    console.warn("Error fetching user from database:", dbError);
  }

  return <UserProfileSettingsClient initialUserProfile={userProfile} />;
}
