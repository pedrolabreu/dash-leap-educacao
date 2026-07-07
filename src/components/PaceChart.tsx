"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipContentProps,
} from "recharts";
import type { PacePoint } from "@/lib/aggregate";
import { formatBRL, formatDateShort } from "@/lib/format";
import { useIsDark, CHROME } from "@/lib/useIsDark";
import { CATEGORICAL } from "@/lib/colors";

function PaceTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-sm">
      <div className="mb-1 text-[var(--text-muted)]">
        {formatDateShort(String(label))}
      </div>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-3"
            style={{ background: p.color }}
            aria-hidden="true"
          />
          <span className="tabular-nums font-medium text-[var(--text-primary)]">
            {p.value != null ? formatBRL(Number(p.value)) : "—"}
          </span>
          <span className="text-[var(--text-secondary)]">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export function PaceChart({
  data,
  hasGoal,
}: {
  data: PacePoint[];
  hasGoal: boolean;
}) {
  const isDark = useIsDark();
  const c = isDark ? CHROME.dark : CHROME.light;
  const seriesColor = isDark ? CATEGORICAL[0].dark : CATEGORICAL[0].light;

  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
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
              content={(props) => <PaceTooltip {...props} />}
              cursor={{ stroke: c.baseline, strokeWidth: 1 }}
            />
            {hasGoal && (
              <Line
                type="linear"
                dataKey="targetCumulative"
                name="Meta acumulada"
                stroke={c.baseline}
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="actualCumulative"
              name="Receita acumulada"
              stroke={seriesColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: seriesColor }}
            aria-hidden="true"
          />
          Receita acumulada
        </span>
        {hasGoal && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 border-t-2 border-dashed"
              style={{ borderColor: c.baseline }}
              aria-hidden="true"
            />
            Meta acumulada
          </span>
        )}
      </div>
    </div>
  );
}
