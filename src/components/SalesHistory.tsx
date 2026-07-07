"use client";

import { useMemo, useState } from "react";
import type { Sale } from "@/lib/types";
import { formatBRLPrecise, formatDateFull } from "@/lib/format";

export function SalesHistory({ rows }: { rows: Sale[] }) {
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.date.localeCompare(a.date)),
    [rows],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((s) =>
      [s.name, s.email, s.product, s.expert]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [sorted, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email, produto ou expert..."
          className="w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-secondary)]"
        />
        <span className="text-sm text-[var(--text-muted)]">
          {visible.length.toLocaleString("pt-BR")}{" "}
          {visible.length === 1 ? "venda" : "vendas"}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Nenhuma venda encontrada.
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto overflow-x-auto rounded-md border border-[var(--border)]">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 bg-[var(--surface)]">
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Produto</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Expert</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, i) => (
                <tr
                  key={`${s.dedupKey}-${i}`}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                    {formatDateFull(s.date)}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-primary)]">
                    {s.name}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {s.email}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {s.product}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-[var(--text-primary)]">
                    {formatBRLPrecise(s.value)}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {s.expert}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {s.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
