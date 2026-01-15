"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Auto-save hook
 * 
 * Automatically saves form data with debouncing.
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (dataToSave: T) => {
      // Skip if data hasn't changed
      if (JSON.stringify(dataToSave) === JSON.stringify(lastSavedRef.current)) {
        return;
      }

      setIsSaving(true);
      try {
        await saveFn(dataToSave);
        lastSavedRef.current = dataToSave;
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [saveFn]
  );

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, delay]);

  return { isSaving };
}

