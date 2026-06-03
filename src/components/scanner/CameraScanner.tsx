"use client";

import { useRef, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import type { CameraStatus } from "@/types";

interface CameraScannerProps {
  onCapture: (dataUrl: string) => void;
}

export function CameraScanner({ onCapture }: CameraScannerProps) {
  const { videoRef, canvasRef, status, error, startCamera, stopCamera, captureSnapshot } =
    useCamera();
  const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Expose capture result
  const handleCapture = () => {
    const snapshot = captureSnapshot();
    if (snapshot) {
      onCapture(snapshot);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOverlay = (status: CameraStatus) => {
    switch (status) {
      case "idle":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/80 text-white">
            <Camera className="w-12 h-12 text-emerald-400" />
            <p className="text-lg font-medium">Camera ready</p>
            <button
              onClick={startCamera}
              className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
            >
              Start Camera
            </button>
          </div>
        );
      case "requesting":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/80 text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm text-zinc-300">Requesting camera access...</p>
          </div>
        );
      case "error":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/90 p-6 text-center text-white">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-semibold text-red-300">Camera Error</p>
            <p className="max-w-xs text-sm text-zinc-300">
              {error?.message ?? "An unknown error occurred."}
            </p>
            <button
              onClick={startCamera}
              className="mt-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
            >
              Try Again
            </button>
          </div>
        );
      case "captured":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/70 text-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-200">Snapshot captured!</p>
            <button
              onClick={() => {
                stopCamera();
                startCamera();
              }}
              className="rounded-full bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-600"
            >
              Retake
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-black">
      {/* Hidden canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full aspect-[4/3] object-cover ${
          status === "streaming" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Status overlays */}
      {status !== "streaming" && statusOverlay(status)}

      {/* Capture button */}
      {status === "streaming" && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={handleCapture}
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Capture photo"
          >
            <div className="h-10 w-10 rounded-full bg-white" />
          </button>
        </div>
      )}
    </div>
  );
}
