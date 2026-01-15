"use client";

import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AIProcessingStatusProps {
  transcriptionStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  aiProcessingStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  isAIGenerated?: boolean;
  therapistReviewed?: boolean;
}

export function AIProcessingStatus({
  transcriptionStatus = "PENDING",
  aiProcessingStatus = "PENDING",
  isAIGenerated = false,
  therapistReviewed = false,
}: AIProcessingStatusProps) {
  if (!isAIGenerated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-[#9ca3af]" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "Processing...";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "text-blue-400";
      case "COMPLETED":
        return "text-green-400";
      case "FAILED":
        return "text-red-400";
      default:
        return "text-[#9ca3af]";
    }
  };

  return (
    <div className="space-y-2 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-[#f9fafb]">AI Processing Status</span>
        {therapistReviewed && (
          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
            Reviewed
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Transcription Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">Transcription:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(transcriptionStatus)}
            <span className={`text-xs ${getStatusColor(transcriptionStatus)}`}>
              {getStatusText(transcriptionStatus)}
            </span>
          </div>
        </div>

        {/* AI Processing Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">SOAP Note Generation:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(aiProcessingStatus)}
            <span className={`text-xs ${getStatusColor(aiProcessingStatus)}`}>
              {getStatusText(aiProcessingStatus)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
