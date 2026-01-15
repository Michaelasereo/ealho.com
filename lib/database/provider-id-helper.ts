/**
 * Provider ID Helper
 * 
 * Utility functions to handle the migration from dietitian_id to provider_id.
 * Supports both fields during the migration period for backward compatibility.
 */

/**
 * Get provider ID field name (supports migration period)
 * Returns 'provider_id' if available, falls back to 'dietitian_id'
 */
export function getProviderIdField(): string {
  // During migration, prefer provider_id but support dietitian_id
  return "provider_id";
}

/**
 * Build a query filter that supports both provider_id and dietitian_id
 * during the migration period
 */
export function buildProviderIdFilter(
  query: any,
  providerId: string,
  fieldName: string = "provider_id"
): any {
  // Use OR condition to support both fields during migration
  return query.or(`${fieldName}.eq.${providerId},dietitian_id.eq.${providerId}`);
}

/**
 * Get provider ID from a record (supports both fields)
 */
export function getProviderId(record: any): string | null {
  return record?.provider_id || record?.dietitian_id || null;
}

/**
 * Set provider ID on a record (sets both during migration)
 */
export function setProviderId(record: any, providerId: string): void {
  record.provider_id = providerId;
  // Keep dietitian_id for backward compatibility during migration
  if (!record.dietitian_id) {
    record.dietitian_id = providerId;
  }
}

