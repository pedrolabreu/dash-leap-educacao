import { STATUS } from "@/lib/colors";
import { formatBRL, formatDateShort, formatPercent } from "@/lib/format";
import type { DateRange } from "@/lib/aggregate";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

export function ViradaCard({
  range,
  revenue,
  count,
  goal,
  daysUntil,
  isActive,
}: {
  range: DateRange;
  revenue: number;
  count: number;
  goal: number | null;
  daysUntil: number;
  isActive: boolean;
}) {
  const accent = isActive ? STATUS.critical.light : STATUS.warning.light;
  const progress = goal != null && goal > 0 ? revenue / goal : null;

  return (
    <div
      className="rounded-xl bg-[var(--surface)] border border-[var(--border)] border-l-4 p-5"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Virada do mês{" "}
          <span className="text-[var(--text-muted)]">
            ({formatDateShort(range.start)} a {formatDateShort(range.end)})
          </span>
        </h2>
        <span
          className="text-sm font-semibold"
          style={{ color: accent }}
        >
          {isActive
            ? "Em andamento — prioridade máxima"
            : `Faltam ${daysUntil} ${daysUntil === 1 ? "dia" : "dias"}`}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Faturamento na virada" value={formatBRL(revenue)} />
        <Stat
          label="Meta da virada"
          value={goal != null ? formatBRL(goal) : "—"}
        />
        <Stat
          label="Realizado x meta"
          value={progress != null ? formatPercent(progress) : "—"}
        />
        <Stat label="Vendas" value={count.toLocaleString("pt-BR")} />
      </div>
    </div>
  );
}
