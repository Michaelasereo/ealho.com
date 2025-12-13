import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies are set via response headers
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: "Not authenticated",
          authError: authError ? String(authError) : undefined
        },
        { status: 401 }
      );
    }

    // Get user from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at,
        metadata: user.user_metadata,
      },
      dbUser: userData,
      errors: {
        auth: authError ? String(authError) : undefined,
        db: userError?.message,
      },
      role: userData?.role || "NOT_FOUND",
      shouldRedirectTo: userData?.role === "DIETITIAN" ? "/dashboard" : 
                        userData?.role === "ADMIN" ? "/admin" : 
                        userData?.role === "USER" ? "/user-dashboard" : 
                        "/dietitian-enrollment",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
