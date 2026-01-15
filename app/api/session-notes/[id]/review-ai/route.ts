import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { requireTherapistFromRequest } from "@/lib/auth-helpers";

/**
 * POST /api/session-notes/[id]/review-ai
 * 
 * Mark AI-generated note as reviewed by therapist.
 * Therapist can then edit the AI-generated fields as needed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Authenticate therapist
    const therapist = await requireTherapistFromRequest(request);
    const therapistId = therapist.id;

    const { id } = await Promise.resolve(params);
    const supabaseAdmin = createAdminClientServer();

    // Get session note and verify ownership
    const { data: sessionNote, error: noteError } = await supabaseAdmin
      .from("session_notes")
      .select("id, therapist_id, is_ai_generated")
      .eq("id", id)
      .single();

    if (noteError || !sessionNote) {
      return NextResponse.json(
        { error: "Session note not found" },
        { status: 404 }
      );
    }

    if (sessionNote.therapist_id !== therapistId) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this session note" },
        { status: 403 }
      );
    }

    if (!sessionNote.is_ai_generated) {
      return NextResponse.json(
        { error: "This note was not AI-generated" },
        { status: 400 }
      );
    }

    // Mark as reviewed
    const { error: updateError } = await supabaseAdmin
      .from("session_notes")
      .update({
        therapist_reviewed: true,
        therapist_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error marking note as reviewed:", updateError);
      return NextResponse.json(
        { error: "Failed to update review status", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note marked as reviewed",
    });
  } catch (error: any) {
    console.error("Error reviewing AI note:", error);
    return NextResponse.json(
      { error: "Failed to update review status", details: error.message },
      { status: 500 }
    );
  }
}
