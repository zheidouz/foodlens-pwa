"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";

interface AllergenAlertProps {
  allergens: string[];
  isUltraProcessed?: boolean;
  highSugar?: boolean;
  highSodium?: boolean;
}

export function AllergenAlert({
  allergens,
  isUltraProcessed,
  highSugar,
  highSodium,
}: AllergenAlertProps) {
  const flags: { type: "allergen" | "warning"; message: string }[] = [];

  if (allergens && allergens.length > 0) {
    // Filter out empty/unknown allergens
    const known = allergens.filter((a) => a && a !== "unknown" && a !== "en:unknown");
    if (known.length > 0) {
      flags.push({
        type: "allergen",
        message: `Contains: ${known.join(", ")}`,
      });
    }
  }

  if (isUltraProcessed) {
    flags.push({
      type: "warning",
      message: "Ultra-processed food — high in additives and low in nutritional value",
    });
  }

  if (highSugar) {
    flags.push({
      type: "warning",
      message: "High sugar content — 22.5g+ per 100g exceeds recommended limits",
    });
  }

  if (highSodium) {
    flags.push({
      type: "warning",
      message: "High sodium content — 0.8g+ per 100g exceeds recommended limits",
    });
  }

  if (flags.length === 0) return null;

  return (
    <div className="space-y-2">
      {flags.map((flag, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
            flag.type === "allergen"
              ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
          role="alert"
        >
          {flag.type === "allergen" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <span>{flag.message}</span>
        </div>
      ))}
    </div>
  );
}
