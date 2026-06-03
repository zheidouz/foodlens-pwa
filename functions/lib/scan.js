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
exports.lookUpBarcodeHandler = lookUpBarcodeHandler;
exports.analyzeFoodImageHandler = analyzeFoodImageHandler;
const functions = __importStar(require("firebase-functions/v1"));
// ---------------------------------------------------------------------------
// 3.2 — lookUpBarcode: Open Food Facts API
// ---------------------------------------------------------------------------
const OFF_BASE = "https://world.openfoodfacts.org/api/v2";
async function lookUpBarcodeHandler(barcode) {
    const url = `${OFF_BASE}/product/${encodeURIComponent(barcode)}.json`;
    let res;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        res = await fetch(url, {
            headers: { "User-Agent": "FoodLens/1.0 (foodlens-pwa)" },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    }
    catch (err) {
        throw new functions.https.HttpsError("unavailable", `Open Food Facts API unreachable: ${err instanceof Error ? err.message : "network error"}`);
    }
    if (!res.ok) {
        if (res.status === 404) {
            throw new functions.https.HttpsError("not-found", `No product found for barcode "${barcode}".`);
        }
        throw new functions.https.HttpsError("internal", `Open Food Facts returned status ${res.status}.`);
    }
    const json = await res.json();
    if (!json.product || json.status === 0) {
        throw new functions.https.HttpsError("not-found", `No product found for barcode "${barcode}".`);
    }
    const p = json.product;
    // Parse nutriscore grade
    let nutriscore = null;
    if (p.nutriscore_grade) {
        nutriscore = p.nutriscore_grade.toUpperCase();
    }
    // Parse nova group
    let novaGroup = null;
    if (p.nova_group !== undefined && p.nova_group !== null) {
        const raw = typeof p.nova_group === "string" ? parseInt(p.nova_group, 10) : p.nova_group;
        novaGroup = Number.isFinite(raw) && raw >= 1 && raw <= 4 ? raw : null;
    }
    return {
        product_name: p.product_name || "Unknown Product",
        brands: p.brands || "",
        nutriments: p.nutriments || {},
        ingredients: parseIngredientsList(p.ingredients_text || ""),
        nova_group: novaGroup,
        additives: (p.additives_tags || []).map(stripTagPrefix),
        allergens: (p.allergens_tags || []).map(stripTagPrefix),
        ecoscore: p.ecoscore_grade ? p.ecoscore_grade.toUpperCase() : null,
        nutriscore,
    };
}
// ---------------------------------------------------------------------------
// 3.3 — analyzeFoodImage: Gemini API
// ---------------------------------------------------------------------------
// Gemini API key from Firebase Secrets (set via `firebase functions:secrets:set GEMINI_API_KEY`)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-v2-0:generateContent";
async function analyzeFoodImageHandler(imageBase64, mimeType) {
    if (!GEMINI_API_KEY) {
        throw new functions.https.HttpsError("failed-precondition", "Gemini API key not configured. Set GEMINI_API_KEY via Firebase Secrets.");
    }
    const prompt = `Analyze this food product image and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "product_name": "Best guess at product name",
  "nutriments": { "energy_100g": 0, "fat_100g": 0, "saturated-fat_100g": 0, "carbohydrates_100g": 0, "sugars_100g": 0, "fiber_100g": 0, "proteins_100g": 0, "salt_100g": 0, "sodium_100g": 0 },
  "ingredients": ["ingredient1", "ingredient2"],
  "nova_group": 1-4 (based on processing level, or null if unclear),
  "additives": ["additive1", "additive2"]
}

Fill estimated values from visible labels or packaging. Use null for unknown numeric values.`;
    const body = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: imageBase64,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
        },
    };
    let res;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000);
        res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    }
    catch (err) {
        throw new functions.https.HttpsError("unavailable", `Gemini API unreachable: ${err instanceof Error ? err.message : "network error"}`);
    }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        functions.logger.error("Gemini API error", { status: res.status, body: text });
        if (res.status === 429) {
            throw new functions.https.HttpsError("resource-exhausted", "Gemini API rate limit exceeded. Please try again later.");
        }
        if (res.status === 400) {
            throw new functions.https.HttpsError("invalid-argument", "Image could not be analyzed. Ensure it's a clear photo of food packaging.");
        }
        throw new functions.https.HttpsError("internal", `Gemini API returned status ${res.status}.`);
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new functions.https.HttpsError("internal", "Gemini API returned an empty response.");
    }
    // Parse the JSON from Gemini's response
    try {
        // Strip any markdown code fences if Gemini wrapped the response
        const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
            product_name: parsed.product_name || "Unknown Product",
            nutriments: parsed.nutriments || {},
            ingredients: parsed.ingredients || [],
            nova_group: parsed.nova_group ?? null,
            additives: parsed.additives || [],
        };
    }
    catch {
        throw new functions.https.HttpsError("internal", "Failed to parse Gemini response. The AI output was not valid JSON.");
    }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIngredientsList(text) {
    if (!text)
        return [];
    return text
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}
function stripTagPrefix(tag) {
    // Tags come as "en:additive-name" — strip the locale prefix
    const idx = tag.indexOf(":");
    return idx >= 0 ? tag.slice(idx + 1).replace(/-/g, " ") : tag.replace(/-/g, " ");
}
//# sourceMappingURL=scan.js.map