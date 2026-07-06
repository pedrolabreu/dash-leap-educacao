"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipContentProps,
} from "recharts";
import type { DailyPoint } from "@/lib/aggregate";
import { formatBRL, formatDateShort } from "@/lib/format";
import { useIsDark, CHROME } from "@/lib/useIsDark";
import { CATEGORICAL } from "@/lib/colors";

function DailyTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as DailyPoint;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-sm">
      <div className="mb-1 text-[var(--text-muted)]">
        {formatDateShort(String(label))}
      </div>
      <div className="tabular-nums font-medium text-[var(--text-primary)]">
        {formatBRL(row.revenue)}
      </div>
      <div className="text-[var(--text-secondary)]">
        {row.count} {row.count === 1 ? "venda" : "vendas"}
      </div>
    </div>
  );
}

export function DailyChart({ data }: { data: DailyPoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? CHROME.dark : CHROME.light;
  const barColor = isDark ? CATEGORICAL[0].dark : CATEGORICAL[0].light;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: c.textMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: c.baseline }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatBRL(v)}
            tick={{ fill: c.textMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={84}
          />
          <Tooltip
            content={(props) => <DailyTooltip {...props} />}
            cursor={{ fill: c.grid, opacity: 0.5 }}
          />
          <Bar
            dataKey="revenue"
            name="Receita do dia"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
