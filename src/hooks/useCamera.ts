"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { CameraStatus, CameraError } from "@/types";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  status: CameraStatus;
  error: CameraError | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureSnapshot: () => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraError | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("streaming");
    } catch (err: unknown) {
      const camErr: CameraError = {
        name: "CameraError",
        message: "Unable to access camera.",
        type: "unknown",
      };

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          camErr.type = "permission-denied";
          camErr.message = "Camera permission denied. Please allow camera access in your browser settings.";
        } else if (err.name === "NotFoundError") {
          camErr.type = "not-found";
          camErr.message = "No camera found on this device.";
        }
      }

      setError(camErr);
      setStatus("error");
    }
  }, []);

  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    setStatus("captured");

    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    status,
    error,
    startCamera,
    stopCamera,
    captureSnapshot,
  };
}
