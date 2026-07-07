import Papa from "papaparse";

export interface DayGoal {
  date: string; // ISO yyyy-mm-dd
  metaEquipe: number;
  metaPorVendedor: number;
}

const PT_MONTHS: Record<string, string> = {
  jan: "01",
  fev: "02",
  mar: "03",
  abr: "04",
  mai: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  set: "09",
  out: "10",
  nov: "11",
  dez: "12",
};

function parseValue(raw: string | undefined): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-") return 0;
  const cleaned = trimmed.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

/**
 * The sheet's "Data" column has no year (e.g. "01/Jul") — it always tracks
 * whichever month is currently active, so the caller supplies the year.
 */
function parseDiaDate(raw: string, referenceYear: string): string | null {
  // Google's CSV export renders this as e.g. "01/jul." — lowercase, with a
  // trailing period on the abbreviated month.
  const m = raw.trim().match(/^(\d{1,2})\/([A-Za-zÀ-ÿ]{3,})\.?$/);
  if (!m) return null;
  const [, day, monthName] = m;
  const month = PT_MONTHS[monthName.toLowerCase().slice(0, 3)];
  if (!month) return null;
  return `${referenceYear}-${month}-${day.padStart(2, "0")}`;
}

export function parseDailyGoalsCsv(
  csvText: string,
  referenceYear: string,
): DayGoal[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): DayGoal | null => {
      const date = parseDiaDate(row["Data"] ?? "", referenceYear);
      if (!date) return null;
      return {
        date,
        metaEquipe: parseValue(row["Meta equipe"]),
        metaPorVendedor: parseValue(row["Meta por vendedor"]),
      };
    })
    .filter((d): d is DayGoal => d !== null);
}
