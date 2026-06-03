"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { BarcodeStatus } from "@/types";

const SCANNER_ID = "barcode-scanner-element";

interface UseBarcodeReturn {
  scannerContainerRef: React.RefObject<HTMLDivElement | null>;
  status: BarcodeStatus;
  barcode: string | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  reset: () => void;
}

export function useBarcode(): UseBarcodeReturn {
  const scannerContainerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<BarcodeStatus>("idle");
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          // Successfully stopped
        })
        .catch(() => {
          // Already stopped
        });
    }
    setStatus("idle");
  }, []);

  const startScanning = useCallback(async () => {
    setStatus("scanning");
    setError(null);
    setBarcode(null);

    try {
      if (!scannerContainerRef.current) {
        throw new Error("Scanner container not found in DOM.");
      }

      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          setBarcode(decodedText);
          setStatus("found");
          // Stop scanning once we found a barcode
          scanner.stop().catch(() => {});
        },
        () => {
          // QR code scanning feedback — no-op, just keep scanning
        }
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start barcode scanner.";
      setError(message);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setBarcode(null);
    setError(null);
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  return {
    scannerContainerRef,
    status,
    barcode,
    error,
    startScanning,
    stopScanning,
    reset,
  };
}
