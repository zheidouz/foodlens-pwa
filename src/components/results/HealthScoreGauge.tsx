"use client";

interface HealthScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { gauge: 80, stroke: 8, fontSize: "text-lg" },
  md: { gauge: 120, stroke: 10, fontSize: "text-2xl" },
  lg: { gauge: 160, stroke: 14, fontSize: "text-3xl" },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#22c55e"; // green-500
  if (score >= 40) return "#f59e0b"; // amber-500
  if (score >= 20) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-green-500";
  if (score >= 40) return "bg-amber-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

export function HealthScoreGauge({ score, size = "md" }: HealthScoreGaugeProps) {
  const dims = SIZE_MAP[size];
  const radius = (dims.gauge - dims.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dims.gauge, height: dims.gauge }}>
        {/* Background circle */}
        <svg width={dims.gauge} height={dims.gauge} className="-rotate-90">
          <circle
            cx={dims.gauge / 2}
            cy={dims.gauge / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={dims.stroke}
            className="text-zinc-200 dark:text-zinc-700"
          />
          {/* Score arc */}
          <circle
            cx={dims.gauge / 2}
            cy={dims.gauge / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tracking-tight ${dims.fontSize}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold text-white ${getScoreBg(score)}`}>
        {label}
      </span>
    </div>
  );
}
