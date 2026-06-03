import * as functions from "firebase-functions/v1";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewRequest {
  product_name: string;
  ingredients: string[];
  nutriments: Record<string, number>;
  nova_group: number | null;
  additives: string[];
  allergens: string[];
}

export interface DeepSeekReview {
  health_score: number;
  nutriscore_estimate: string;
  good_points: { point: string; reason: string }[];
  bad_points: { point: string; reason: string }[];
  allergen_warnings: string[];
  alternatives: { name: string; reason: string }[];
  summary: string;
}

// ---------------------------------------------------------------------------
// DeepSeek API integration
// ---------------------------------------------------------------------------

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

export async function generateReview(data: ReviewRequest): Promise<DeepSeekReview> {
  if (!DEEPSEEK_API_KEY) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "DeepSeek API key not configured. Set DEEPSEEK_API_KEY via Firebase Secrets."
    );
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

  let res: Response;
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
  } catch (err) {
    throw new functions.https.HttpsError(
      "unavailable",
      `DeepSeek API unreachable: ${err instanceof Error ? err.message : "network error"}`
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    functions.logger.error("DeepSeek API error", { status: res.status, body: text });

    if (res.status === 429) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "DeepSeek API rate limit exceeded. Please try again later."
      );
    }
    throw new functions.https.HttpsError(
      "internal",
      `DeepSeek API returned status ${res.status}.`
    );
  }

  const json = await res.json() as {
    choices?: { message?: { content?: string } }[];
  };

  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new functions.https.HttpsError(
      "internal",
      "DeepSeek API returned an empty response."
    );
  }

  // Parse the JSON from DeepSeek's response
  try {
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned) as DeepSeekReview;

    return {
      health_score: Math.max(0, Math.min(100, parsed.health_score || 50)),
      nutriscore_estimate: (parsed.nutriscore_estimate || "C").toUpperCase(),
      good_points: parsed.good_points || [],
      bad_points: parsed.bad_points || [],
      allergen_warnings: parsed.allergen_warnings || [],
      alternatives: parsed.alternatives || [],
      summary: parsed.summary || "No summary available.",
    };
  } catch {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to parse DeepSeek response. The AI output was not valid JSON."
    );
  }
}
