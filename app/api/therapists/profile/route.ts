import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer, createRouteHandlerClientFromRequest, getCookieHeader } from "@/lib/supabase/server";
import { findUserByAuthId } from "@/lib/auth/user-lookup";

/**
 * GET: Fetch current therapist profile based on session
 * Returns the therapist's profile data including all enrollment details
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClientServer();

    // Get auth user ID from session first
    const cookieHeader = getCookieHeader(request);
    const supabase = createRouteHandlerClientFromRequest(cookieHeader);

    // Try Authorization header first, then fall back to cookies
    const authHeader = request.headers.get("authorization");
    let authUser = null;
    let authError = null;

    if (authHeader?.startsWith("Bearer ")) {
      // Use token from Authorization header
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      authUser = user;
      authError = error;
    } else {
      // Fall back to cookies - try getSession first
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(session.access_token);
        authUser = user;
        authError = error;
      } else {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        authUser = user;
        authError = error;
      }
    }

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized: Session expired" },
        { status: 401 }
      );
    }

    // Fetch therapist profile using centralized lookup utility
    const { user: profile, error: lookupError, source } = await findUserByAuthId(
      authUser.id,
      "THERAPIST",
      supabaseAdmin
    );

    // Verify user is a therapist
    if (lookupError || !profile) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Only therapists can access this endpoint" },
        { status: 403 }
      );
    }

    // Transform to match TherapistProfile type
    const transformedProfile = {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      bio: profile.bio || '',
      image: profile.image || '',
      specialization: profile.metadata?.specialization || '',
      licenseNumber: profile.metadata?.licenseNumber || '',
      experience: profile.metadata?.experience || '',
      location: profile.metadata?.location || '',
      qualifications: profile.metadata?.qualifications || [],
      updatedAt: profile.updated_at,
    };

    return NextResponse.json({ profile: transformedProfile });
  } catch (error: any) {
    console.error("Error in therapist profile GET route:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }
}

