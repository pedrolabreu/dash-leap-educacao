"use client";

import type { ChannelBreakdownRow } from "@/lib/aggregate";
import { buildCategoricalColorMap } from "@/lib/colors";
import { useIsDark } from "@/lib/useIsDark";
import { formatBRL, formatPercent } from "@/lib/format";

export function ChannelBreakdown({
  rows,
  allChannelsInFixedOrder,
}: {
  rows: ChannelBreakdownRow[];
  allChannelsInFixedOrder: string[];
}) {
  const isDark = useIsDark();
  const colorMap = buildCategoricalColorMap(allChannelsInFixedOrder);
  const max = Math.max(1, ...rows.map((r) => r.revenue));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Nenhuma venda no período selecionado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const color = colorMap.get(row.channel);
        const barColor = color ? (isDark ? color.dark : color.light) : "#888";
        const widthPct = Math.max(2, (row.revenue / max) * 100);
        return (
          <div key={row.channel}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
              <span
                className="font-medium text-[var(--text-primary)]"
                title={row.channel}
              >
                {row.channel}
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">
                {formatBRL(row.revenue)}{" "}
                <span className="text-[var(--text-muted)]">
                  ({formatPercent(row.share)} · {row.count}{" "}
                  {row.count === 1 ? "venda" : "vendas"})
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--border)]">
              <div
                className="h-2 rounded-full"
                style={{ width: `${widthPct}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
