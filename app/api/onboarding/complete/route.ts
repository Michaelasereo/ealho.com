import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClientFromRequest, createAdminClientServer } from "@/lib/supabase/server";
import { getCookieHeader } from "@/lib/supabase/server";
import { UnifiedUserSystem } from "@/lib/auth/unified-user-system";
import { OnboardingStateMachine } from "@/lib/onboarding/state-machine";
import { AuditLogger } from "@/lib/audit/logger";
import { EventBus } from "@/lib/events/event-bus";
import { CSRFProtection } from "@/lib/security/csrf";
import { SecurityHardener } from "@/lib/security/hardening";

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token for state-changing operations
    const csrfToken = request.headers.get("x-csrf-token");
    const csrfValidation = await CSRFProtection.validateRequest(request, csrfToken);
    
    if (!csrfValidation.valid) {
      await AuditLogger.logSecurityEvent(
        null,
        "CSRF_VALIDATION_FAILED",
        {
          path: "/api/onboarding/complete",
          error: csrfValidation.error,
        },
        request
      );
      
      return NextResponse.json(
        { error: "CSRF validation failed", details: csrfValidation.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      role,
      fullName,
      age,
      gender,
      state,
      bio,
      licenseNumber,
      qualifications,
      experience,
      specialization,
      termsAccepted,
      profileImage,
    } = body;

    // Get authenticated user from session
    const cookieHeader = getCookieHeader(request);
    const supabase = createRouteHandlerClientFromRequest(cookieHeader);

    // Try Authorization header first, then fall back to cookies
    const authHeader = request.headers.get("authorization");
    let authUser = null;
    let authError = null;

    // Log authentication attempt for debugging
    const hasAuthHeader = !!authHeader?.startsWith("Bearer ");
    const hasCookies = !!cookieHeader;
    const hasSupabaseCookies = cookieHeader.includes('sb-') || cookieHeader.includes('supabase');
    
    console.log("Onboarding auth check:", {
      hasAuthHeader,
      hasCookies,
      hasSupabaseCookies,
      cookieHeaderLength: cookieHeader.length,
    });

    if (authHeader?.startsWith("Bearer ")) {
      // Use token from Authorization header
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      authUser = user;
      authError = error;
      
      if (authError) {
        console.error("Auth header token error:", authError.message);
      }
    } else {
      // Fall back to cookies
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session retrieval error:", sessionError.message);
      }

      if (session?.access_token) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(session.access_token);
        authUser = user;
        authError = error;
        
        if (authError) {
          console.error("Session token user error:", authError.message);
        }
      } else {
        // Last resort: try getUser without token
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        authUser = user;
        authError = error;
        
        if (authError) {
          console.error("Direct getUser error:", authError.message);
        }
      }
    }

    if (authError || !authUser) {
      console.error("Onboarding authentication failed:", {
        hasAuthHeader,
        hasCookies,
        hasSupabaseCookies,
        authError: authError?.message,
        userId: authUser?.id,
      });
      
      return NextResponse.json(
        { 
          error: "Unauthorized: Please sign in first",
          details: authError?.message || "No authentication session found",
          suggestion: "Please refresh the page and sign in again if needed"
        },
        { status: 401 }
      );
    }

    // Validate required fields
    if (
      !fullName ||
      !age ||
      !gender ||
      !state ||
      !bio ||
      !licenseNumber ||
      !experience ||
      !specialization ||
      specialization.length === 0 ||
      !termsAccepted
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate specialization count
    if (specialization.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 specializations allowed" },
        { status: 400 }
      );
    }

    // Validate bio word count
    const bioWordCount = bio.trim().split(/\s+/).filter(Boolean).length;
    if (bioWordCount > 100) {
      return NextResponse.json(
        { error: "Bio must be 100 words or less" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Find user using unified user system
    if (!role) {
      return NextResponse.json(
        { error: "Role is required for onboarding" },
        { status: 400 }
      );
    }

    const { user: foundUser, error: findError } = await UnifiedUserSystem.getUser(
      authUser.id,
      role,
      supabaseAdmin
    );

    let existingUser = foundUser;

    // If user doesn't exist, create one (this can happen if OAuth callback didn't create the user properly)
    if (!existingUser) {
      console.info("Creating user account during onboarding:", {
        authUserId: authUser.id,
        role,
        email: authUser.email,
      });
      
      const createResult = await UnifiedUserSystem.createUser(
        {
          authUserId: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email!.split("@")[0],
          image: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          role: role,
          account_status: "ACTIVE",
          onboarding_completed: false,
          email_verified: authUser.email_confirmed_at ? true : false,
          metadata: {
            provider: authUser.user_metadata?.provider || "google",
            provider_id: authUser.user_metadata?.provider_id,
          },
        },
        supabaseAdmin
      );
      
      if (createResult.error || !createResult.user) {
        console.error("Failed to create user during onboarding:", createResult.error);
        return NextResponse.json(
          { error: "Failed to create user account. Please try signing in again." },
          { status: 500 }
        );
      }
      
      existingUser = createResult.user;
    } else if (findError) {
      // User exists but there was an error in lookup - log it but continue
      console.warn("Warning: User found but lookup had error:", findError);
    }

    const existingMetadata = existingUser.metadata || {};

    // Handle profile image upload if provided
    let imageUrl = null;
    if (profileImage) {
      try {
        // Convert base64 to buffer
        const imageBuffer = profileImage.startsWith("data:")
          ? Buffer.from(profileImage.split(",")[1], "base64")
          : Buffer.from(profileImage, "base64");

        const fileExt = profileImage.match(/data:image\/(\w+);base64/)?.[1] || "jpg";
        const fileName = `${existingUser.id}/profile.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("profiles")
          .upload(fileName, imageBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) {
          console.warn("Profile picture upload failed (continuing without image):", {
            error: uploadError.message,
          });
        } else if (uploadData) {
          const { data: urlData } = supabaseAdmin.storage.from("profiles").getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      } catch (uploadErr: any) {
        console.error("Error uploading profile picture:", {
          error: uploadErr?.message,
          stack: uploadErr?.stack,
        });
        // Continue without image if upload fails
      }
    }

    // Update user record with onboarding data
    const updateData: any = {
      name: fullName,
      age: parseInt(age),
      gender,
      bio,
      onboarding_completed: true,
      account_status: "ACTIVE",
      updated_at: new Date().toISOString(),
      metadata: {
        ...existingMetadata,
        location: state,
        licenseNumber,
        experience,
        specialization: Array.isArray(specialization) ? specialization : [specialization],
        qualifications: qualifications || [],
        onboarding_completed_at: new Date().toISOString(),
      },
    };

    // Add image URL if upload was successful
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    // Update user record using unified user system
    const updateResult = await UnifiedUserSystem.updateUser(
      authUser.id,
      role,
      updateData,
      supabaseAdmin
    );

    if (updateResult.error || !updateResult.user) {
      console.error("Error updating user onboarding:", updateResult.error);
      return NextResponse.json(
        { error: "Failed to complete onboarding", details: updateResult.error?.message },
        { status: 500 }
      );
    }

    const updatedUser = updateResult.user;

    // Mark onboarding as completed in state machine
    await OnboardingStateMachine.markCompleted(authUser.id, supabaseAdmin);

    // Audit log: Onboarding completed
    await AuditLogger.logOnboardingCompleted(
      updatedUser.id,
      updatedUser.role,
      {
        specialization: specialization,
        experience: experience,
        has_profile_image: !!imageUrl,
      },
      request
    );

    // Publish event: Onboarding completed
    await EventBus.publish(
      "ONBOARDING_COMPLETED",
      updatedUser.id,
      {
        role: updatedUser.role,
        email: updatedUser.email || authUser.email,
        specialization: specialization,
        experience: experience,
        has_profile_image: !!imageUrl,
      },
      updatedUser.id
    );

    const response = NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      imageUrl: imageUrl || updatedUser.image || null,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });

    // Add security headers
    SecurityHardener.addSecurityHeaders(response);

    return response;
  } catch (error: any) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

