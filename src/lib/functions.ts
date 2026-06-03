import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

// Cloud Functions are deployed to us-central1
const fbFunctions = (() => {
  if (typeof window === "undefined") return null;
  return getFunctions(app, "us-central1");
})();

/**
 * Look up a product by barcode via Open Food Facts API.
 * Returns product data + health score.
 */
export async function lookUpBarcode(
  barcode: string
): Promise<{
  success: boolean;
  product: Record<string, unknown>;
  score: {
    health_score: number;
    nutriscore: string;
    ecoscore: string | null;
    nova_group: number | null;
    good_factors: { label: string; score: number; type: "good" | "bad" }[];
    bad_factors: { label: string; score: number; type: "good" | "bad" }[];
  };
}> {
  if (!fbFunctions) {
    throw new Error("Cloud Functions not available on the server.");
  }

  const fn = httpsCallable<{ barcode: string }, unknown>(fbFunctions, "lookUpBarcode");
  const result = await fn({ barcode });
  return result.data as ReturnType<typeof lookUpBarcode>;
}

/**
 * Analyze a food image via Gemini API.
 * Takes a base64 data URL and returns product data + health score.
 */
export async function analyzeFoodImage(
  imageBase64: string,
  mimeType?: string
): Promise<{
  success: boolean;
  product: Record<string, unknown>;
  score: {
    health_score: number;
    nutriscore: string;
    ecoscore: string | null;
    nova_group: number | null;
    good_factors: { label: string; score: number; type: "good" | "bad" }[];
    bad_factors: { label: string; score: number; type: "good" | "bad" }[];
  };
}> {
  if (!fbFunctions) {
    throw new Error("Cloud Functions not available on the server.");
  }

  const fn = httpsCallable<{ imageBase64: string; mimeType?: string }, unknown>(
    fbFunctions,
    "analyzeFoodImage"
  );
  const result = await fn({ imageBase64, mimeType: mimeType || "image/jpeg" });
  return result.data as ReturnType<typeof analyzeFoodImage>;
}
