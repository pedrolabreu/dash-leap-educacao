"use client";

import { CATEGORICAL } from "@/lib/colors";
import { useIsDark } from "@/lib/useIsDark";
import { formatBRL, formatPercent } from "@/lib/format";

export interface TeamGoalRow {
  label: string;
  goal: number;
  realized: number;
  emphasis?: boolean;
}

export function TeamGoals({ rows }: { rows: TeamGoalRow[] }) {
  const isDark = useIsDark();
  const barColor = isDark ? CATEGORICAL[0].dark : CATEGORICAL[0].light;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Sem meta cadastrada para o mês selecionado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const progress = row.goal > 0 ? row.realized / row.goal : 0;
        const widthPct = Math.max(2, Math.min(100, progress * 100));
        return (
          <div key={row.label}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
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
                {formatBRL(row.realized)}{" "}
                <span className="text-[var(--text-muted)]">
                  / {formatBRL(row.goal)} ({formatPercent(progress)})
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--border)]">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${widthPct}%`,
                  background: barColor,
                  opacity: row.emphasis ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
