import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { requireTherapistFromRequest } from "@/lib/auth-helpers";
import { processAudioToNotes } from "@/lib/ai/notes-processor";

/**
 * POST /api/session-notes/[id]/process-audio
 * 
 * Process uploaded audio through the AI pipeline:
 * 1. Transcribe with Whisper
 * 2. De-identify PHI
 * 3. Generate SOAP note with DeepSeek
 * 
 * Updates the session note with AI-generated content.
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
      .select(`
        id,
        therapist_id,
        booking_id,
        audio_recording_url,
        client_name,
        location,
        bookings (
          start_time,
          end_time
        )
      `)
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

    if (!sessionNote.audio_recording_url) {
      return NextResponse.json(
        { error: "No audio recording found for this session note" },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await supabaseAdmin
      .from("session_notes")
      .update({
        transcription_status: "PROCESSING",
        ai_processing_status: "PROCESSING",
      })
      .eq("id", id);

    // Calculate session duration
    const booking = sessionNote.bookings as any;
    let duration: number | undefined;
    if (booking?.start_time && booking?.end_time) {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    }

    // Process audio through AI pipeline
    const processedNotes = await processAudioToNotes({
      audioUrl: sessionNote.audio_recording_url,
      sessionContext: {
        duration,
        sessionType: "Individual Therapy",
        clientName: sessionNote.client_name || undefined,
        location: sessionNote.location || undefined,
      },
    });

    if (processedNotes.processingStatus === "failed") {
      // Update status to FAILED
      await supabaseAdmin
        .from("session_notes")
        .update({
          transcription_status: "FAILED",
          ai_processing_status: "FAILED",
        })
        .eq("id", id);

      return NextResponse.json(
        {
          error: "Failed to process audio",
          details: processedNotes.error,
        },
        { status: 500 }
      );
    }

    // Update session note with AI-generated content
    const { error: updateError } = await supabaseAdmin
      .from("session_notes")
      .update({
        transcription_text: processedNotes.transcription,
        de_identified_text: processedNotes.deIdentifiedText,
        ai_generated_note: processedNotes.soapNote,
        transcription_status: "COMPLETED",
        ai_processing_status: "COMPLETED",
        is_ai_generated: true,
        ai_processed_at: new Date().toISOString(),
        // Pre-fill note fields with AI-generated content
        patient_complaint: processedNotes.soapNote.patientComplaint || null,
        personal_history: processedNotes.soapNote.personalHistory || null,
        family_history: processedNotes.soapNote.familyHistory || null,
        presentation: processedNotes.soapNote.presentation || null,
        formulation_and_diagnosis: processedNotes.soapNote.formulationAndDiagnosis || null,
        treatment_plan: processedNotes.soapNote.treatmentPlan || null,
        assignments: processedNotes.soapNote.assignments || null,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating session note with AI content:", updateError);
      return NextResponse.json(
        {
          error: "Failed to save AI-generated content",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Audio processed successfully",
      transcription: processedNotes.transcription,
      soapNote: processedNotes.soapNote,
    });
  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio", details: error.message },
      { status: 500 }
    );
  }
}
