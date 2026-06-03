import { getFunctions, httpsCallable } from "firebase/functions";

// Cloud Functions are called via Firebase Hosting rewrites (same origin, no CORS)
const FUNCTION_BASE = typeof window !== "undefined"
  ? `${window.location.origin}/api`
  : "";

async function callFunction<T>(name: string, data: unknown): Promise<T> {
  if (!FUNCTION_BASE) {
    throw new Error("Cloud Functions not available on the server.");
  }

  const res = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Callable functions expect data wrapped in { "data": ... }
    body: JSON.stringify({ data }),
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Request failed (${res.status})`);
  }

  // Callable functions return { "result": ... }
  return json.result as T;
}

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
  return callFunction("lookUpBarcode", { barcode });
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
  return callFunction("analyzeFoodImage", { imageBase64, mimeType: mimeType || "image/jpeg" });
}

/**
 * Generate a Good & Bad review using DeepSeek AI.
 * Takes structured product data and returns a human-readable review.
 */
export async function generateFoodReview(
  productData: {
    product_name: string;
    ingredients: string[];
    nutriments: Record<string, number>;
    nova_group: number | null;
    additives: string[];
    allergens: string[];
  }
): Promise<{
  success: boolean;
  review: {
    health_score: number;
    nutriscore_estimate: string;
    good_points: { point: string; reason: string }[];
    bad_points: { point: string; reason: string }[];
    allergen_warnings: string[];
    alternatives: { name: string; reason: string }[];
    summary: string;
  };
}> {
  return callFunction("generateFoodReview", productData);
}
