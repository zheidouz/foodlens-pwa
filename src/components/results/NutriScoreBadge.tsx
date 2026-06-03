"use client";

interface NutriScoreBadgeProps {
  grade: string;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "bg-green-600", text: "text-white", bar: "bg-green-500" },
  B: { bg: "bg-lime-500", text: "text-white", bar: "bg-lime-400" },
  C: { bg: "bg-amber-400", text: "text-white", bar: "bg-amber-400" },
  D: { bg: "bg-orange-500", text: "text-white", bar: "bg-orange-500" },
  E: { bg: "bg-red-600", text: "text-white", bar: "bg-red-600" },
};

const GRADE_LABELS: Record<string, string> = {
  A: "Excellent",
  B: "Good",
  C: "Average",
  D: "Poor",
  E: "Very Poor",
  "?": "Unknown",
};

const LETTERS = ["A", "B", "C", "D", "E"];

export function NutriScoreBadge({ grade }: NutriScoreBadgeProps) {
  const normalized = grade?.toUpperCase() || "?";
  const colors = GRADE_COLORS[normalized] || { bg: "bg-zinc-400", text: "text-white", bar: "bg-zinc-400" };
  const label = GRADE_LABELS[normalized] || "Unknown";

  if (normalized === "?") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {LETTERS.map((letter) => (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-zinc-400 bg-zinc-200 dark:bg-zinc-700"
            >
              {letter}
            </span>
          ))}
        </div>
        <span className="text-xs text-zinc-400">Insufficient data</span>
      </div>
    );
  }

  const activeIndex = LETTERS.indexOf(normalized);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {LETTERS.map((letter, i) => (
          <span
            key={letter}
            className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-all ${
              i === activeIndex
                ? `${colors.bg} ${colors.text} scale-110 shadow-md`
                : i < activeIndex
                  ? `${colors.bg}/60 text-white/80`
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>
      <span className={`text-xs font-semibold ${normalized !== "?" ? colors.bg.replace("bg-", "text-") : "text-zinc-400"}`}>
        {label}
      </span>
    </div>
  );
}
