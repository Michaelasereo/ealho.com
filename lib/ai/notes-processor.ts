/**
 * AI Notes Processing Pipeline
 * 
 * Orchestrates the complete pipeline:
 * 1. Audio transcription (Whisper)
 * 2. PHI de-identification
 * 3. SOAP note generation (DeepSeek)
 * 4. Re-identification (optional, for therapist review)
 */

import { transcribeAudio, transcribeAudioFromUrl } from "./whisper";
import { deIdentifyNigerianPHI, reIdentifyPHI } from "./de-identify";
import { generateSOAPNote } from "./deepseek";

export interface ProcessAudioOptions {
  audioFile?: File | Buffer | Blob;
  audioUrl?: string;
  sessionContext?: {
    duration?: number;
    sessionType?: string;
    clientName?: string;
    location?: string;
    phone?: string;
    email?: string;
  };
}

export interface ProcessedNotesResult {
  transcription: string;
  deIdentifiedText: string;
  soapNote: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    patientComplaint?: string;
    personalHistory?: string;
    familyHistory?: string;
    presentation?: string;
    formulationAndDiagnosis?: string;
    treatmentPlan?: string;
    assignments?: string;
  };
  processingStatus: "completed" | "failed";
  error?: string;
}

/**
 * Process audio through the complete AI pipeline
 * 
 * @param options - Audio file/URL and session context
 * @returns Processed notes with transcription and SOAP note
 */
export async function processAudioToNotes(
  options: ProcessAudioOptions
): Promise<ProcessedNotesResult> {
  try {
    const { audioFile, audioUrl, sessionContext = {} } = options;

    if (!audioFile && !audioUrl) {
      throw new Error("Either audioFile or audioUrl must be provided");
    }

    // Step 1: Transcribe audio
    console.log("[AI Notes] Step 1: Transcribing audio...");
    let transcriptionResult;
    if (audioFile) {
      transcriptionResult = await transcribeAudio(audioFile, {
        language: "en", // Can be extended to support Nigerian languages
        prompt: "This is a therapy session recording. The conversation is between a therapist and a client.",
      });
    } else if (audioUrl) {
      transcriptionResult = await transcribeAudioFromUrl(audioUrl, {
        language: "en",
        prompt: "This is a therapy session recording. The conversation is between a therapist and a client.",
      });
    } else {
      throw new Error("No audio source provided");
    }

    const transcription = transcriptionResult.text;
    console.log("[AI Notes] Transcription completed:", transcription.substring(0, 100) + "...");

    // Step 2: De-identify PHI
    console.log("[AI Notes] Step 2: De-identifying PHI...");
    const deIdentifiedText = deIdentifyNigerianPHI(transcription);
    console.log("[AI Notes] PHI de-identification completed");

    // Step 3: Generate SOAP note
    console.log("[AI Notes] Step 3: Generating SOAP note...");
    const soapNote = await generateSOAPNote({
      transcript: deIdentifiedText,
      sessionContext: {
        duration: sessionContext.duration,
        sessionType: sessionContext.sessionType,
      },
    });
    console.log("[AI Notes] SOAP note generation completed");

    return {
      transcription,
      deIdentifiedText,
      soapNote,
      processingStatus: "completed",
    };
  } catch (error: any) {
    console.error("[AI Notes] Processing failed:", error);
    return {
      transcription: "",
      deIdentifiedText: "",
      soapNote: {},
      processingStatus: "failed",
      error: error.message || "Unknown error during processing",
    };
  }
}

/**
 * Re-identify SOAP note fields with actual PHI
 * 
 * @param soapNote - SOAP note with placeholders
 * @param phiMap - Map of PHI values
 * @returns SOAP note with re-identified values
 */
export function reIdentifySOAPNote(
  soapNote: Record<string, string | undefined>,
  phiMap: {
    patientName?: string;
    location?: string;
    phone?: string;
    email?: string;
  }
): Record<string, string | undefined> {
  const reIdentified: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(soapNote)) {
    if (typeof value === "string") {
      reIdentified[key] = reIdentifyPHI(value, phiMap);
    } else {
      reIdentified[key] = value;
    }
  }

  return reIdentified;
}
