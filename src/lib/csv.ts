import Papa from "papaparse";
import type { Sale } from "./types";

function parseValor(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function col(row: Record<string, string>, key: string): string {
  return (row[key] ?? "").trim();
}

/**
 * The sheet's DATA column has been observed both as ISO (2026-07-02) and as
 * Brazilian-locale text (02/07/2026, from a cell format change upstream) —
 * normalize either to ISO yyyy-mm-dd since all filtering/sorting is done on
 * that string.
 */
function parseDataDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, day, month, year] = br;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return raw;
}

export function parseSalesCsv(csvText: string): Sale[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .filter((row) => col(row, "DATA") && col(row, "EXPERT"))
    .map((row) => ({
      date: parseDataDate(col(row, "DATA")),
      name: col(row, "NOME"),
      email: col(row, "EMAIL"),
      phone: col(row, "TELEFONE"),
      product: col(row, "PRODUTO"),
      value: parseValor(row["VALOR"]),
      expert: col(row, "EXPERT"),
      type: col(row, "TIPO"),
      utmSource: col(row, "UTM SOURCE"),
      utmCampaign: col(row, "UTM CAMPAIGN"),
      utmMedium: col(row, "UTM MEDIUM"),
      utmContent: col(row, "UTM CONTENT"),
      utmTerm: col(row, "UTM TERM"),
      dedupKey: col(row, "chave_dedup"),
    }));
}
