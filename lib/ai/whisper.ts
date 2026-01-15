/**
 * OpenAI Whisper API Integration
 * 
 * Transcribes audio files to text for therapy session recordings.
 * Used as the first step in the AI notes generation pipeline.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/audio/transcriptions";

interface TranscriptionOptions {
  language?: string; // Optional: "en", "yo", "ig", "ha" for Nigerian languages
  prompt?: string; // Optional: context to help with medical terminology
  temperature?: number; // 0-1, default 0
  responseFormat?: "json" | "text" | "srt" | "verbose_json" | "vtt";
}

interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

/**
 * Transcribe audio file using OpenAI Whisper API
 * 
 * @param audioFile - File buffer or Blob containing audio data
 * @param options - Transcription options
 * @returns Transcription text
 */
export async function transcribeAudio(
  audioFile: File | Buffer | Blob,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured. Please set OPENAI_API_KEY environment variable.");
  }

  const {
    language = "en",
    prompt,
    temperature = 0,
    responseFormat = "verbose_json",
  } = options;

  try {
    // Convert to FormData for multipart/form-data request
    const formData = new FormData();
    
    // Handle different input types
    if (audioFile instanceof File) {
      formData.append("file", audioFile);
    } else if (audioFile instanceof Blob) {
      formData.append("file", audioFile, "audio.webm"); // Default filename
    } else {
      // Buffer - convert to Blob
      const blob = new Blob([audioFile], { type: "audio/webm" });
      formData.append("file", blob, "audio.webm");
    }

    formData.append("model", "whisper-1");
    formData.append("language", language);
    formData.append("response_format", responseFormat);
    formData.append("temperature", temperature.toString());
    
    if (prompt) {
      formData.append("prompt", prompt);
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        // Don't set Content-Type - FormData sets it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI Whisper API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`
      );
    }

    const result = await response.json();

    if (responseFormat === "verbose_json") {
      return {
        text: result.text,
        language: result.language,
        duration: result.duration,
      };
    }

    return {
      text: typeof result === "string" ? result : result.text || "",
    };
  } catch (error: any) {
    console.error("Error transcribing audio with Whisper:", error);
    throw error;
  }
}

/**
 * Transcribe audio from a URL (e.g., Supabase Storage URL)
 * 
 * @param audioUrl - URL to the audio file
 * @param options - Transcription options
 * @returns Transcription text
 */
export async function transcribeAudioFromUrl(
  audioUrl: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    return await transcribeAudio(audioBlob, options);
  } catch (error: any) {
    console.error("Error transcribing audio from URL:", error);
    throw error;
  }
}
