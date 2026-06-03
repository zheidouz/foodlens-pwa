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

// ---------------------------------------------------------------------------
// Analysis & Results types
// ---------------------------------------------------------------------------

/** A single good or bad factor with score */
export interface Factor {
  label: string;
  score: number;
  type: "good" | "bad";
  icon?: string;
}

/** Scoring result from Cloud Functions */
export interface AnalysisScore {
  health_score: number;
  nutriscore: string;
  ecoscore: string | null;
  nova_group: number | null;
  good_factors: Factor[];
  bad_factors: Factor[];
}

/** Full analysis response from Cloud Functions */
export interface AnalysisResult {
  success: boolean;
  product: Record<string, unknown>;
  score: AnalysisScore;
}

/** Scan data saved to Firestore */
export interface SavedScan {
  id?: string;
  userId: string;
  productName: string;
  barcode?: string;
  imageBase64?: string;
  healthScore: number;
  nutriscore: string;
  novaGroup: number | null;
  goodFactors: Factor[];
  badFactors: Factor[];
  allergens: string[];
  scannedAt: Date;
  createdAt: Date;
}
