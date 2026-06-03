"use client";

import { useState, useRef, useCallback } from "react";
import { ImageUp, FileWarning, CheckCircle2, X } from "lucide-react";
import type { UploadStatus } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// HEIC/HEIF files often report empty MIME type on some browsers.
// Only allow empty type for known image file extensions.
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

function hasImageExtension(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf("."));
  return IMAGE_EXTENSIONS.includes(ext);
}

interface PhotoUploadProps {
  onSelect: (file: File, dataUrl: string) => void;
}

export function PhotoUpload({ onSelect }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcess = useCallback(
    (file: File) => {
      // Validate by MIME type (strict) or by file extension (for empty-MIME browsers)
      const typeOk = ACCEPTED_TYPES.includes(file.type);
      const extOk = !file.type && hasImageExtension(file.name);
      if (!typeOk && !extOk) {
        setStatus("error");
        setErrorMsg(
          `Unsupported file type "${file.type || "unknown"}". Please use JPEG, PNG, or WebP.`
        );
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setStatus("error");
        setErrorMsg(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
        return;
      }

      // Read as data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        setStatus("selected");
        onSelect(file, dataUrl);
      };
      reader.onerror = () => {
        setStatus("error");
        setErrorMsg("Failed to read file. Please try again.");
      };
      reader.readAsDataURL(file);
    },
    [onSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setPreview(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : status === "error"
              ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
              : preview
                ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800/30 dark:hover:border-zinc-500"
        }`}
      >
        {preview ? (
          <>
            <div className="relative w-full max-w-xs">
              <img
                src={preview}
                alt="Uploaded preview"
                className="max-h-48 w-full rounded-lg object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-white shadow transition-colors hover:bg-zinc-700"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Image selected</span>
            </div>
            <p className="text-xs text-zinc-400">Tap to replace or drop a new image</p>
          </>
        ) : (
          <>
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                status === "error"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : isDragging
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {status === "error" ? (
                <FileWarning className="h-7 w-7 text-red-500" />
              ) : (
                <ImageUp
                  className={`h-7 w-7 ${
                    isDragging
                      ? "text-emerald-500"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isDragging ? "Drop your image here" : "Tap to upload or drag & drop"}
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                JPEG, PNG, WebP &middot; Max 10 MB
              </p>
            </div>
            {status === "error" && errorMsg && (
              <p className="text-sm text-red-500 dark:text-red-400">{errorMsg}</p>
            )}
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select an image file"
        />
      </div>
    </div>
  );
}
