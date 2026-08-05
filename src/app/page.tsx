"use client";

import { useEffect, useMemo, useState } from "react";
import type { Sale } from "@/lib/types";
import {
  buildAdjustedDailyTargets,
  buildChannelBreakdown,
  buildComercialActuals,
  buildDailySeries,
  buildExpertBreakdown,
  buildPaceSeries,
  buildProductBreakdown,
  buildViradaRange,
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
import { KpiCards } from "@/components/KpiCards";
import { PaceChart } from "@/components/PaceChart";
import { DailyChart } from "@/components/DailyChart";
import { ExpertBreakdown } from "@/components/ExpertBreakdown";
import { ProductBreakdown } from "@/components/ProductBreakdown";
import { ChannelBreakdown } from "@/components/ChannelBreakdown";
import { TeamGoals, type TeamGoalRow } from "@/components/TeamGoals";
import { SalesHistory } from "@/components/SalesHistory";
import { ViradaCard } from "@/components/ViradaCard";
import { Card } from "@/components/Card";
import { findMonthGoals, type MonthGoals } from "@/lib/goals";
import type { DayGoal } from "@/lib/dailyGoals";

const REFRESH_MS = 60_000;
const VIRADA_GOAL = 100_000;

export default function Home() {
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [goals, setGoals] = useState<MonthGoals[] | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DayGoal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const [preset, setPreset] = useState<PresetKey | "custom">("mtd");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  const today = todayIso();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [salesRes, goalsRes, dailyGoalsRes] = await Promise.all([
          fetch("/api/sales", { cache: "no-store" }),
          fetch("/api/goals", { cache: "no-store" }),
          fetch("/api/daily-goals", { cache: "no-store" }),
        ]);
        if (!salesRes.ok) throw new Error(`Erro ${salesRes.status}`);
        if (!goalsRes.ok) throw new Error(`Erro ${goalsRes.status}`);
        if (!dailyGoalsRes.ok) throw new Error(`Erro ${dailyGoalsRes.status}`);
        const salesJson = await salesRes.json();
        const goalsJson = await goalsRes.json();
        const dailyGoalsJson = await dailyGoalsRes.json();
        if (cancelled) return;
        setSales(salesJson.sales);
        setGoals(goalsJson.goals);
        setDailyGoals(dailyGoalsJson.dailyGoals);
        setFetchedAt(salesJson.fetchedAt);
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

  const monthKey = today.slice(0, 7);
  const monthGoals = useMemo(
    () => (goals ? findMonthGoals(goals, monthKey) : null),
    [goals, monthKey],
  );
  const dailyTargetMap = useMemo(() => {
    const map = new Map<string, number>();
    (dailyGoals ?? []).forEach((d) => map.set(d.date, d.metaFatGlobal));
    return map;
  }, [dailyGoals]);
  const monthlyGoalFromDaily = useMemo(() => {
    let sum = 0;
    for (const d of dailyGoals ?? []) {
      if (d.date.startsWith(monthKey)) sum += d.metaFatGlobal;
    }
    return sum;
  }, [dailyGoals, monthKey]);
  const comercialGoalFromDaily = useMemo(() => {
    let sum = 0;
    for (const d of dailyGoals ?? []) {
      if (d.date.startsWith(monthKey)) sum += d.metaEquipe;
    }
    return sum;
  }, [dailyGoals, monthKey]);
  const perVendedorGoalFromDaily = useMemo(() => {
    let sum = 0;
    for (const d of dailyGoals ?? []) {
      if (d.date.startsWith(monthKey)) sum += d.metaPorVendedor;
    }
    return sum;
  }, [dailyGoals, monthKey]);
  const goal =
    (monthlyGoalFromDaily > 0 ? monthlyGoalFromDaily : monthGoals?.empresa) ??
    null;

  const comercialActuals = useMemo(
    () => buildComercialActuals(sales ?? [], monthKey),
    [sales, monthKey],
  );
  const comercialGoal =
    (comercialGoalFromDaily > 0
      ? comercialGoalFromDaily
      : monthGoals?.comercial) ?? null;
  const teamGoalRows: TeamGoalRow[] = useMemo(() => {
    const rows: TeamGoalRow[] = [];
    if (comercialGoal != null) {
      rows.push({
        label: "Comercial (time)",
        goal: comercialGoal,
        realized: comercialActuals.total,
        emphasis: true,
      });
    }
    for (const v of monthGoals?.vendedores ?? []) {
      const vendedorGoal =
        perVendedorGoalFromDaily > 0 ? perVendedorGoalFromDaily : v.value;
      if (vendedorGoal == null) continue;
      rows.push({
        label: v.name,
        goal: vendedorGoal,
        realized: comercialActuals.byVendedor.get(v.name.toLowerCase()) ?? 0,
      });
    }
    return rows;
  }, [comercialGoal, comercialActuals, monthGoals, perVendedorGoalFromDaily]);

  // Reforecast: a settled day's miss/beat gets spread across today and the
  // remaining days so the fixed monthly goal still holds. Always based on
  // whole-company actuals, independent of the expert filter — the goal
  // itself doesn't change with that filter either.
  const adjustedDailyTargetMap = useMemo(
    () =>
      buildAdjustedDailyTargets(sales ?? [], dailyTargetMap, monthKey, today),
    [sales, dailyTargetMap, monthKey, today],
  );

  // Virada do mês: the last two calendar days, isolated on purpose so the
  // team feels the month-end sprint regardless of whatever the main filters
  // are set to — always whole-company, same as the other goal figures.
  const viradaRange = useMemo(() => buildViradaRange(monthKey), [monthKey]);
  const viradaSales = useMemo(
    () =>
      (sales ?? []).filter(
        (s) => s.date >= viradaRange.start && s.date <= viradaRange.end,
      ),
    [sales, viradaRange],
  );
  const viradaRevenue = viradaSales.reduce((sum, s) => sum + s.value, 0);
  // Set deliberately, not derived from the daily-goals redistribution — the
  // virada target is a fixed, round push number for these two days.
  const viradaGoal = VIRADA_GOAL;
  const viradaDaysUntil = Math.max(
    0,
    Math.round(
      (new Date(`${viradaRange.start}T00:00:00Z`).getTime() -
        new Date(`${today}T00:00:00Z`).getTime()) /
        86_400_000,
    ),
  );
  const viradaIsActive = today >= viradaRange.start;

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

  const filtered = useMemo(
    () =>
      filterSales(sales ?? [], range, {
        experts: selectedExperts.length ? selectedExperts : null,
      }),
    [sales, range, selectedExperts],
  );

  const paceSeries = useMemo(
    () => buildPaceSeries(filtered, range, goal, today, adjustedDailyTargetMap),
    [filtered, range, goal, today, adjustedDailyTargetMap],
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
        <header>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Dashboard de Vendas
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {fetchedAt
              ? `Atualizado em ${new Date(fetchedAt).toLocaleTimeString("pt-BR")}`
              : "Carregando dados..."}
          </p>
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
        />

        <ViradaCard
          range={viradaRange}
          revenue={viradaRevenue}
          count={viradaSales.length}
          goal={viradaGoal}
          daysUntil={viradaDaysUntil}
          isActive={viradaIsActive}
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

        <Card>
          <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
            Metas do Comercial
          </h2>
          <TeamGoals rows={teamGoalRows} />
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-medium text-[var(--text-primary)]">
            Histórico de vendas
          </h2>
          <SalesHistory rows={filtered} />
        </Card>
      </div>
    </div>
  );
}
