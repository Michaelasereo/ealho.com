import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClientFromRequest, createAdminClientServer } from "@/lib/supabase/server";
import { getCookieHeader } from "@/lib/supabase/server";
import { OnboardingStateMachine, type OnboardingStage } from "@/lib/onboarding/state-machine";

// GET: Fetch current onboarding progress
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieHeader = getCookieHeader(request);
    const supabase = createRouteHandlerClientFromRequest(cookieHeader);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClientServer();
    const { progress, error } = await OnboardingStateMachine.getCurrentStage(
      authUser.id,
      supabaseAdmin
    );

    if (error) {
      console.error("Error fetching onboarding progress:", error);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("Onboarding progress GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save onboarding progress
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieHeader = getCookieHeader(request);
    const supabase = createRouteHandlerClientFromRequest(cookieHeader);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { stage, formData } = body;

    if (!stage || !OnboardingStateMachine.isValidStage(stage)) {
      return NextResponse.json(
        { error: "Invalid stage" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();
    const { progress, error } = await OnboardingStateMachine.saveProgress(
      authUser.id,
      stage as OnboardingStage,
      formData || {},
      supabaseAdmin
    );

    if (error) {
      console.error("Error saving onboarding progress:", error);
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("Onboarding progress POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

