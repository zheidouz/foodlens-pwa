"use client";

import { useState, useCallback } from "react";
import { Camera, Barcode, ImageUp, ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";
import { CameraScanner } from "@/components/scanner/CameraScanner";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { PhotoUpload } from "@/components/scanner/PhotoUpload";
import type { ScanMode, ScanResult } from "@/types";

export default function ScanPage() {
  const [activeMode, setActiveMode] = useState<ScanMode>("camera");
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleCapture = useCallback(
    (dataUrl: string) => {
      setResult({
        raw: dataUrl,
        source: "camera",
        capturedAt: new Date(),
        mimeType: "image/jpeg",
      });
    },
    []
  );

  const handleBarcodeDetect = useCallback((barcode: string) => {
    setResult({
      raw: barcode,
      source: "barcode",
      capturedAt: new Date(),
    });
  }, []);

  const handlePhotoSelect = useCallback((_file: File, dataUrl: string) => {
    setResult({
      raw: dataUrl,
      source: "upload",
      capturedAt: new Date(),
      mimeType: _file.type,
    });
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const modes: { key: ScanMode; label: string; icon: React.ReactNode }[] = [
    { key: "camera", label: "Camera", icon: <Camera className="h-4 w-4" /> },
    { key: "barcode", label: "Barcode", icon: <Barcode className="h-4 w-4" /> },
    { key: "upload", label: "Upload", icon: <ImageUp className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white dark:bg-black">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Scan Food
        </h1>
      </header>

      {/* Mode Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => {
              setActiveMode(mode.key);
              clearResult();
            }}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
              activeMode === mode.key
                ? "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {/* Scanner Content */}
      <div className="flex-1 p-4">
        {result ? (
          /* Result view */
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {result.source === "barcode" ? "Detected Barcode" : "Captured Image"}
              </h2>

              {result.source === "barcode" ? (
                <div className="rounded-xl bg-white p-4 font-mono text-lg text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100">
                  {result.raw}
                </div>
              ) : (
                <img
                  src={result.raw}
                  alt="Captured food"
                  className="w-full rounded-xl object-contain shadow-sm"
                />
              )}

              <p className="mt-2 text-xs text-zinc-400">
                Captured at {result.capturedAt.toLocaleTimeString()}
              </p>
            </div>

            {/* Placeholder Analyze button */}
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FlaskConical className="h-5 w-5" />
              Analyze Food
            </button>

            <button
              onClick={clearResult}
              className="w-full text-sm font-medium text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Scan Again
            </button>
          </div>
        ) : (
          /* Scanner view */
          <>
            {activeMode === "camera" && (
              <CameraScanner onCapture={handleCapture} />
            )}
            {activeMode === "barcode" && (
              <BarcodeScanner onDetect={handleBarcodeDetect} />
            )}
            {activeMode === "upload" && (
              <PhotoUpload onSelect={handlePhotoSelect} />
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      {!result && (
        <p className="pb-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
          {activeMode === "camera" && "Capture a photo of the food label or package"}
          {activeMode === "barcode" && "Point your camera at a product barcode"}
          {activeMode === "upload" && "Upload a photo of the nutrition label"}
        </p>
      )}
    </div>
  );
}
