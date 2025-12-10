import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { getOAuth2Client } from "@/lib/google-calendar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Exchange code for tokens (for Google Calendar API)
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get tokens from Google");
    }

    // Get user from Supabase session
    // Note: Supabase handles its own OAuth flow, so we need to get the user from the session
    // This callback is specifically for Google Calendar API tokens
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to get session from cookies or create a new session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      // If no session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Calculate expiry (default to 1 hour if not provided)
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600000).toISOString();

    // Store tokens in database
    await supabaseAdmin.from("google_oauth_tokens").upsert(
      {
        user_id: session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      },
      {
        onConflict: "user_id",
      }
    );

    // Redirect based on state or default
    const redirectPath = state ? decodeURIComponent(state) : "/dashboard/settings/calendars";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
