/**
 * CSRF Protection
 * 
 * Implements CSRF token generation and validation for form submissions.
 * Based on industry best practices from Stripe and Shopify.
 */

import { randomBytes } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  token: string,
  sessionToken: string | null
): boolean {
  if (!token || !sessionToken) {
    return false;
  }

  return token === sessionToken;
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return (
    request.headers.get("x-csrf-token") ||
    request.headers.get("csrf-token") ||
    null
  );
}

/**
 * Create CSRF token response header
 */
export function createCSRFTokenHeader(token: string): HeadersInit {
  return {
    "X-CSRF-Token": token,
  };
}
