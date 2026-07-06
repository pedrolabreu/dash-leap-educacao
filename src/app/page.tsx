"use client";

import { useEffect, useMemo, useState } from "react";
import type { Sale } from "@/lib/types";
import {
  buildChannelBreakdown,
  buildDailySeries,
  buildExpertBreakdown,
  buildPaceSeries,
  buildProductBreakdown,
  computeKpis,
  filterSales,
  presetRange,
  todayIso,
  uniqueChannels,
  uniqueExperts,
  type DateRange,
  type PresetKey,
} from "@/lib/aggregate";
import { FilterBar } from "@/components/FilterBar";
import { GoalInput } from "@/components/GoalInput";
import { KpiCards } from "@/components/KpiCards";
import { PaceChart } from "@/components/PaceChart";
import { DailyChart } from "@/components/DailyChart";
import { ExpertBreakdown } from "@/components/ExpertBreakdown";
import { ProductBreakdown } from "@/components/ProductBreakdown";
import { ChannelBreakdown } from "@/components/ChannelBreakdown";
import { Card } from "@/components/Card";

const REFRESH_MS = 60_000;

function goalStorageKey(range: DateRange): string {
  return `leap-sales-dash:goal:${range.start}:${range.end}`;
}

function readGoal(range: DateRange): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(goalStorageKey(range));
  return stored ? Number(stored) : null;
}

export default function Home() {
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const [preset, setPreset] = useState<PresetKey | "custom">("mtd");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const today = todayIso();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sales", { cache: "no-store" });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setSales(json.sales);
        setFetchedAt(json.fetchedAt);
        setError(null);
      } catch {
        if (!cancelled)
          setError("Não foi possível carregar os dados da planilha.");
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const allExperts = useMemo(() => uniqueExperts(sales ?? []), [sales]);
  const allChannels = useMemo(() => uniqueChannels(sales ?? []), [sales]);
  const allDates = useMemo(() => (sales ?? []).map((s) => s.date), [sales]);

  const range: DateRange = useMemo(() => {
    if (preset === "custom" && customRange) return customRange;
    return presetRange(preset === "custom" ? "mtd" : preset, today, allDates);
  }, [preset, customRange, today, allDates]);

  const rangeKey = `${range.start}:${range.end}`;
  const [loadedRangeKey, setLoadedRangeKey] = useState(rangeKey);
  const [goal, setGoal] = useState<number | null>(() => readGoal(range));
  if (rangeKey !== loadedRangeKey) {
    setLoadedRangeKey(rangeKey);
    setGoal(readGoal(range));
  }

  function handleGoalChange(value: number | null) {
    setGoal(value);
    if (value == null) localStorage.removeItem(goalStorageKey(range));
    else localStorage.setItem(goalStorageKey(range), String(value));
  }

  function handlePresetChange(p: PresetKey) {
    setPreset(p);
    setCustomRange(null);
  }

  function handleCustomRangeChange(r: DateRange) {
    setPreset("custom");
    setCustomRange(r);
  }

  function toggleExpert(expert: string) {
    setSelectedExperts((prev) =>
      prev.includes(expert)
        ? prev.filter((e) => e !== expert)
        : [...prev, expert],
    );
  }

  function toggleChannel(channel: string) {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  }

  const filtered = useMemo(
    () =>
      filterSales(sales ?? [], range, {
        experts: selectedExperts.length ? selectedExperts : null,
        channels: selectedChannels.length ? selectedChannels : null,
      }),
    [sales, range, selectedExperts, selectedChannels],
  );

  const paceSeries = useMemo(
    () => buildPaceSeries(filtered, range, goal, today),
    [filtered, range, goal, today],
  );
  const dailySeries = useMemo(
    () => buildDailySeries(filtered, range),
    [filtered, range],
  );
  const expertBreakdown = useMemo(
    () => buildExpertBreakdown(filtered),
    [filtered],
  );
  const productBreakdown = useMemo(
    () => buildProductBreakdown(filtered),
    [filtered],
  );
  const channelBreakdown = useMemo(
    () => buildChannelBreakdown(filtered),
    [filtered],
  );
  const kpis = useMemo(
    () => computeKpis(filtered, range, goal, today),
    [filtered, range, goal, today],
  );

  return (
    <div className="min-h-screen bg-[var(--page)] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Pace de Vendas — LEAP
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {fetchedAt
                ? `Atualizado em ${new Date(fetchedAt).toLocaleTimeString("pt-BR")}`
                : "Carregando dados..."}
            </p>
          </div>
          <GoalInput goal={goal} onChange={handleGoalChange} />
        </header>

        {error && (
          <Card className="text-sm text-[var(--text-secondary)]">
            {error}
          </Card>
        )}

        <FilterBar
          preset={preset}
          onPresetChange={handlePresetChange}
          range={range}
          onCustomRangeChange={handleCustomRangeChange}
          allExperts={allExperts}
          selectedExperts={selectedExperts}
          onToggleExpert={toggleExpert}
          onSelectAllExperts={() => setSelectedExperts([])}
          allChannels={allChannels}
          selectedChannels={selectedChannels}
          onToggleChannel={toggleChannel}
          onSelectAllChannels={() => setSelectedChannels([])}
        />

        <KpiCards kpis={kpis} />

        <Card>
          <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
            Pace de vendas — acumulado vs. meta
          </h2>
          <PaceChart data={paceSeries} hasGoal={goal != null} />
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
            Receita por dia
          </h2>
          <DailyChart data={dailySeries} />
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
              Vendas por expert
            </h2>
            <ExpertBreakdown
              rows={expertBreakdown}
              allExpertsInFixedOrder={allExperts}
            />
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
              Vendas por produto
            </h2>
            <ProductBreakdown rows={productBreakdown} />
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
              Vendas por canal
            </h2>
            <ChannelBreakdown
              rows={channelBreakdown}
              allChannelsInFixedOrder={allChannels}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
