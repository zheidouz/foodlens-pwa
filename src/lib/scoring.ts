/**
 * Client-side helpers for displaying scoring data.
 * These are display-only utilities — the actual scoring runs in Cloud Functions.
 */

// Shared factor type (mirrored from functions/src/scoring.ts — can't cross project boundary)
export interface Factor {
  label: string;
  score: number;
  type: "good" | "bad";
  icon?: string;
}

export interface ScoreDisplay {
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  nutriscoreColor: string;
  nutriscoreLabel: string;
  novaLabel: string;
  novaColor: string;
}

/** Human-readable health score labels */
export function getHealthLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

/** Tailwind color class for health score */
export function getHealthColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-green-500";
  if (score >= 40) return "text-amber-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}

/** Tailwind color class for health score gauge/background */
export function getHealthBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-green-500";
  if (score >= 40) return "bg-amber-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

/** Nutri-Score color mapping */
export function getNutriscoreColor(grade: string): string {
  const map: Record<string, string> = {
    A: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    B: "text-lime-600 bg-lime-100 dark:bg-lime-900/30 dark:text-lime-400",
    C: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    D: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    E: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    "?": "text-zinc-500 bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400",
  };
  return map[grade?.toUpperCase()] || "text-zinc-500 bg-zinc-100";
}

/** Nutri-Score human readable label */
export function getNutriscoreLabel(grade: string): string {
  const map: Record<string, string> = {
    A: "Excellent nutritional quality",
    B: "Good nutritional quality",
    C: "Average nutritional quality",
    D: "Poor nutritional quality",
    E: "Very poor nutritional quality",
    "?": "Insufficient data to calculate",
  };
  return map[grade?.toUpperCase()] || "Unknown";
}

/** NOVA group label and color */
export function getNovaDisplay(
  group: number | null
): { label: string; color: string; description: string } {
  const map: Record<number, { label: string; color: string; description: string }> = {
    1: {
      label: "NOVA 1",
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      description: "Unprocessed or minimally processed",
    },
    2: {
      label: "NOVA 2",
      color: "text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400",
      description: "Processed culinary ingredients",
    },
    3: {
      label: "NOVA 3",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      description: "Processed foods",
    },
    4: {
      label: "NOVA 4",
      color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      description: "Ultra-processed foods",
    },
  };
  return group !== null && map[group]
    ? map[group]
    : { label: "Unknown", color: "text-zinc-500 bg-zinc-100", description: "Processing level unknown" };
}

/** Build a full display object from a health score */
export function getScoreDisplay(score: number, nutriscore?: string, nova?: number | null): ScoreDisplay {
  return {
    healthScore: score,
    healthLabel: getHealthLabel(score),
    healthColor: getHealthColor(score),
    nutriscoreColor: nutriscore ? getNutriscoreColor(nutriscore) : "text-zinc-500 bg-zinc-100",
    nutriscoreLabel: nutriscore ? getNutriscoreLabel(nutriscore) : "Unknown",
    novaLabel: nova ? getNovaDisplay(nova).label : "Unknown",
    novaColor: nova ? getNovaDisplay(nova).color : "text-zinc-500 bg-zinc-100",
  };
}

/** Format a factor with its sign */
export function formatFactorScore(score: number): string {
  return score > 0 ? `+${score}` : `${score}`;
}
