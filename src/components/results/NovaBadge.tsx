"use client";

interface NovaBadgeProps {
  group: number | null;
}

const NOVA_INFO: Record<number, { label: string; description: string; color: string; bg: string }> = {
  1: {
    label: "NOVA 1",
    description: "Unprocessed or minimally processed",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  2: {
    label: "NOVA 2",
    description: "Processed culinary ingredients",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
  },
  3: {
    label: "NOVA 3",
    description: "Processed foods",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  4: {
    label: "NOVA 4",
    description: "Ultra-processed foods",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
};

export function NovaBadge({ group }: NovaBadgeProps) {
  if (group === null || group === undefined || !NOVA_INFO[group]) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-400 dark:bg-zinc-800">
          NOVA —
        </span>
        <span className="text-[10px] text-zinc-400">Processing unknown</span>
      </div>
    );
  }

  const info = NOVA_INFO[group];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`rounded-full ${info.bg} px-3 py-1 text-xs font-semibold ${info.color}`}>
        {info.label}
      </span>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{info.description}</span>
    </div>
  );
}
