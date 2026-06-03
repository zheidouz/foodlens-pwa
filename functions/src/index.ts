import * as functions from "firebase-functions/v1";
import { lookUpBarcodeHandler, analyzeFoodImageHandler } from "./scan";
import { calculateHealthScore } from "./scoring";
import { generateReview } from "./review";
import type { ReviewRequest } from "./review";

// ---------------------------------------------------------------------------
// CORS headers — allow requests from Firebase Hosting
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function handleCors(req: functions.https.Request, res: functions.Response): boolean {
  // Set CORS headers on every response
  res.set(CORS_HEADERS);

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// parse json body helper
// ---------------------------------------------------------------------------

function parseBody(req: functions.https.Request): unknown {
  if (typeof req.body === "object" && req.body !== null) {
    // Client wraps data in { data: ... } (callable-compatible format)
    if ("data" in req.body && typeof req.body.data === "object" && req.body.data !== null) {
      return req.body.data;
    }
    return req.body;
  }
  return {};
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Look up a product by barcode using the Open Food Facts API.
 */
export const lookUpBarcode = functions
  .region("us-central1")
  .runWith({ memory: "256MB", maxInstances: 10 })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    functions.logger.info("lookUpBarcode called");

    try {
      const data = parseBody(req) as { barcode?: string };

      if (!data.barcode || typeof data.barcode !== "string") {
        res.status(400).json({
          success: false,
          error: { code: "invalid-argument", message: "A valid barcode string is required." },
        });
        return;
      }

      const product = await lookUpBarcodeHandler(data.barcode.trim());
      const score = calculateHealthScore(product);

      res.json({ success: true, product, score });
    } catch (err) {
      functions.logger.error("lookUpBarcode error", err);
      const fbErr = err as { code?: string; message?: string };
      res.status(500).json({
        success: false,
        error: { code: fbErr.code || "internal", message: fbErr.message || "Internal error" },
      });
    }
  });

/**
 * Analyze a food image using the Gemini API.
 */
export const analyzeFoodImage = functions
  .region("us-central1")
  .runWith({ memory: "1GB", maxInstances: 5, timeoutSeconds: 60, secrets: ["GEMINI_API_KEY"] })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    functions.logger.info("analyzeFoodImage called");

    try {
      const data = parseBody(req) as { imageBase64?: string; mimeType?: string };

      if (!data.imageBase64 || typeof data.imageBase64 !== "string") {
        res.status(400).json({
          success: false,
          error: { code: "invalid-argument", message: "A base64-encoded image is required." },
        });
        return;
      }

      const mimeType = data.mimeType || "image/jpeg";
      const product = await analyzeFoodImageHandler(data.imageBase64, mimeType);
      const score = calculateHealthScore(product);

      res.json({ success: true, product, score });
    } catch (err) {
      functions.logger.error("analyzeFoodImage error", err);
      const fbErr = err as { code?: string; message?: string };
      res.status(500).json({
        success: false,
        error: { code: fbErr.code || "internal", message: fbErr.message || "Internal error" },
      });
    }
  });

/**
 * Generate a Good & Bad review using DeepSeek AI.
 */
export const generateFoodReview = functions
  .region("us-central1")
  .runWith({ memory: "512MB", maxInstances: 10, timeoutSeconds: 60, secrets: ["DEEPSEEK_API_KEY"] })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    functions.logger.info("generateFoodReview called");

    try {
      const data = parseBody(req) as ReviewRequest;

      if (!data.product_name) {
        res.status(400).json({
          success: false,
          error: { code: "invalid-argument", message: "Product data with a product_name is required." },
        });
        return;
      }

      const review = await generateReview(data);
      res.json({ success: true, review });
    } catch (err) {
      functions.logger.error("generateFoodReview error", err);
      const fbErr = err as { code?: string; message?: string };
      res.status(500).json({
        success: false,
        error: { code: fbErr.code || "internal", message: fbErr.message || "Internal error" },
      });
    }
  });
