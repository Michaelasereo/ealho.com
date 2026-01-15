"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessAudioButtonProps {
  sessionNoteId: string;
  onProcessingComplete?: () => void;
  onProcessingError?: (error: string) => void;
  disabled?: boolean;
}

export function ProcessAudioButton({
  sessionNoteId,
  onProcessingComplete,
  onProcessingError,
  disabled = false,
}: ProcessAudioButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/session-notes/${sessionNoteId}/process-audio`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process audio");
      }

      const result = await response.json();
      onProcessingComplete?.();
      
      // Refresh the page to show updated note
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error processing audio:", error);
      onProcessingError?.(error.message || "Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleProcess}
      disabled={disabled || isProcessing}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate AI Notes
        </>
      )}
    </Button>
  );
}
