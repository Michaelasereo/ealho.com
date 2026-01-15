/**
 * DeepSeek API Integration for SOAP Note Generation
 * 
 * Generates structured SOAP (Subjective, Objective, Assessment, Plan) notes
 * from de-identified therapy session transcripts.
 * 
 * DeepSeek is a cost-effective alternative to OpenAI GPT for medical note generation.
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface SOAPNoteFields {
  subjective?: string; // Patient's reported symptoms and concerns
  objective?: string; // Observable information
  assessment?: string; // Clinical assessment and diagnosis
  plan?: string; // Treatment plan and recommendations
  // Additional fields for therapy notes
  patientComplaint?: string;
  personalHistory?: string;
  familyHistory?: string;
  presentation?: string;
  formulationAndDiagnosis?: string;
  treatmentPlan?: string;
  assignments?: string;
}

interface GenerateSOAPNoteOptions {
  transcript: string; // De-identified transcript
  sessionContext?: {
    duration?: number; // Session duration in minutes
    sessionType?: string; // e.g., "Individual Therapy", "Assessment"
  };
}

/**
 * Generate SOAP note from de-identified transcript using DeepSeek
 * 
 * @param options - Options including transcript and session context
 * @returns Structured SOAP note fields
 */
export async function generateSOAPNote(
  options: GenerateSOAPNoteOptions
): Promise<SOAPNoteFields> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured. Please set DEEPSEEK_API_KEY environment variable.");
  }

  const { transcript, sessionContext = {} } = options;

  // Construct prompt for SOAP note generation
  const systemPrompt = `You are a medical AI assistant specialized in generating SOAP (Subjective, Objective, Assessment, Plan) notes for therapy sessions.

Generate a structured SOAP note from the therapy session transcript. Focus on:
- Subjective: Patient's reported symptoms, concerns, and experiences
- Objective: Observable behaviors, mood, appearance, and clinical observations
- Assessment: Clinical interpretation and diagnostic considerations
- Plan: Treatment recommendations, interventions, and next steps

For therapy sessions, also extract:
- Patient Complaint: Main presenting issue
- Personal History: Relevant personal background
- Family History: Relevant family background
- Presentation: How the patient presented in the session
- Formulation and Diagnosis: Clinical formulation and diagnostic considerations
- Treatment Plan: Recommended therapeutic interventions
- Assignments: Homework or tasks assigned to the patient

Return the response as a JSON object with these fields.`;

  const userPrompt = `Generate a SOAP note from this therapy session transcript:

${transcript}

${sessionContext.duration ? `Session duration: ${sessionContext.duration} minutes` : ""}
${sessionContext.sessionType ? `Session type: ${sessionContext.sessionType}` : ""}

Return the SOAP note as a JSON object with the following structure:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "...",
  "patientComplaint": "...",
  "personalHistory": "...",
  "familyHistory": "...",
  "presentation": "...",
  "formulationAndDiagnosis": "...",
  "treatmentPlan": "...",
  "assignments": "..."
}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // or "deepseek-reasoner" for more complex reasoning
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent, factual output
        response_format: { type: "json_object" }, // Request JSON response
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`
      );
    }

    const result = await response.json();

    // Extract JSON from response
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in DeepSeek API response");
    }

    // Parse JSON response
    let soapNote: SOAPNoteFields;
    try {
      soapNote = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        soapNote = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse SOAP note from DeepSeek response");
      }
    }

    return soapNote;
  } catch (error: any) {
    console.error("Error generating SOAP note with DeepSeek:", error);
    throw error;
  }
}
