import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { requireTherapistFromRequest } from "@/lib/auth-helpers";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (OpenAI Whisper limit)
const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/ogg",
];

/**
 * POST /api/session-notes/upload-audio
 * 
 * Upload audio recording for a therapy session.
 * The audio will be stored in Supabase Storage and associated with a session note.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate therapist
    const therapist = await requireTherapistFromRequest(request);
    const therapistId = therapist.id;

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const bookingId = formData.get("bookingId") as string;
    const sessionNoteId = formData.get("sessionNoteId") as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    if (!bookingId && !sessionNoteId) {
      return NextResponse.json(
        { error: "Either bookingId or sessionNoteId is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const isValidType = ALLOWED_AUDIO_TYPES.includes(audioFile.type) ||
      audioFile.name.toLowerCase().endsWith(".webm") ||
      audioFile.name.toLowerCase().endsWith(".mp3") ||
      audioFile.name.toLowerCase().endsWith(".wav") ||
      audioFile.name.toLowerCase().endsWith(".m4a");

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid audio file type. Supported: webm, mp3, wav, m4a, ogg" },
        { status: 400 }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_AUDIO_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClientServer();

    // Verify booking/session note belongs to therapist
    if (bookingId) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .select("id, dietitian_id")
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking || booking.dietitian_id !== therapistId) {
        return NextResponse.json(
          { error: "Booking not found or access denied" },
          { status: 404 }
        );
      }
    } else if (sessionNoteId) {
      const { data: note, error: noteError } = await supabaseAdmin
        .from("session_notes")
        .select("id, therapist_id")
        .eq("id", sessionNoteId)
        .single();

      if (noteError || !note || note.therapist_id !== therapistId) {
        return NextResponse.json(
          { error: "Session note not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Generate unique file name
    const timestamp = Date.now();
    const fileExtension = audioFile.name.split(".").pop() || "webm";
    const fileName = `${therapistId}/${timestamp}-${sessionNoteId || bookingId}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("session-recordings")
      .upload(fileName, buffer, {
        contentType: audioFile.type || "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading audio file:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload audio file", details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("session-recordings")
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Update session note with audio URL
    if (sessionNoteId) {
      const { error: updateError } = await supabaseAdmin
        .from("session_notes")
        .update({
          audio_recording_url: audioUrl,
          transcription_status: "PENDING",
        })
        .eq("id", sessionNoteId);

      if (updateError) {
        console.error("Error updating session note with audio URL:", updateError);
        // Don't fail the upload if update fails - audio is still uploaded
      } else {
        // Check if auto-process is requested (from query param or header)
        const url = new URL(request.url);
        const autoProcess = url.searchParams.get("autoProcess") === "true" ||
          request.headers.get("x-auto-process") === "true";

        if (autoProcess) {
          // Trigger AI processing in background (don't await to avoid blocking response)
          fetch(new URL(`/api/session-notes/${sessionNoteId}/process-audio`, request.url).toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Forward authorization if present
              ...(request.headers.get("authorization") && {
                authorization: request.headers.get("authorization")!,
              }),
            },
          }).catch((error) => {
            console.error("Error triggering auto-processing:", error);
            // Non-blocking error - processing can be triggered manually later
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      audioUrl,
      fileName: uploadData.path,
      message: "Audio uploaded successfully",
      sessionNoteId: sessionNoteId || null,
    });
  } catch (error: any) {
    console.error("Error uploading audio:", error);
    return NextResponse.json(
      { error: "Failed to upload audio", details: error.message },
      { status: 500 }
    );
  }
}
