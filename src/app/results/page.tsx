"use client";

import { use } from "react";
import { ArrowLeft, ThumbsUp, ThumbsDown, FlaskConical } from "lucide-react";
import Link from "next/link";
import { HealthScoreGauge } from "@/components/results/HealthScoreGauge";
import { NutriScoreBadge } from "@/components/results/NutriScoreBadge";
import { NovaBadge } from "@/components/results/NovaBadge";
import { AllergenAlert } from "@/components/results/AllergenAlert";
import type { AnalysisResult, Factor } from "@/types";

// In a real app this would come from router state or a store.
// For now we read from sessionStorage (set by scan page).
function getCachedResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("foodlens_last_analysis");
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const result = getCachedResult();

  if (!result) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <FlaskConical className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        <h1 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">No Results</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Scan a product first to see its analysis here.
        </p>
        <Link
          href="/scan"
          className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          Go to Scanner
        </Link>
      </div>
    );
  }

  const { score, product } = result;
  const productName = (product?.product_name as string) || "Unknown Product";
  const allergens = (product?.allergens as string[]) || [];

  // Determine flags from product data
  const nutriments = product?.nutriments as Record<string, number> | undefined;
  const isUltraProcessed = score.nova_group === 4;
  const sugarG = nutriments?.sugars_100g || 0;
  const sodiumG = nutriments?.sodium_100g || 0;
  const highSugar = sugarG > 22.5;
  const highSodium = sodiumG > 0.8;

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-white dark:bg-black">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <Link
          href="/scan"
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Back to scan"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Results</h1>
      </header>

      <div className="space-y-6 p-4">
        {/* Product name */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{productName}</h2>
          {(product?.brands as string) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.brands as string}</p>
          )}
        </div>

        {/* Score row: gauge + badges */}
        <div className="flex items-center justify-around rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
          <HealthScoreGauge score={score.health_score} size="md" />
          <div className="flex flex-col items-center gap-4">
            <NutriScoreBadge grade={score.nutriscore} />
            <NovaBadge group={score.nova_group} />
          </div>
        </div>

        {/* Allergen alerts */}
        <AllergenAlert
          allergens={allergens}
          isUltraProcessed={isUltraProcessed}
          highSugar={highSugar}
          highSodium={highSodium}
        />

        {/* Good factors */}
        {score.good_factors.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                The Good
              </h3>
            </div>
            <div className="space-y-2">
              {score.good_factors.map((factor: Factor, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20"
                >
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    {factor.label}
                  </span>
                  <span className="rounded-md bg-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                    +{factor.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bad factors */}
        {score.bad_factors.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                The Bad
              </h3>
            </div>
            <div className="space-y-2">
              {score.bad_factors.map((factor: Factor, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-red-50 p-3 dark:bg-red-900/20"
                >
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {factor.label}
                  </span>
                  <span className="rounded-md bg-red-200 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-800 dark:text-red-300">
                    {factor.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barcode info */}
        {(product?.product_name as string) && (
          <div className="rounded-xl bg-zinc-50 p-3 text-center text-xs text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
            Data sourced from Open Food Facts and the FoodLens scoring engine.
          </div>
        )}
      </div>
    </div>
  );
}
