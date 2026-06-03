import * as functions from "firebase-functions/v1";
import { lookUpBarcodeHandler, analyzeFoodImageHandler } from "./scan";
import { calculateHealthScore } from "./scoring";
import { generateReview } from "./review";
import type { ReviewRequest } from "./review";

/**
 * Look up a product by barcode using the Open Food Facts API.
 */
export const lookUpBarcode = functions
  .region("us-central1")
  .runWith({ memory: "256MB", maxInstances: 10 })
  .https.onCall(async (data: { barcode?: string }, context) => {
    functions.logger.info("lookUpBarcode called", { barcode: data.barcode });

    if (!data.barcode || typeof data.barcode !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid barcode string is required."
      );
    }

    const product = await lookUpBarcodeHandler(data.barcode.trim());

    // Run scoring engine on the result
    const score = calculateHealthScore(product);

    return {
      success: true,
      product,
      score,
    };
  });

/**
 * Analyze a food image using the Gemini API.
 */
export const analyzeFoodImage = functions
  .region("us-central1")
  .runWith({ memory: "1GB", maxInstances: 5, timeoutSeconds: 60, secrets: ["GEMINI_API_KEY"] })
  .https.onCall(async (data: { imageBase64?: string; mimeType?: string }, context) => {
    functions.logger.info("analyzeFoodImage called");

    if (!data.imageBase64 || typeof data.imageBase64 !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A base64-encoded image is required."
      );
    }

    const mimeType = data.mimeType || "image/jpeg";

    // Analyze via Gemini
    const product = await analyzeFoodImageHandler(data.imageBase64, mimeType);

    // Run scoring engine on the result
    const score = calculateHealthScore(product);

    return {
      success: true,
      product,
      score,
    };
  });

/**
 * Generate a Good & Bad review using DeepSeek AI.
 * Takes structured product data and returns a human-readable review.
 */
export const generateFoodReview = functions
  .region("us-central1")
  .runWith({ memory: "512MB", maxInstances: 10, timeoutSeconds: 60, secrets: ["DEEPSEEK_API_KEY"] })
  .https.onCall(async (data: ReviewRequest, context) => {
    functions.logger.info("generateFoodReview called", { product: data.product_name });

    if (!data.product_name) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Product data with a product_name is required."
      );
    }

    const review = await generateReview(data);

    return {
      success: true,
      review,
    };
  });
