import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { formatBRL, formatPercent } from "@/lib/format";
import type { Kpis } from "@/lib/aggregate";

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
      {sub && <div className="mt-1 text-sm">{sub}</div>}
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Tile label="Faturamento" value={formatBRL(kpis.revenue)} />
      <Tile
        label="Meta do mês"
        value={kpis.goal != null ? formatBRL(kpis.goal) : "—"}
      />
      <Tile
        label="Realizado x meta"
        value={
          kpis.goalProgress != null ? formatPercent(kpis.goalProgress) : "—"
        }
        sub={
          kpis.goal == null && (
            <span className="text-[var(--text-muted)]">
              Defina uma meta acima
            </span>
          )
        }
      />
      <Tile
        label="Projeção de fechamento"
        value={formatBRL(kpis.projectedTotal)}
        sub={<StatusBadge status={kpis.paceStatus} label={kpis.paceLabel} />}
      />
      <Tile
        label="Gap para meta"
        value={kpis.gap != null ? formatBRL(kpis.gap) : "—"}
        sub={
          kpis.gap === 0 && kpis.goal != null ? (
            <span className="text-[var(--success-text)]">Meta batida</span>
          ) : undefined
        }
      />
      <Tile label="Ticket médio" value={formatBRL(kpis.averageTicket)} />
      <Tile label="Número de vendas" value={kpis.count.toLocaleString("pt-BR")} />
    </div>
  );
}
