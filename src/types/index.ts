/** Scan input sources */
export type ScanMode = "camera" | "barcode" | "upload";

/** Result from a scan operation */
export interface ScanResult {
  /** Raw barcode string, base64 image data URL, or text */
  raw: string;
  /** How the scan was performed */
  source: ScanMode;
  /** Timestamp of capture */
  capturedAt: Date;
  /** MIME type if applicable */
  mimeType?: string;
}

/** Camera stream states */
export type CameraStatus = "idle" | "requesting" | "streaming" | "error" | "captured";

/** Barcode scanner states */
export type BarcodeStatus = "idle" | "scanning" | "found" | "error";

/** Photo upload states */
export type UploadStatus = "idle" | "selected" | "error";

/** Camera error reasons */
export interface CameraError {
  name: string;
  message: string;
  type: "permission-denied" | "not-found" | "unknown";
}

/** Extract the type from a decoded barcode */
export interface BarcodeData {
  rawValue: string;
  format?: string;
}
