import Papa from "papaparse";

export interface MonthGoals {
  month: string; // ISO yyyy-mm
  empresa: number | null;
  comercial: number | null;
  vendedores: { name: string; value: number | null }[];
}

const FIXED_COLUMNS = new Set(["Mês", "Empresa", "Comercial"]);

function parseGoalValue(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-") return null;
  const cleaned = trimmed.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseMonth(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{4})$/);
  if (!m) return raw.trim();
  const [, month, year] = m;
  return `${year}-${month.padStart(2, "0")}`;
}

export function parseGoalsCsv(csvText: string): MonthGoals[] {
  const { data, meta } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const vendedorColumns = (meta.fields ?? []).filter(
    (f) => f !== "Mês" && !FIXED_COLUMNS.has(f),
  );

  return data
    .filter((row) => row["Mês"]?.trim())
    .map((row) => ({
      month: parseMonth(row["Mês"]),
      empresa: parseGoalValue(row["Empresa"]),
      comercial: parseGoalValue(row["Comercial"]),
      vendedores: vendedorColumns.map((name) => ({
        name,
        value: parseGoalValue(row[name]),
      })),
    }));
}

export function findMonthGoals(
  goals: MonthGoals[],
  monthKey: string,
): MonthGoals | null {
  return goals.find((g) => g.month === monthKey) ?? null;
}
