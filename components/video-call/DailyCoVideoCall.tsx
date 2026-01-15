"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe from "@daily-co/daily-js";
import { DailyAudioRecorder, DailyCallObject } from "./DailyAudioRecorder";
import { Loader2, AlertCircle, CheckCircle2, Upload, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DailyCoVideoCallProps {
  bookingId: string;
  bookingTitle: string;
  meetingUrl: string;
  sessionNoteId: string | null;
  userRole: string;
  userId: string;
  therapistId: string;
  startTime: string;
  endTime: string;
}

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error";
type ProcessingStatus = "idle" | "processing" | "completed" | "error";

export function DailyCoVideoCall({
  bookingId,
  bookingTitle,
  meetingUrl,
  sessionNoteId,
  userRole,
  userId,
  therapistId,
  startTime,
  endTime,
}: DailyCoVideoCallProps) {
  const [callObject, setCallObject] = useState<DailyCallObject | null>(null);
  const [callState, setCallState] = useState<"loading" | "joined" | "left" | "error">("loading");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isTherapist = userRole === "THERAPIST" || userId === therapistId;

  // Initialize Daily.co call
  useEffect(() => {
    if (!meetingUrl || callObject) return;

    const initCall = async () => {
      try {
        // Create Daily.co iframe
        const daily = DailyIframe.createFrame(containerRef.current!, {
          url: meetingUrl,
          showLeaveButton: true,
          iframeStyle: {
            width: "100%",
            height: "100%",
            border: "none",
          },
        });

        // Get the call object for audio recording
        const newCallObject = daily as any as DailyCallObject;
        
        // Join the call
        await newCallObject.join({
          userName: userRole === "THERAPIST" ? "Therapist" : "Client",
        });

        newCallObject.on("joined-meeting", () => {
          console.log("[Video Call] Joined meeting");
          setCallState("joined");
        });
        
        newCallObject.on("left-meeting", () => {
          console.log("[Video Call] Left meeting");
          setCallState("left");
        });
        
        newCallObject.on("error", (error: any) => {
          console.error("[Video Call] Error:", error);
          setErrorMessage(error.message || "Failed to join video call");
          setCallState("error");
        });

        setCallObject(newCallObject);

        return () => {
          if (newCallObject) {
            newCallObject.leave();
          }
          daily.destroy();
        };
      } catch (error: any) {
        console.error("[Video Call] Failed to initialize:", error);
        setErrorMessage(error.message || "Failed to initialize video call");
        setCallState("error");
      }
    };

    initCall();
  }, [meetingUrl, callObject, userRole]);

  // Handle audio recording completion
  const handleRecordingComplete = useCallback(
    async (blob: Blob, duration: number) => {
      console.log("[Video Call] Recording complete, duration:", duration, "seconds");
      setAudioBlob(blob);

      // Only upload if we have a session note (therapist booking)
      if (!sessionNoteId || !isTherapist) {
        console.log("[Video Call] No session note or not therapist, skipping upload");
        return;
      }

      // Upload audio automatically
      await uploadAudio(blob);
    },
    [sessionNoteId, isTherapist]
  );

  // Upload audio to server
  const uploadAudio = useCallback(
    async (blob: Blob) => {
      if (!sessionNoteId) {
        setErrorMessage("No session note ID available");
        return;
      }

      setUploadStatus("uploading");
      setUploadProgress(0);
      setErrorMessage(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, `recording-${bookingId}.webm`);
        formData.append("sessionNoteId", sessionNoteId);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        const uploadPromise = new Promise<{ success: boolean; sessionNoteId?: string }>(
          (resolve, reject) => {
            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  resolve({ success: true, sessionNoteId });
                } catch (e) {
                  reject(new Error("Invalid response from server"));
                }
              } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload aborted"));
            });

            xhr.open("POST", "/api/session-notes/upload-audio?autoProcess=true");
            xhr.send(formData);
          }
        );

        const result = await uploadPromise;

        if (result.success) {
          setUploadStatus("processing");
          setUploadProgress(100);
          console.log("[Video Call] Audio uploaded successfully");

          // Trigger AI processing automatically
          await triggerAIProcessing(sessionNoteId);
        }
      } catch (error: any) {
        console.error("[Video Call] Upload error:", error);
        setErrorMessage(error.message || "Failed to upload audio");
        setUploadStatus("error");
      }
    },
    [sessionNoteId, bookingId]
  );

  // Trigger AI processing
  const triggerAIProcessing = useCallback(async (noteId: string) => {
    setProcessingStatus("processing");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/session-notes/${noteId}/process-audio`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process audio");
      }

      setProcessingStatus("completed");
      setUploadStatus("completed");

      // Poll for completion or wait a moment
      setTimeout(() => {
        if (isTherapist) {
          router.push(`/therapist-dashboard/session-notes`);
        } else {
          router.push(`/user-dashboard`);
        }
      }, 2000);
    } catch (error: any) {
      console.error("[Video Call] Processing error:", error);
      setErrorMessage(error.message || "Failed to process audio");
      setProcessingStatus("error");
    }
  }, [isTherapist, router]);

  // Handle browser close/refresh - attempt to upload if recording exists
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (audioBlob && uploadStatus !== "completed" && uploadStatus !== "uploading") {
        // Try to upload before closing (this might not work in all browsers)
        event.preventDefault();
        event.returnValue = "";
        
        // Attempt to upload synchronously (limited time)
        if (sessionNoteId && isTherapist) {
          const formData = new FormData();
          formData.append("audio", audioBlob, `recording-${bookingId}.webm`);
          formData.append("sessionNoteId", sessionNoteId);
          
          // Use sendBeacon for better reliability
          navigator.sendBeacon?.(
            "/api/session-notes/upload-audio",
            formData
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [audioBlob, uploadStatus, sessionNoteId, isTherapist, bookingId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="bg-[#171717] border-b border-[#262626] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#f9fafb]">{bookingTitle}</h1>
            <p className="text-sm text-[#9ca3af] mt-1">
              {new Date(startTime).toLocaleString()} - {new Date(endTime).toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#1a1a1a]"
          >
            Exit Call
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {(uploadStatus !== "idle" || processingStatus !== "idle" || errorMessage) && (
        <div className="bg-[#1a1a1a] border-b border-[#262626] px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {uploadStatus === "uploading" && (
              <>
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <span className="text-sm text-[#d1d5db]">
                  Uploading audio... {uploadProgress}%
                </span>
              </>
            )}
            {uploadStatus === "processing" && processingStatus === "processing" && (
              <>
                <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="text-sm text-[#d1d5db]">
                  Processing audio and generating notes...
                </span>
              </>
            )}
            {uploadStatus === "completed" && processingStatus === "completed" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm text-[#d1d5db]">
                  Notes generated successfully! Redirecting...
                </span>
              </>
            )}
            {errorMessage && (
              <>
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-400">{errorMessage}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Container */}
      <div className="flex-1 relative">
        {callState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-[#d1d5db]">Joining video call...</p>
            </div>
          </div>
        )}

        {callState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-[#d1d5db] mb-4">{errorMessage || "Failed to join video call"}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />

        {/* Audio Recorder (hidden, handles recording automatically) */}
        {callObject && isTherapist && sessionNoteId && (
          <DailyAudioRecorder
            callObject={callObject}
            onRecordingComplete={handleRecordingComplete}
            onError={(error) => {
              console.error("[Video Call] Recording error:", error);
              setErrorMessage(`Recording error: ${error.message}`);
            }}
          />
        )}
      </div>
    </div>
  );
}