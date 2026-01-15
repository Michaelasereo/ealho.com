"use client";

import { useRef, useEffect, useCallback } from "react";

export interface DailyCallObject {
  join: (options?: any) => void;
  leave: () => void;
  on: (event: string, handler: (data?: any) => void) => void;
  off: (event: string, handler: (data?: any) => void) => void;
  participants: () => Record<string, any>;
  localAudio: () => Promise<MediaStreamTrack | null>;
  destroy: () => void;
}

export interface DailyAudioRecorderProps {
  callObject: DailyCallObject | null;
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Browser-based audio recorder for Daily.co video calls
 * 
 * Records audio using MediaRecorder API:
 * - Captures audio from local microphone and remote participants
 * - Combines audio tracks into a single stream
 * - Records in audio/webm;codecs=opus format
 * - Stores audio blob in browser memory
 */
export function DailyAudioRecorder({
  callObject,
  onRecordingComplete,
  onError,
}: DailyAudioRecorderProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);

  // Create combined audio stream from all participants
  const createCombinedStream = useCallback(async () => {
    if (!callObject) return null;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      // Get local audio track
      const localAudio = await callObject.localAudio();
      if (localAudio) {
        const localSource = audioContext.createMediaStreamSource(new MediaStream([localAudio]));
        localSource.connect(destination);
      }

      // Get remote participant audio tracks
      const participants = callObject.participants();
      for (const [id, participant] of Object.entries(participants)) {
        if (participant.local) continue; // Skip local participant
        
        const audioTrack = participant.tracks?.audio?.persistentTrack;
        if (audioTrack) {
          const remoteSource = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
          remoteSource.connect(destination);
        }
      }

      return destination.stream;
    } catch (error) {
      console.error("[Audio Recorder] Error creating combined stream:", error);
      return null;
    }
  }, [callObject]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!callObject || recorderRef.current) {
      return; // Already recording or no call object
    }

    try {
      const combinedStream = await createCombinedStream();
      if (!combinedStream || combinedStream.getAudioTracks().length === 0) {
        throw new Error("No audio tracks available for recording");
      }

      combinedStreamRef.current = combinedStream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
      });

      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const duration = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current) / 1000)
          : 0;

        // Combine all chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        // Clean up stream
        if (combinedStreamRef.current) {
          combinedStreamRef.current.getTracks().forEach((track) => track.stop());
          combinedStreamRef.current = null;
        }

        // Notify parent component
        onRecordingComplete(audioBlob, duration);
      };

      recorder.onerror = (event) => {
        console.error("[Audio Recorder] Recording error:", event);
        onError?.(new Error("Recording error occurred"));
      };

      recorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
    } catch (error: any) {
      console.error("[Audio Recorder] Error starting recording:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to start recording"));
    }
  }, [callObject, createCombinedStream, onRecordingComplete, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
      startTimeRef.current = null;
    }
  }, []);

  // Handle call events
  useEffect(() => {
    if (!callObject) return;

    const handleJoinedMeeting = () => {
      console.log("[Audio Recorder] Call joined, starting recording...");
      // Small delay to ensure audio tracks are available
      setTimeout(() => {
        startRecording();
      }, 1000);
    };

    const handleLeftMeeting = () => {
      console.log("[Audio Recorder] Call left, stopping recording...");
      stopRecording();
    };

    const handleParticipantJoined = () => {
      // Restart recording if not already recording to capture new participant
      if (!recorderRef.current || recorderRef.current.state === "inactive") {
        setTimeout(() => {
          startRecording();
        }, 500);
      }
    };

    callObject.on("joined-meeting", handleJoinedMeeting);
    callObject.on("left-meeting", handleLeftMeeting);
    callObject.on("participant-joined", handleParticipantJoined);

    return () => {
      callObject.off("joined-meeting", handleJoinedMeeting);
      callObject.off("left-meeting", handleLeftMeeting);
      callObject.off("participant-joined", handleParticipantJoined);
    };
  }, [callObject, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (combinedStreamRef.current) {
        combinedStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopRecording]);

  // Component doesn't render anything - it's a hook-like component
  return null;
}

// Export hook-like functions for manual control if needed
export function useDailyAudioRecorder(
  callObject: DailyCallObject | null,
  onRecordingComplete: (audioBlob: Blob, duration: number) => void,
  onError?: (error: Error) => void
) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);

  const createCombinedStream = useCallback(async () => {
    if (!callObject) return null;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      const localAudio = await callObject.localAudio();
      if (localAudio) {
        const localSource = audioContext.createMediaStreamSource(new MediaStream([localAudio]));
        localSource.connect(destination);
      }

      const participants = callObject.participants();
      for (const [id, participant] of Object.entries(participants)) {
        if (participant.local) continue;
        
        const audioTrack = participant.tracks?.audio?.persistentTrack;
        if (audioTrack) {
          const remoteSource = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
          remoteSource.connect(destination);
        }
      }

      return destination.stream;
    } catch (error) {
      console.error("[Audio Recorder] Error creating combined stream:", error);
      return null;
    }
  }, [callObject]);

  const startRecording = useCallback(async () => {
    if (!callObject || recorderRef.current) return;

    try {
      const combinedStream = await createCombinedStream();
      if (!combinedStream || combinedStream.getAudioTracks().length === 0) {
        throw new Error("No audio tracks available for recording");
      }

      combinedStreamRef.current = combinedStream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const duration = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current) / 1000)
          : 0;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (combinedStreamRef.current) {
          combinedStreamRef.current.getTracks().forEach((track) => track.stop());
          combinedStreamRef.current = null;
        }

        onRecordingComplete(audioBlob, duration);
      };

      recorder.onerror = (event) => {
        console.error("[Audio Recorder] Recording error:", event);
        onError?.(new Error("Recording error occurred"));
      };

      recorderRef.current = recorder;
      recorder.start(1000);
    } catch (error: any) {
      console.error("[Audio Recorder] Error starting recording:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to start recording"));
    }
  }, [callObject, createCombinedStream, onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
      startTimeRef.current = null;
    }
  }, []);

  return { startRecording, stopRecording, isRecording: recorderRef.current?.state === "recording" };
}
