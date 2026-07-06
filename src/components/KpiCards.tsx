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
      <Tile label="Receita no período" value={formatBRL(kpis.revenue)} />
      <Tile
        label="Vendas"
        value={kpis.count.toLocaleString("pt-BR")}
        sub={
          <span className="text-[var(--text-muted)]">
            Ticket médio {formatBRL(kpis.averageTicket)}
          </span>
        }
      />
      <Tile
        label="Meta do período"
        value={kpis.goal != null ? formatBRL(kpis.goal) : "—"}
        sub={
          kpis.goalProgress != null && (
            <span className="text-[var(--text-muted)]">
              {formatPercent(kpis.goalProgress)} atingido
            </span>
          )
        }
      />
      <Tile
        label="Projeção ao final do período"
        value={
          kpis.projectedTotal != null ? formatBRL(kpis.projectedTotal) : "—"
        }
        sub={<StatusBadge status={kpis.paceStatus} label={kpis.paceLabel} />}
      />
    </div>
  );
}
