"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFoodReview = exports.analyzeFoodImage = exports.lookUpBarcode = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const scan_1 = require("./scan");
const scoring_1 = require("./scoring");
const review_1 = require("./review");
/**
 * Look up a product by barcode using the Open Food Facts API.
 */
exports.lookUpBarcode = functions
    .region("us-central1")
    .runWith({ memory: "256MB", maxInstances: 10 })
    .https.onCall(async (data, context) => {
    functions.logger.info("lookUpBarcode called", { barcode: data.barcode });
    if (!data.barcode || typeof data.barcode !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "A valid barcode string is required.");
    }
    const product = await (0, scan_1.lookUpBarcodeHandler)(data.barcode.trim());
    // Run scoring engine on the result
    const score = (0, scoring_1.calculateHealthScore)(product);
    return {
        success: true,
        product,
        score,
    };
});
/**
 * Analyze a food image using the Gemini API.
 */
exports.analyzeFoodImage = functions
    .region("us-central1")
    .runWith({ memory: "1GB", maxInstances: 5, timeoutSeconds: 60, secrets: ["GEMINI_API_KEY"] })
    .https.onCall(async (data, context) => {
    functions.logger.info("analyzeFoodImage called");
    if (!data.imageBase64 || typeof data.imageBase64 !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "A base64-encoded image is required.");
    }
    const mimeType = data.mimeType || "image/jpeg";
    // Analyze via Gemini
    const product = await (0, scan_1.analyzeFoodImageHandler)(data.imageBase64, mimeType);
    // Run scoring engine on the result
    const score = (0, scoring_1.calculateHealthScore)(product);
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
exports.generateFoodReview = functions
    .region("us-central1")
    .runWith({ memory: "512MB", maxInstances: 10, timeoutSeconds: 60, secrets: ["DEEPSEEK_API_KEY"] })
    .https.onCall(async (data, context) => {
    functions.logger.info("generateFoodReview called", { product: data.product_name });
    if (!data.product_name) {
        throw new functions.https.HttpsError("invalid-argument", "Product data with a product_name is required.");
    }
    const review = await (0, review_1.generateReview)(data);
    return {
        success: true,
        review,
    };
});
//# sourceMappingURL=index.js.map