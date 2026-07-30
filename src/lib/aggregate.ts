import type { Sale } from "./types";

export interface DateRange {
  start: string; // ISO yyyy-mm-dd
  end: string; // ISO yyyy-mm-dd, inclusive
}

export function uniqueExperts(sales: Sale[]): string[] {
  return Array.from(new Set(sales.map((s) => s.expert))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

const DIRECT_CHANNEL_LABEL = "Direto / Não informado";

export function channelOf(sale: Sale): string {
  return sale.utmSource.trim() || DIRECT_CHANNEL_LABEL;
}

export function uniqueChannels(sales: Sale[]): string[] {
  return Array.from(new Set(sales.map(channelOf))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export interface SaleFilters {
  experts?: string[] | null;
  channels?: string[] | null;
}

export function filterSales(
  sales: Sale[],
  range: DateRange,
  filters: SaleFilters = {},
): Sale[] {
  const { experts, channels } = filters;
  return sales.filter((s) => {
    if (s.date < range.start || s.date > range.end) return false;
    if (experts && experts.length > 0 && !experts.includes(s.expert))
      return false;
    if (channels && channels.length > 0 && !channels.includes(channelOf(s)))
      return false;
    return true;
  });
}

export function enumerateDays(range: DateRange): string[] {
  const days: string[] = [];
  const cur = new Date(`${range.start}T00:00:00Z`);
  const end = new Date(`${range.end}T00:00:00Z`);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export type PresetKey = "today" | "7d" | "30d" | "mtd" | "all";

export function presetRange(
  preset: PresetKey,
  today: string,
  allDates: string[],
): DateRange {
  if (preset === "today") return { start: today, end: today };
  if (preset === "7d") return { start: addDaysIso(today, -6), end: today };
  if (preset === "30d") return { start: addDaysIso(today, -29), end: today };
  if (preset === "mtd")
    return { start: `${today.slice(0, 7)}-01`, end: lastDayOfMonth(today) };
  // all
  const min = allDates.length ? allDates.reduce((a, b) => (a < b ? a : b)) : today;
  const max = allDates.length ? allDates.reduce((a, b) => (a > b ? a : b)) : today;
  return { start: min, end: max };
}

function addDaysIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function lastDayOfMonth(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  // Day 0 of next month rolls back to the last day of this month.
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}

/** The last two calendar days of the given month (yyyy-mm) — "a virada". */
export function buildViradaRange(monthKey: string): DateRange {
  const end = lastDayOfMonth(`${monthKey}-01`);
  const start = addDaysIso(end, -1);
  return { start, end };
}

/**
 * Reforecasts the daily targets so the month's total goal always holds:
 * every day strictly before `today` is settled (its target is left as-is —
 * it already happened), and whatever it missed or beat its target by gets
 * spread proportionally across today and the remaining days, scaled by
 * their original weight. A day that overshot pulls tomorrow's bar down;
 * a day that undershot raises it, so the sum of realized + remaining
 * targets always equals the original monthly total.
 */
export function buildAdjustedDailyTargets(
  sales: Sale[],
  dailyTargetMap: Map<string, number>,
  monthKey: string,
  today: string,
): Map<string, number> {
  const actualByDate = new Map<string, number>();
  for (const s of sales) {
    if (!s.date.startsWith(monthKey)) continue;
    actualByDate.set(s.date, (actualByDate.get(s.date) ?? 0) + s.value);
  }

  const monthDates = Array.from(dailyTargetMap.keys())
    .filter((d) => d.startsWith(monthKey))
    .sort();
  const settled = monthDates.filter((d) => d < today);
  const remaining = monthDates.filter((d) => d >= today);

  const settledVariance = settled.reduce((sum, d) => {
    const actual = actualByDate.get(d) ?? 0;
    const target = dailyTargetMap.get(d) ?? 0;
    return sum + (actual - target);
  }, 0);

  const originalRemainingTotal = remaining.reduce(
    (sum, d) => sum + (dailyTargetMap.get(d) ?? 0),
    0,
  );
  const adjustedRemainingTotal = originalRemainingTotal - settledVariance;
  const scale =
    originalRemainingTotal > 0
      ? Math.max(0, adjustedRemainingTotal / originalRemainingTotal)
      : 1;

  const adjusted = new Map(dailyTargetMap);
  for (const d of remaining) {
    adjusted.set(d, (dailyTargetMap.get(d) ?? 0) * scale);
  }
  return adjusted;
}

export interface PacePoint {
  date: string;
  actualCumulative: number | null;
  targetCumulative: number | null;
}

export function buildPaceSeries(
  filtered: Sale[],
  range: DateRange,
  goal: number | null,
  today: string,
  dailyTargets?: Map<string, number>,
): PacePoint[] {
  const days = enumerateDays(range);
  const dailyTotals = new Map<string, number>();
  for (const s of filtered) {
    dailyTotals.set(s.date, (dailyTotals.get(s.date) ?? 0) + s.value);
  }
  const totalDays = days.length;
  // Falls back to a flat linear share only for days missing from the daily
  // goals sheet (e.g. a month that hasn't been broken down yet).
  const linearShare = goal != null ? goal / totalDays : 0;
  let cumulative = 0;
  let targetCumulative = 0;
  return days.map((date) => {
    const isFuture = date > today;
    if (!isFuture) cumulative += dailyTotals.get(date) ?? 0;
    if (goal != null) targetCumulative += dailyTargets?.get(date) ?? linearShare;
    return {
      date,
      actualCumulative: isFuture ? null : cumulative,
      targetCumulative: goal != null ? targetCumulative : null,
    };
  });
}

export interface DailyPoint {
  date: string;
  revenue: number;
  count: number;
}

export function buildDailySeries(
  filtered: Sale[],
  range: DateRange,
): DailyPoint[] {
  const days = enumerateDays(range);
  const revenueMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const s of filtered) {
    revenueMap.set(s.date, (revenueMap.get(s.date) ?? 0) + s.value);
    countMap.set(s.date, (countMap.get(s.date) ?? 0) + 1);
  }
  return days.map((date) => ({
    date,
    revenue: revenueMap.get(date) ?? 0,
    count: countMap.get(date) ?? 0,
  }));
}

export interface ExpertBreakdownRow {
  expert: string;
  revenue: number;
  count: number;
  share: number;
}

export function buildExpertBreakdown(filtered: Sale[]): ExpertBreakdownRow[] {
  const totals = new Map<string, { revenue: number; count: number }>();
  let totalRevenue = 0;
  for (const s of filtered) {
    const t = totals.get(s.expert) ?? { revenue: 0, count: 0 };
    t.revenue += s.value;
    t.count += 1;
    totals.set(s.expert, t);
    totalRevenue += s.value;
  }
  return Array.from(totals.entries())
    .map(([expert, t]) => ({
      expert,
      revenue: t.revenue,
      count: t.count,
      share: totalRevenue > 0 ? t.revenue / totalRevenue : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ChannelBreakdownRow {
  channel: string;
  revenue: number;
  count: number;
  share: number;
}

export function buildChannelBreakdown(filtered: Sale[]): ChannelBreakdownRow[] {
  const totals = new Map<string, { revenue: number; count: number }>();
  let totalRevenue = 0;
  for (const s of filtered) {
    const channel = channelOf(s);
    const t = totals.get(channel) ?? { revenue: 0, count: 0 };
    t.revenue += s.value;
    t.count += 1;
    totals.set(channel, t);
    totalRevenue += s.value;
  }
  return Array.from(totals.entries())
    .map(([channel, t]) => ({
      channel,
      revenue: t.revenue,
      count: t.count,
      share: totalRevenue > 0 ? t.revenue / totalRevenue : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

const COMERCIAL_CAMPAIGN = "comercial";

export interface ComercialActuals {
  total: number;
  byVendedor: Map<string, number>; // keyed by lowercased vendedor name
}

/**
 * Realized revenue for the Comercial team this month — a sale counts as
 * Comercial when its UTM campaign is "comercial"; the vendedor who closed
 * it is read from UTM medium (e.g. "lucas").
 */
export function buildComercialActuals(
  sales: Sale[],
  monthKey: string,
): ComercialActuals {
  let total = 0;
  const byVendedor = new Map<string, number>();
  for (const s of sales) {
    if (!s.date.startsWith(monthKey)) continue;
    if (s.utmCampaign.trim().toLowerCase() !== COMERCIAL_CAMPAIGN) continue;
    total += s.value;
    const key = s.utmMedium.trim().toLowerCase();
    if (key) byVendedor.set(key, (byVendedor.get(key) ?? 0) + s.value);
  }
  return { total, byVendedor };
}

export interface ProductBreakdownRow {
  product: string;
  revenue: number;
  count: number;
  share: number;
}

export function buildProductBreakdown(
  filtered: Sale[],
  topN = 8,
): ProductBreakdownRow[] {
  const totals = new Map<string, { revenue: number; count: number }>();
  let totalRevenue = 0;
  for (const s of filtered) {
    const t = totals.get(s.product) ?? { revenue: 0, count: 0 };
    t.revenue += s.value;
    t.count += 1;
    totals.set(s.product, t);
    totalRevenue += s.value;
  }
  const rows = Array.from(totals.entries())
    .map(([product, t]) => ({
      product,
      revenue: t.revenue,
      count: t.count,
      share: totalRevenue > 0 ? t.revenue / totalRevenue : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  if (rows.length <= topN) return rows;

  const top = rows.slice(0, topN);
  const other = rows.slice(topN).reduce(
    (acc, r) => ({
      product: "Outros",
      revenue: acc.revenue + r.revenue,
      count: acc.count + r.count,
      share: acc.share + r.share,
    }),
    { product: "Outros", revenue: 0, count: 0, share: 0 },
  );
  return [...top, other];
}

export type PaceStatus = "good" | "warning" | "critical" | "none";

export interface Kpis {
  revenue: number;
  count: number;
  averageTicket: number;
  goal: number | null;
  goalProgress: number | null;
  daysElapsed: number;
  totalDays: number;
  projectedTotal: number;
  paceStatus: PaceStatus;
  paceLabel: string;
  gap: number | null;
}

export function computeKpis(
  filtered: Sale[],
  range: DateRange,
  goal: number | null,
  today: string,
): Kpis {
  const revenue = filtered.reduce((sum, s) => sum + s.value, 0);
  const count = filtered.length;
  const averageTicket = count > 0 ? revenue / count : 0;

  const days = enumerateDays(range);
  const totalDays = days.length;
  const daysElapsed = days.filter((d) => d <= today).length || 1;

  const projectedTotal = (revenue / daysElapsed) * totalDays;

  let paceStatus: PaceStatus = "none";
  let paceLabel = "Sem meta definida";
  if (goal != null && goal > 0) {
    const ratio = projectedTotal / goal;
    if (ratio >= 1.02) {
      paceStatus = "good";
      paceLabel = "Adiantado";
    } else if (ratio >= 0.98) {
      paceStatus = "good";
      paceLabel = "No ritmo";
    } else if (ratio >= 0.85) {
      paceStatus = "warning";
      paceLabel = "Atenção";
    } else {
      paceStatus = "critical";
      paceLabel = "Atrasado";
    }
  }

  return {
    revenue,
    count,
    averageTicket,
    goal,
    goalProgress: goal != null && goal > 0 ? revenue / goal : null,
    daysElapsed,
    totalDays,
    projectedTotal,
    paceStatus,
    paceLabel,
    gap: goal != null ? Math.max(0, goal - revenue) : null,
  };
}
