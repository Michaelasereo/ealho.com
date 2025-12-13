/**
 * Format dietitian name with ", RD" suffix
 * @param name - The dietitian's name
 * @returns Formatted name with ", RD" suffix (e.g., "Asere Michael, RD")
 */
export function formatDietitianName(name: string | null | undefined): string {
  if (!name || name.trim() === '') {
    return 'Dietitian, RD';
  }

  const trimmedName = name.trim();
  
  // Check if name already ends with ", RD" (case-insensitive)
  if (trimmedName.match(/,\s*RD$/i)) {
    return trimmedName;
  }

  // Add ", RD" suffix
  return `${trimmedName}, RD`;
}
