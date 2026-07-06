"use client";

import type { DateRange, PresetKey } from "@/lib/aggregate";
import { buildCategoricalColorMap } from "@/lib/colors";
import { useIsDark } from "@/lib/useIsDark";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "mtd", label: "Mês atual" },
  { key: "all", label: "Tudo" },
];

function EntityFilterRow({
  allLabel,
  entities,
  selected,
  onToggle,
  onSelectAll,
  isDark,
}: {
  allLabel: string;
  entities: string[];
  selected: string[];
  onToggle: (entity: string) => void;
  onSelectAll: () => void;
  isDark: boolean;
}) {
  const colorMap = buildCategoricalColorMap(entities);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onSelectAll}
        className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
          selected.length === 0
            ? "bg-[var(--text-primary)] text-[var(--surface)] border-[var(--text-primary)]"
            : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
        }`}
      >
        {allLabel}
      </button>
      {entities.map((entity) => {
        const active = selected.includes(entity);
        const color = colorMap.get(entity);
        const dot = color ? (isDark ? color.dark : color.light) : "#888";
        return (
          <button
            key={entity}
            onClick={() => onToggle(entity)}
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
            {entity}
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({
  preset,
  onPresetChange,
  range,
  onCustomRangeChange,
  allExperts,
  selectedExperts,
  onToggleExpert,
  onSelectAllExperts,
  allChannels,
  selectedChannels,
  onToggleChannel,
  onSelectAllChannels,
}: {
  preset: PresetKey | "custom";
  onPresetChange: (p: PresetKey) => void;
  range: DateRange;
  onCustomRangeChange: (r: DateRange) => void;
  allExperts: string[];
  selectedExperts: string[];
  onToggleExpert: (expert: string) => void;
  onSelectAllExperts: () => void;
  allChannels: string[];
  selectedChannels: string[];
  onToggleChannel: (channel: string) => void;
  onSelectAllChannels: () => void;
}) {
  const isDark = useIsDark();

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

      <EntityFilterRow
        allLabel="Todos os experts"
        entities={allExperts}
        selected={selectedExperts}
        onToggle={onToggleExpert}
        onSelectAll={onSelectAllExperts}
        isDark={isDark}
      />

      <EntityFilterRow
        allLabel="Todos os canais"
        entities={allChannels}
        selected={selectedChannels}
        onToggle={onToggleChannel}
        onSelectAll={onSelectAllChannels}
        isDark={isDark}
      />
    </div>
  );
}
