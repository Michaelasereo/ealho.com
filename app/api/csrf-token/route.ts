import { NextResponse } from "next/server";
import { CSRFProtection } from "@/lib/security/csrf";

/**
 * GET /api/csrf-token
 * 
 * Generate and return CSRF token for client-side forms
 */
export async function GET() {
  try {
    const token = await CSRFProtection.generateToken();

    return NextResponse.json({
      token,
    });
  } catch (error: any) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

