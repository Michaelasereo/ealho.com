/**
 * Nigerian PHI (Protected Health Information) De-identification Service
 * 
 * De-identifies Nigerian names, locations, phone numbers, and other PHI
 * from transcribed text before sending to AI for SOAP note generation.
 * 
 * This is a simplified implementation. In production, this could be:
 * - A more sophisticated NLP service
 * - A Cloudflare Worker for edge processing
 * - Integration with specialized healthcare de-identification services
 */

/**
 * Nigerian common first names (partial list - should be expanded)
 */
const NIGERIAN_FIRST_NAMES = [
  // Yoruba
  "Ade", "Bola", "Funke", "Kemi", "Olumide", "Tunde", "Yemi", "Segun", "Folake", "Bimbo",
  "Adebayo", "Adenike", "Ayodele", "Babatunde", "Folajimi", "Olumuyiwa", "Toluwalase",
  // Igbo
  "Chika", "Chidi", "Ngozi", "Ifeoma", "Obinna", "Chioma", "Emeka", "Adaora", "Kelechi", "Amara",
  "Chinonso", "Chiamaka", "Tochukwu", "Onyinye", "Ndidi", "Chibuzo",
  // Hausa
  "Amina", "Fatima", "Hassan", "Ibrahim", "Maryam", "Musa", "Aisha", "Yusuf", "Zainab", "Halima",
  "Abdullahi", "Hamza", "Sadiq", "Bashir",
  // Common Nigerian names
  "Blessing", "Faith", "Grace", "Hope", "Joy", "Peace", "Patience", "Mercy",
  "David", "Michael", "John", "Peter", "Paul", "James", "Joseph", "Daniel",
].map(name => name.toLowerCase());

/**
 * Nigerian states and major cities
 */
const NIGERIAN_LOCATIONS = [
  // States
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
  // Major cities
  "Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna",
  "Aba", "Maiduguri", "Ilorin", "Onitsha", "Warri", "Abeokuta", "Enugu",
  "Calabar", "Uyo", "Akure", "Owerri", "Oshogbo", "Jos", "Bauchi", "Yola",
].map(loc => loc.toLowerCase());

/**
 * Nigerian phone number patterns
 * Format: +234, 234, 0 followed by 10 digits
 * Examples: +2348012345678, 2348012345678, 08012345678
 */
const PHONE_PATTERNS = [
  /\+?234[789]\d{9}/g, // +234 or 234 prefix
  /0[789]\d{9}/g, // 0 prefix (local format)
];

/**
 * Email pattern
 */
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/**
 * De-identify Nigerian PHI from text
 * 
 * Replaces:
 * - Nigerian names with [PATIENT_NAME]
 * - Nigerian locations with [LOCATION]
 * - Phone numbers with [PHONE]
 * - Email addresses with [EMAIL]
 * 
 * @param text - Text to de-identify
 * @returns De-identified text with PHI replaced by placeholders
 */
export function deIdentifyNigerianPHI(text: string): string {
  let deIdentified = text;

  // Replace phone numbers
  PHONE_PATTERNS.forEach(pattern => {
    deIdentified = deIdentified.replace(pattern, "[PHONE]");
  });

  // Replace email addresses
  deIdentified = deIdentified.replace(EMAIL_PATTERN, "[EMAIL]");

  // Replace Nigerian locations
  NIGERIAN_LOCATIONS.forEach(location => {
    const regex = new RegExp(`\\b${location}\\b`, "gi");
    deIdentified = deIdentified.replace(regex, "[LOCATION]");
  });

  // Replace Nigerian names (simple word-boundary matching)
  // Note: This is a simplified approach. In production, use more sophisticated NLP
  NIGERIAN_FIRST_NAMES.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, "gi");
    deIdentified = deIdentified.replace(regex, "[PATIENT_NAME]");
  });

  // Replace common patterns that might indicate names (capitalized words at sentence start)
  // This is a heuristic - names often appear after "Mr.", "Mrs.", "Dr.", etc.
  deIdentified = deIdentified.replace(
    /\b(?:Mr|Mrs|Miss|Ms|Dr|Prof)\.?\s+([A-Z][a-z]+)\b/g,
    (match, name) => {
      return match.replace(name, "[PATIENT_NAME]");
    }
  );

  return deIdentified;
}

/**
 * Re-identify text by replacing placeholders with actual values
 * 
 * @param deIdentifiedText - Text with placeholders
 * @param phiMap - Map of placeholder keys to actual values
 * @returns Re-identified text
 */
export function reIdentifyPHI(
  deIdentifiedText: string,
  phiMap: {
    patientName?: string;
    location?: string;
    phone?: string;
    email?: string;
  }
): string {
  let reIdentified = deIdentifiedText;

  if (phiMap.patientName) {
    reIdentified = reIdentified.replace(/\[PATIENT_NAME\]/g, phiMap.patientName);
  }
  if (phiMap.location) {
    reIdentified = reIdentified.replace(/\[LOCATION\]/g, phiMap.location);
  }
  if (phiMap.phone) {
    reIdentified = reIdentified.replace(/\[PHONE\]/g, phiMap.phone);
  }
  if (phiMap.email) {
    reIdentified = reIdentified.replace(/\[EMAIL\]/g, phiMap.email);
  }

  return reIdentified;
}
