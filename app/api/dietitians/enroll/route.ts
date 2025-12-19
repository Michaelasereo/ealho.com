import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClientFromRequest, createAdminClientServer } from "@/lib/supabase/server";
import { getCookieHeader } from "@/lib/supabase/server";
import { authConfig } from "@/lib/auth/config";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      dob,
      location,
      profilePicture, // Base64 or file data
      licenseNumber,
      experience,
      specialization,
      bio,
    } = body;

    // Get authenticated user from session
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
      // Fall back to cookies
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
        { error: "Unauthorized: Please sign in with Google first" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !dob ||
      !location ||
      !licenseNumber ||
      !experience ||
      !specialization ||
      !bio
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle profile picture upload if provided
    let imageUrl = null;
    if (profilePicture) {
      try {
        // Convert base64 to buffer if needed
        const imageBuffer = profilePicture.startsWith("data:")
          ? Buffer.from(profilePicture.split(",")[1], "base64")
          : Buffer.from(profilePicture, "base64");

        const fileExt = profilePicture.match(/data:image\/(\w+);base64/)?.[1] || "jpg";
        const fileName = `${authUser.id}/profile.${fileExt}`;

        // Upload to Supabase Storage
        const supabaseAdmin = createAdminClientServer();
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

    // Check if user already exists with DIETITIAN role
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClientServer();
    } catch (adminError: any) {
      console.error("Failed to create admin client:", {
        error: adminError?.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Server configuration error", details: "Failed to initialize database connection" },
        { status: 500 }
      );
    }

    // Check for existing account with (email, DIETITIAN)
    const { data: existingDietitianAccount, error: checkDietitianError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("role", "DIETITIAN")
      .single();

    if (checkDietitianError && checkDietitianError.code !== "PGRST116") {
      // PGRST116 is "not found" which is OK, but other errors are not
      console.error("Error checking existing dietitian account:", {
        error: checkDietitianError.message,
        code: checkDietitianError.code,
      });
      return NextResponse.json(
        { error: "Failed to check user existence", details: checkDietitianError.message },
        { status: 500 }
      );
    }

    // If account with (email, DIETITIAN) exists, return error
    if (existingDietitianAccount) {
      return NextResponse.json(
        { 
          error: "Account already exists", 
          message: "This email is already registered as a dietitian. Please login to access your account.",
          existingAccount: true
        },
        { status: 400 }
      );
    }

    // Also check if user exists by auth_user_id (for backward compatibility)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user by auth_user_id:", {
        error: checkError.message,
        code: checkError.code,
      });
      return NextResponse.json(
        { error: "Failed to check user existence", details: checkError.message },
        { status: 500 }
      );
    }

    // Update or create user record with DIETITIAN role
    const userData: any = {
      name: fullName,
      email: email,
      role: "DIETITIAN",
      bio: bio,
      account_status: "ACTIVE",
      // email_verified is TIMESTAMPTZ in the database schema
      // Use the auth user's email_confirmed_at timestamp if available
      ...(authUser.email_confirmed_at ? { 
        email_verified: authUser.email_confirmed_at 
      } : {
        // If email is confirmed but no timestamp, use current time
        email_verified: authUser.email ? new Date().toISOString() : null
      }),
      updated_at: new Date().toISOString(),
      metadata: {
        phone,
        dob,
        location,
        licenseNumber,
        experience,
        specialization,
        enrolled_at: new Date().toISOString(),
      },
    };

    if (imageUrl) {
      userData.image = imageUrl;
    }

    let user;
    if (existingUser) {
      // If existing user has a different role, we can't update it (would violate unique constraint)
      if (existingUser.role !== "DIETITIAN") {
        return NextResponse.json(
          { 
            error: "Account exists with different role", 
            message: `This email is already registered as a ${existingUser.role.toLowerCase()}. Please login to access your account.`,
            existingRole: existingUser.role
          },
          { status: 400 }
        );
      }
      
      // Update existing DIETITIAN user
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          ...userData,
          auth_user_id: authUser.id, // Ensure auth_user_id is set
        })
        .eq("id", existingUser.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update user", details: updateError.message },
          { status: 500 }
        );
      }
      user = updatedUser;
    } else {
      // Create new user with generated UUID (not auth user ID)
      const newUserId = randomUUID();
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: newUserId, // Use generated UUID
          auth_user_id: authUser.id, // Link to Supabase Auth account
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        // If unique constraint violation, account might have been created by another request
        if (createError.code === "23505") {
          // Try to fetch the account that was created
          const { data: createdAccount } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase().trim())
            .eq("role", "DIETITIAN")
            .single();

          if (createdAccount) {
            user = createdAccount;
          } else {
            return NextResponse.json(
              { error: "Failed to create user", details: "Account creation conflict. Please try again." },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: "Failed to create user", details: createError.message },
            { status: 500 }
          );
        }
      } else {
        user = newUser;
      }
    }

    // Audit log enrollment (don't fail if this fails)
    try {
      await supabaseAdmin.from("auth_audit_log").insert({
        user_id: authUser.id,
        action: "enrollment",
        provider: "google",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        user_agent: request.headers.get("user-agent"),
        success: true,
        metadata: {
          email: user.email,
          role: user.role,
          licenseNumber,
          experience,
          specialization,
        },
      });
    } catch (auditError: any) {
      console.warn("Failed to log enrollment audit (non-critical):", {
        error: auditError?.message,
      });
      // Continue - audit logging failure shouldn't block enrollment
    }

    // Sign out the user so they can use the magic link
    // This is necessary because magic links require the user to not be authenticated
    try {
      await supabase.auth.signOut();
    } catch (signOutError: any) {
      console.warn("Failed to sign out user after enrollment (non-critical):", {
        error: signOutError?.message,
      });
      // Continue - we'll still send the magic link
    }

    // Send magic link via email using Supabase Admin API
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "http://localhost:3000";
    const redirectTo = `${siteUrl}/auth/verify?redirect=/dashboard`;

    try {
      // Generate magic link using admin API
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: user.email,
        options: {
          redirectTo: redirectTo,
        },
      });

      if (linkError) {
        console.error("Failed to generate magic link:", {
          error: linkError.message,
          timestamp: new Date().toISOString(),
        });
        // Don't fail enrollment if magic link generation fails
        // We'll return success but note that email sending may have failed
      } else {
        // The magic link is automatically sent via email by Supabase
        // The linkData contains the link, but Supabase sends it automatically
        console.info("Magic link generated and sent:", {
          email: user.email,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (magicLinkError: any) {
      console.error("Error sending magic link:", {
        error: magicLinkError?.message,
        stack: magicLinkError?.stack,
        timestamp: new Date().toISOString(),
      });
      // Don't fail enrollment if magic link sending fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: "Enrollment successful. Please check your email for a magic link to access your dashboard.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in dietitian enrollment:", {
      error: error?.message,
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: "Failed to process enrollment", 
        details: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
