import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/security/csrf";

// Mark this route as Node.js runtime to support crypto module
export const runtime = "nodejs";

/**
 * GET /api/csrf-token
 * 
 * Generate and return CSRF token for client-side forms
 */
export async function GET() {
  try {
    const token = generateCSRFToken();

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

