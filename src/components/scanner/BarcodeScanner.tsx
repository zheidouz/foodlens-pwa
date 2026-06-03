"use client";

import { useEffect } from "react";
import { Barcode, ScanLine, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { useBarcode } from "@/hooks/useBarcode";
import type { BarcodeStatus } from "@/types";

interface BarcodeScannerProps {
  onDetect: (barcode: string) => void;
}

export function BarcodeScanner({ onDetect }: BarcodeScannerProps) {
  const { scannerContainerRef, status, barcode, error, startScanning, stopScanning, reset } =
    useBarcode();

  // Notify parent when barcode is found
  useEffect(() => {
    if (status === "found" && barcode) {
      onDetect(barcode);
    }
  }, [status, barcode, onDetect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatusOverlay = (current: BarcodeStatus) => {
    switch (current) {
      case "idle":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/80 text-white">
            <Barcode className="w-12 h-12 text-sky-400" />
            <p className="text-lg font-medium">Barcode Scanner</p>
            <button
              onClick={startScanning}
              className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-sky-600 active:scale-95"
            >
              Start Scanning
            </button>
          </div>
        );
      case "scanning":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/40 text-white pointer-events-none">
            <ScanLine className="w-8 h-8 animate-pulse text-sky-400" />
            <p className="text-sm text-zinc-200">Point at a barcode...</p>
          </div>
        );
      case "found":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/70 text-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-200">Barcode found!</p>
            <p className="max-w-[80%] truncate rounded bg-zinc-800 px-3 py-1 font-mono text-xs text-zinc-300">
              {barcode}
            </p>
            <button
              onClick={() => {
                stopScanning();
                reset();
              }}
              className="rounded-full bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-600"
            >
              Scan Again
            </button>
          </div>
        );
      case "error":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/90 p-6 text-center text-white">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-semibold text-red-300">Scanner Error</p>
            <p className="max-w-xs text-sm text-zinc-300">{error}</p>
            <button
              onClick={() => {
                reset();
                startScanning();
              }}
              className="mt-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-sky-600"
            >
              <RotateCcw className="mr-1.5 inline-block w-4 h-4" />
              Retry
            </button>
          </div>
        );
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-black">
      {/* The scanner container rendered by html5-qrcode */}
      <div
        id="barcode-scanner-element"
        ref={scannerContainerRef}
        className={`aspect-[4/3] w-full ${
          status === "scanning" || status === "found" ? "" : "hidden"
        }`}
      />

      {/* Status overlays */}
      {(status === "idle" || status === "error") && StatusOverlay(status)}
      {status === "scanning" && StatusOverlay(status)}
      {status === "found" && StatusOverlay(status)}
    </div>
  );
}
