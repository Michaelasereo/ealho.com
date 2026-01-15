/**
 * Standardized Form Submission Hook
 * 
 * Provides CSRF protection, request deduplication, optimistic updates,
 * and consistent error handling for all form submissions.
 * 
 * Based on industry best practices from Stripe and Shopify.
 */

import { useState, useCallback, useRef } from "react";

export interface FormSubmissionOptions {
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: (data: any) => void;
  rollbackOptimisticUpdate?: () => void;
  skipCSRF?: boolean;
  timeout?: number;
}

export interface FormSubmissionState {
  isSubmitting: boolean;
  error: Error | null;
  data: any | null;
}

export interface FormSubmissionResult {
  submit: (data: any) => Promise<void>;
  reset: () => void;
  state: FormSubmissionState;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Generate a unique request ID for deduplication
 */
function generateRequestId(endpoint: string, data: any): string {
  const dataHash = JSON.stringify(data);
  return `${endpoint}:${dataHash}`;
}

/**
 * Standardized form submission hook
 */
export function useFormSubmission(
  options: FormSubmissionOptions
): FormSubmissionResult {
  const {
    endpoint,
    method = "POST",
    onSuccess,
    onError,
    optimisticUpdate,
    rollbackOptimisticUpdate,
    skipCSRF = false,
    timeout = 30000,
  } = options;

  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    error: null,
    data: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string | null>(null);

  const submit = useCallback(
    async (formData: any) => {
      // Prevent duplicate submissions
      const requestId = generateRequestId(endpoint, formData);
      
      if (pendingRequests.has(requestId)) {
        console.warn("Duplicate request detected, skipping:", requestId);
        return;
      }

      // Create abort controller for timeout
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      requestIdRef.current = requestId;

      // Apply optimistic update if provided
      if (optimisticUpdate) {
        try {
          optimisticUpdate(formData);
        } catch (error) {
          console.error("Optimistic update error:", error);
        }
      }

      setState({
        isSubmitting: true,
        error: null,
        data: null,
      });

      // Create request promise
      const requestPromise = (async () => {
        try {
          // Get CSRF token from meta tag or cookie
          let csrfToken: string | null = null;
          if (!skipCSRF) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            csrfToken = metaTag?.getAttribute("content") || null;
          }

          // Prepare headers
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };

          if (csrfToken) {
            headers["x-csrf-token"] = csrfToken;
          }

          // Set timeout
          const timeoutId = setTimeout(() => {
            abortController.abort();
          }, timeout);

          // Make request
          const response = await fetch(endpoint, {
            method,
            headers,
            credentials: "include",
            body: JSON.stringify(formData),
            signal: abortController.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP ${response.status}: ${response.statusText}`,
            }));
            throw new Error(errorData.error || "Request failed");
          }

          const data = await response.json();

          setState({
            isSubmitting: false,
            error: null,
            data,
          });

          if (onSuccess) {
            onSuccess(data);
          }

          return data;
        } catch (error: any) {
          // Rollback optimistic update on error
          if (rollbackOptimisticUpdate && error.name !== "AbortError") {
            try {
              rollbackOptimisticUpdate();
            } catch (rollbackError) {
              console.error("Rollback error:", rollbackError);
            }
          }

          const submissionError =
            error.name === "AbortError"
              ? new Error("Request timeout")
              : error instanceof Error
              ? error
              : new Error("Unknown error");

          setState({
            isSubmitting: false,
            error: submissionError,
            data: null,
          });

          if (onError) {
            onError(submissionError);
          }

          throw submissionError;
        } finally {
          // Remove from pending requests
          pendingRequests.delete(requestId);
        }
      })();

      // Add to pending requests
      pendingRequests.set(requestId, requestPromise);

      try {
        await requestPromise;
      } catch (error) {
        // Error already handled in promise
      }
    },
    [
      endpoint,
      method,
      onSuccess,
      onError,
      optimisticUpdate,
      rollbackOptimisticUpdate,
      skipCSRF,
      timeout,
    ]
  );

  const reset = useCallback(() => {
    // Cancel pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Remove from pending requests
    if (requestIdRef.current) {
      pendingRequests.delete(requestIdRef.current);
    }

    setState({
      isSubmitting: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    submit,
    reset,
    state,
  };
}

