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
exports.generateReview = generateReview;
const functions = __importStar(require("firebase-functions/v1"));
// ---------------------------------------------------------------------------
// DeepSeek API integration
// ---------------------------------------------------------------------------
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";
async function generateReview(data) {
    if (!DEEPSEEK_API_KEY) {
        throw new functions.https.HttpsError("failed-precondition", "DeepSeek API key not configured. Set DEEPSEEK_API_KEY via Firebase Secrets.");
    }
    const prompt = `You are a food nutrition expert. Analyze this food product and provide a balanced health review.

Product: "${data.product_name}"
Ingredients: ${data.ingredients.join(", ") || "unknown"}
Nutrition (per 100g): ${JSON.stringify(data.nutriments)}
Processing level (NOVA): ${data.nova_group ?? "unknown"}
Additives: ${data.additives.join(", ") || "none"}
Allergens: ${data.allergens.join(", ") || "none detected"}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "health_score": <number 0-100>,
  "nutriscore_estimate": "<A|B|C|D|E>",
  "good_points": [
    { "point": "<brief title>", "reason": "<why this is beneficial>" }
  ],
  "bad_points": [
    { "point": "<brief title>", "reason": "<why this is a concern>" }
  ],
  "allergen_warnings": ["<warning text>"],
  "alternatives": [
    { "name": "<product type suggestion>", "reason": "<why this is healthier>" }
  ],
  "summary": "<one sentence overall assessment>"
}

Be objective and evidence-based. Consider fiber, protein, sugar, saturated fat, sodium, processing level, and additives.`;
    const body = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: "You are a food nutrition expert. Always respond with valid JSON only." },
            { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
    };
    let res;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        res = await fetch(DEEPSEEK_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    }
    catch (err) {
        throw new functions.https.HttpsError("unavailable", `DeepSeek API unreachable: ${err instanceof Error ? err.message : "network error"}`);
    }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        functions.logger.error("DeepSeek API error", { status: res.status, body: text });
        if (res.status === 429) {
            throw new functions.https.HttpsError("resource-exhausted", "DeepSeek API rate limit exceeded. Please try again later.");
        }
        throw new functions.https.HttpsError("internal", `DeepSeek API returned status ${res.status}.`);
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) {
        throw new functions.https.HttpsError("internal", "DeepSeek API returned an empty response.");
    }
    // Parse the JSON from DeepSeek's response
    try {
        const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
            health_score: Math.max(0, Math.min(100, parsed.health_score || 50)),
            nutriscore_estimate: (parsed.nutriscore_estimate || "C").toUpperCase(),
            good_points: parsed.good_points || [],
            bad_points: parsed.bad_points || [],
            allergen_warnings: parsed.allergen_warnings || [],
            alternatives: parsed.alternatives || [],
            summary: parsed.summary || "No summary available.",
        };
    }
    catch {
        throw new functions.https.HttpsError("internal", "Failed to parse DeepSeek response. The AI output was not valid JSON.");
    }
}
//# sourceMappingURL=review.js.map