import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";

// GET: Fetch dietitian information by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "Dietitian ID is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Fetch user by ID (should be a dietitian)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, image, role")
      .eq("id", id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Dietitian not found" },
        { status: 404 }
      );
    }

    // Return dietitian information
    return NextResponse.json({
      dietitian: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dietitian:", error);
    return NextResponse.json(
      { error: "Failed to fetch dietitian", details: error.message },
      { status: 500 }
    );
  }
}
