"use client";

import type { MonthGoals } from "@/lib/goals";
import { CATEGORICAL } from "@/lib/colors";
import { useIsDark } from "@/lib/useIsDark";
import { formatBRL } from "@/lib/format";

export function TeamGoals({ monthGoals }: { monthGoals: MonthGoals | null }) {
  const isDark = useIsDark();
  const barColor = isDark ? CATEGORICAL[0].dark : CATEGORICAL[0].light;

  const rows = monthGoals
    ? [
        { label: "Comercial (time)", value: monthGoals.comercial, emphasis: true },
        ...monthGoals.vendedores.map((v) => ({
          label: v.name,
          value: v.value,
          emphasis: false,
        })),
      ].filter(
        (r): r is { label: string; value: number; emphasis: boolean } =>
          r.value != null,
      )
    : [];

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Sem meta cadastrada para o mês selecionado.
      </p>
    );
  }

  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span
              className={
                row.emphasis
                  ? "font-semibold text-[var(--text-primary)]"
                  : "font-medium text-[var(--text-primary)]"
              }
            >
              {row.label}
            </span>
            <span className="tabular-nums text-[var(--text-secondary)]">
              {formatBRL(row.value)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--border)]">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.max(2, (row.value / max) * 100)}%`,
                background: barColor,
                opacity: row.emphasis ? 1 : 0.7,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
