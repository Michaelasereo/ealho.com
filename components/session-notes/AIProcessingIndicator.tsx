"use client";

import { Loader2, CheckCircle2, XCircle, AlertCircle, Brain, Upload } from "lucide-react";

interface AIProcessingIndicatorProps {
  transcriptionStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  aiProcessingStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  therapistReviewed?: boolean | null;
  showLabels?: boolean;
  compact?: boolean;
}

export function AIProcessingIndicator({
  transcriptionStatus = "PENDING",
  aiProcessingStatus = "PENDING",
  therapistReviewed = false,
  showLabels = true,
  compact = false,
}: AIProcessingIndicatorProps) {
  // Get status for transcription
  const getTranscriptionStatus = () => {
    switch (transcriptionStatus) {
      case "PROCESSING":
        return {
          icon: Loader2,
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          label: "Transcribing...",
          animate: true,
        };
      case "COMPLETED":
        return {
          icon: CheckCircle2,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          label: "Transcribed",
          animate: false,
        };
      case "FAILED":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          label: "Transcription Failed",
          animate: false,
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          label: "Pending",
          animate: false,
        };
    }
  };

  // Get status for AI processing
  const getAIStatus = () => {
    switch (aiProcessingStatus) {
      case "PROCESSING":
        return {
          icon: Brain,
          color: "text-purple-400",
          bgColor: "bg-purple-500/20",
          label: "Generating Notes...",
          animate: true,
        };
      case "COMPLETED":
        return therapistReviewed
          ? {
              icon: CheckCircle2,
              color: "text-green-400",
              bgColor: "bg-green-500/20",
              label: "Notes Reviewed",
              animate: false,
            }
          : {
              icon: CheckCircle2,
              color: "text-yellow-400",
              bgColor: "bg-yellow-500/20",
              label: "Notes Ready",
              animate: false,
            };
      case "FAILED":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          label: "Generation Failed",
          animate: false,
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          label: "Pending",
          animate: false,
        };
    }
  };

  const transcription = getTranscriptionStatus();
  const aiStatus = getAIStatus();
  const TranscriptionIcon = transcription.icon;
  const AIIcon = aiStatus.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${transcription.bgColor}`}>
          <TranscriptionIcon
            className={`h-3 w-3 ${transcription.color} ${transcription.animate ? "animate-spin" : ""}`}
          />
          {showLabels && (
            <span className={`text-xs ${transcription.color}`}>{transcription.label}</span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${aiStatus.bgColor}`}>
          <AIIcon
            className={`h-3 w-3 ${aiStatus.color} ${aiStatus.animate ? "animate-pulse" : ""}`}
          />
          {showLabels && <span className={`text-xs ${aiStatus.color}`}>{aiStatus.label}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${transcription.bgColor}`}>
        <TranscriptionIcon
          className={`h-4 w-4 ${transcription.color} ${transcription.animate ? "animate-spin" : ""}`}
        />
        {showLabels && <span className={`text-sm font-medium ${transcription.color}`}>{transcription.label}</span>}
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${aiStatus.bgColor}`}>
        <AIIcon
          className={`h-4 w-4 ${aiStatus.color} ${aiStatus.animate ? "animate-pulse" : ""}`}
        />
        {showLabels && <span className={`text-sm font-medium ${aiStatus.color}`}>{aiStatus.label}</span>}
      </div>
    </div>
  );
}
