import { NextResponse } from "next/server";

/**
 * Security Hardening Utilities
 * 
 * Implements security headers. Edge-compatible (no Node.js modules).
 */
export class SecurityHardener {
  /**
   * Get Content Security Policy headers
   */
  static getCSPHeaders(): Record<string, string> {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'self' https://*.supabase.co",
      ].join("; "),
    };
  }

  /**
   * Get all security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      ...this.getCSPHeaders(),
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Strict-Transport-Security": process.env.NODE_ENV === "production"
        ? "max-age=31536000; includeSubDomains; preload"
        : "",
    };
  }

  /**
   * Add security headers to response
   * Edge-compatible - no Node.js modules
   */
  static addSecurityHeaders(response: NextResponse): NextResponse {
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        response.headers.set(key, value);
      }
    });

    return response;
  }
}

