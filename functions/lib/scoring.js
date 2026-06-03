"use strict";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHealthScore = calculateHealthScore;
// ---------------------------------------------------------------------------
// Scoring thresholds (based on Nutri-Score and WHO guidelines)
// ---------------------------------------------------------------------------
const SUGAR_THRESHOLDS = [
    { max: 5, penalty: 0 },
    { max: 10, penalty: -3 },
    { max: 15, penalty: -6 },
    { max: 25, penalty: -10 },
    { max: Infinity, penalty: -15 },
];
const SAT_FAT_THRESHOLDS = [
    { max: 1.5, penalty: 0 },
    { max: 3, penalty: -2 },
    { max: 5, penalty: -5 },
    { max: 10, penalty: -8 },
    { max: Infinity, penalty: -10 },
];
const SODIUM_THRESHOLDS = [
    { max: 0.2, penalty: 0 },
    { max: 0.4, penalty: -2 },
    { max: 0.7, penalty: -5 },
    { max: 1.0, penalty: -8 },
    { max: Infinity, penalty: -10 },
];
const FIBER_THRESHOLDS = [
    { min: 6, bonus: 15 },
    { min: 3, bonus: 10 },
    { min: 1.5, bonus: 5 },
    { min: 0, bonus: 0 },
];
const PROTEIN_THRESHOLDS = [
    { min: 12, bonus: 10 },
    { min: 8, bonus: 6 },
    { min: 4, bonus: 3 },
    { min: 0, bonus: 0 },
];
// ---------------------------------------------------------------------------
// Scoring Functions
// ---------------------------------------------------------------------------
function getNutrientValue(nutriments, key) {
    // Try typical key variants from Open Food Facts
    const variants = [key, key.replace(/-/g, "_"), `_${key}`];
    for (const v of variants) {
        if (nutriments[v] !== undefined && nutriments[v] !== null)
            return nutriments[v];
    }
    return 0;
}
function scoreSugar(nutriments) {
    const sugar = getNutrientValue(nutriments, "sugars_100g");
    for (const t of SUGAR_THRESHOLDS) {
        if (sugar <= t.max)
            return t.penalty;
    }
    return -15;
}
function scoreSatFat(nutriments) {
    const fat = getNutrientValue(nutriments, "saturated-fat_100g");
    for (const t of SAT_FAT_THRESHOLDS) {
        if (fat <= t.max)
            return t.penalty;
    }
    return -10;
}
function scoreSodium(nutriments) {
    const sodium = getNutrientValue(nutriments, "sodium_100g");
    for (const t of SODIUM_THRESHOLDS) {
        if (sodium <= t.max)
            return t.penalty;
    }
    return -10;
}
function scoreFiber(nutriments) {
    const fiber = getNutrientValue(nutriments, "fiber_100g");
    for (const t of FIBER_THRESHOLDS) {
        if (fiber >= t.min)
            return t.bonus;
    }
    return 0;
}
function scoreProtein(nutriments) {
    const protein = getNutrientValue(nutriments, "proteins_100g");
    for (const t of PROTEIN_THRESHOLDS) {
        if (protein >= t.min)
            return t.bonus;
    }
    return 0;
}
function scoreNova(novaGroup) {
    if (novaGroup === null || novaGroup === undefined)
        return 0;
    switch (novaGroup) {
        case 1: return 0; // Unprocessed — no penalty
        case 2: return -3; // Processed culinary
        case 3: return -8; // Processed
        case 4: return -15; // Ultra-processed
        default: return 0;
    }
}
function scoreAdditives(additives) {
    if (!additives || additives.length === 0)
        return 0;
    const count = additives.length;
    if (count <= 1)
        return -2;
    if (count <= 3)
        return -5;
    if (count <= 6)
        return -8;
    return -10;
}
function calculateNutriscore(nutriments) {
    // Simplified Nutri-Score calculation
    const fiber = getNutrientValue(nutriments, "fiber_100g");
    const protein = getNutrientValue(nutriments, "proteins_100g");
    const sugar = getNutrientValue(nutriments, "sugars_100g");
    const satFat = getNutrientValue(nutriments, "saturated-fat_100g");
    const sodium = getNutrientValue(nutriments, "sodium_100g");
    // Check if we have any data at all
    const hasData = sugar > 0 || satFat > 0 || sodium > 0 || fiber > 0 || protein > 0;
    if (!hasData)
        return "?";
    // Negative points (N)
    let nPoints = 0;
    if (sugar > 0)
        nPoints += sugar <= 4.5 ? 1 : sugar <= 9 ? 2 : sugar <= 13.5 ? 3 : sugar <= 18 ? 4 : sugar <= 22.5 ? 5 : sugar <= 27 ? 6 : sugar <= 31 ? 7 : sugar <= 36 ? 8 : sugar <= 40 ? 9 : 10;
    if (satFat > 0)
        nPoints += satFat <= 1 ? 1 : satFat <= 2 ? 2 : satFat <= 3 ? 3 : satFat <= 4 ? 4 : satFat <= 5 ? 5 : satFat <= 6 ? 6 : satFat <= 7 ? 7 : satFat <= 8 ? 8 : satFat <= 9 ? 9 : 10;
    if (sodium > 0)
        nPoints += sodium <= 0.09 ? 1 : sodium <= 0.18 ? 2 : sodium <= 0.27 ? 3 : sodium <= 0.36 ? 4 : sodium <= 0.45 ? 5 : sodium <= 0.54 ? 6 : sodium <= 0.63 ? 7 : sodium <= 0.72 ? 8 : sodium <= 0.81 ? 9 : 10;
    // Positive points (P)
    let pPoints = 0;
    if (fiber > 0)
        pPoints += fiber <= 0.9 ? 1 : fiber <= 1.9 ? 2 : fiber <= 2.8 ? 3 : fiber <= 3.9 ? 4 : 5;
    if (protein > 0)
        pPoints += protein <= 1.6 ? 1 : protein <= 3.2 ? 2 : protein <= 4.8 ? 3 : protein <= 6.4 ? 4 : 5;
    const total = nPoints - pPoints;
    if (total <= -1)
        return "A";
    if (total <= 2)
        return "B";
    if (total <= 10)
        return "C";
    if (total <= 18)
        return "D";
    return "E";
}
// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------
function calculateHealthScore(product) {
    const { nutriments, nova_group, additives, nutriscore, ecoscore } = product;
    const goodFactors = [];
    const badFactors = [];
    // Good factors
    const fiberScore = scoreFiber(nutriments);
    if (fiberScore > 0) {
        goodFactors.push({ label: "Fiber content", score: fiberScore, type: "good", icon: "fiber" });
    }
    const proteinScore = scoreProtein(nutriments);
    if (proteinScore > 0) {
        goodFactors.push({ label: "Protein quality", score: proteinScore, type: "good", icon: "protein" });
    }
    // Bad factors
    const sugarPen = scoreSugar(nutriments);
    if (sugarPen < 0) {
        badFactors.push({ label: "Sugar content", score: sugarPen, type: "bad", icon: "sugar" });
    }
    const satFatPen = scoreSatFat(nutriments);
    if (satFatPen < 0) {
        badFactors.push({ label: "Saturated fat", score: satFatPen, type: "bad", icon: "fat" });
    }
    const sodiumPen = scoreSodium(nutriments);
    if (sodiumPen < 0) {
        badFactors.push({ label: "Sodium content", score: sodiumPen, type: "bad", icon: "sodium" });
    }
    const novaPen = scoreNova(nova_group);
    if (novaPen < 0) {
        const label = nova_group === 4 ? "Ultra-processed" : nova_group === 3 ? "Processed food" : "Processing level";
        badFactors.push({ label, score: novaPen, type: "bad", icon: "nova" });
    }
    const additivePen = scoreAdditives(additives);
    if (additivePen < 0) {
        badFactors.push({ label: "Additives", score: additivePen, type: "bad", icon: "additives" });
    }
    // Calculate total
    const goodTotal = goodFactors.reduce((sum, f) => sum + f.score, 0);
    const badTotal = badFactors.reduce((sum, f) => sum + Math.abs(f.score), 0);
    const raw = goodTotal - badTotal; // Range: -50 to +50
    // Normalize to 0–100
    const health_score = Math.round(Math.max(0, Math.min(100, ((raw + 50) / 100) * 100)));
    return {
        health_score,
        nutriscore: nutriscore || calculateNutriscore(nutriments),
        ecoscore: ecoscore || null,
        nova_group: nova_group ?? null,
        good_factors: goodFactors,
        bad_factors: badFactors,
    };
}
//# sourceMappingURL=scoring.js.map