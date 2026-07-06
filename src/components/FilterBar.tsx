"use client";

import type { DateRange, PresetKey } from "@/lib/aggregate";
import { buildExpertColorMap } from "@/lib/colors";
import { useIsDark } from "@/lib/useIsDark";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "mtd", label: "Mês atual" },
  { key: "all", label: "Tudo" },
];

export function FilterBar({
  preset,
  onPresetChange,
  range,
  onCustomRangeChange,
  allExperts,
  selectedExperts,
  onToggleExpert,
  onSelectAllExperts,
}: {
  preset: PresetKey | "custom";
  onPresetChange: (p: PresetKey) => void;
  range: DateRange;
  onCustomRangeChange: (r: DateRange) => void;
  allExperts: string[];
  selectedExperts: string[];
  onToggleExpert: (expert: string) => void;
  onSelectAllExperts: () => void;
}) {
  const isDark = useIsDark();
  const colorMap = buildExpertColorMap(allExperts);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => onPresetChange(p.key)}
            className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
              preset === p.key
                ? "bg-[var(--text-primary)] text-[var(--surface)] border-[var(--text-primary)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--border)]">
          <input
            type="date"
            value={range.start}
            onChange={(e) =>
              onCustomRangeChange({ ...range, start: e.target.value })
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)]"
          />
          <span className="text-[var(--text-muted)] text-sm">–</span>
          <input
            type="date"
            value={range.end}
            onChange={(e) =>
              onCustomRangeChange({ ...range, end: e.target.value })
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onSelectAllExperts}
          className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
            selectedExperts.length === 0
              ? "bg-[var(--text-primary)] text-[var(--surface)] border-[var(--text-primary)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
          }`}
        >
          Todos os experts
        </button>
        {allExperts.map((expert) => {
          const active = selectedExperts.includes(expert);
          const color = colorMap.get(expert);
          const dot = color ? (isDark ? color.dark : color.light) : "#888";
          return (
            <button
              key={expert}
              onClick={() => onToggleExpert(expert)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border transition-colors ${
                active
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: dot }}
                aria-hidden="true"
              />
              {expert}
            </button>
          );
        })}
      </div>
    </div>
  );
}
