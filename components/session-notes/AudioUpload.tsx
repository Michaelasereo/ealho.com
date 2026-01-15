"use client";

import { useState, useRef } from "react";
import { Upload, Mic, X, Loader2, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioUploadProps {
  sessionNoteId?: string;
  bookingId?: string;
  onUploadSuccess?: (audioUrl: string) => void;
  onUploadError?: (error: string) => void;
  existingAudioUrl?: string;
  disabled?: boolean;
}

export function AudioUpload({
  sessionNoteId,
  bookingId,
  onUploadSuccess,
  onUploadError,
  existingAudioUrl,
  disabled = false,
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["audio/webm", "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-m4a", "audio/ogg"];
    const isValidType = allowedTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith(".webm") ||
      file.name.toLowerCase().endsWith(".mp3") ||
      file.name.toLowerCase().endsWith(".wav") ||
      file.name.toLowerCase().endsWith(".m4a");

    if (!isValidType) {
      onUploadError?.("Invalid audio file type. Supported: webm, mp3, wav, m4a, ogg");
      return;
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    setSelectedFile(file);
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!sessionNoteId && !bookingId) {
      onUploadError?.("Session note ID or booking ID is required");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      if (sessionNoteId) {
        formData.append("sessionNoteId", sessionNoteId);
      }
      if (bookingId) {
        formData.append("bookingId", bookingId);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      // Handle response
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadSuccess?.(response.audioUrl);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        } else {
          const error = JSON.parse(xhr.responseText);
          onUploadError?.(error.error || "Failed to upload audio");
          setIsUploading(false);
          setUploadProgress(0);
        }
      });

      xhr.addEventListener("error", () => {
        onUploadError?.("Network error: Failed to upload audio");
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.open("POST", "/api/session-notes/upload-audio");
      xhr.send(formData);
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      onUploadError?.(error.message || "Failed to upload audio");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#D4D4D4]">
        Audio Recording
      </label>
      <div className="border border-[#262626] rounded-lg p-4 bg-[#0a0a0a]">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/webm,audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,audio/ogg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {existingAudioUrl ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-green-400" />
              <span className="text-sm text-[#f9fafb]">Audio recording uploaded</span>
            </div>
            <audio controls className="h-8">
              <source src={existingAudioUrl} />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-[#9ca3af]" />
              <span className="text-sm text-[#f9fafb]">{selectedFile.name}</span>
              <span className="text-xs text-[#9ca3af]">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                className="text-[#9ca3af] hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-[#9ca3af] mb-2" />
            <span className="text-sm text-[#9ca3af] mb-1">Click to upload audio recording</span>
            <span className="text-xs text-[#9ca3af] mb-4">
              Supported: webm, mp3, wav, m4a, ogg (max 25MB)
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 disabled:opacity-50"
            >
              <Mic className="h-4 w-4 mr-2" />
              Upload Audio
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#9ca3af]">Uploading...</span>
              <span className="text-sm text-[#9ca3af]">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-[#262626] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-linear rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
