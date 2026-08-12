import { NextResponse } from "next/server";
import { parseSalesCsv } from "@/lib/csv";
import { MANUAL_SALES, isManualDuplicate } from "@/lib/manualSales";
import { fetchSalesFromSupabase } from "@/lib/supabaseSales";
import type { Sale } from "@/lib/types";

const DEFAULT_SHEET_ID = "1b3UFDTyn5gegoKbj_29yYOH9q57CuTLqlf3A0nDlYU8";

function csvUrl(): string {
  if (process.env.SHEET_CSV_URL) return process.env.SHEET_CSV_URL;
  const id = process.env.SHEET_ID || DEFAULT_SHEET_ID;
  const gid = process.env.SHEET_GID;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ""}`;
}

export async function GET() {
  // Prefer Supabase (sales_leap, consolidated across gateways) once
  // configured; fall back to the Sheets tab otherwise, or if the query fails.
  let sales: Sale[] | null = null;
  try {
    sales = await fetchSalesFromSupabase();
  } catch (err) {
    console.error("Supabase sales fetch failed, falling back to sheet", err);
  }

  // An empty result isn't distinguishable from "not ready yet" (RLS with no
  // policy, or an unseeded table both return [] rather than erroring) —
  // treat it the same as unconfigured and fall back to the sheet.
  if (!sales || sales.length === 0) {
    const res = await fetch(csvUrl(), { next: { revalidate: 60 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao buscar a planilha (status ${res.status})` },
        { status: 502 },
      );
    }

    const csvText = await res.text();
    sales = parseSalesCsv(csvText);
  }

  const pendingManual = MANUAL_SALES.filter(
    (m) => !isManualDuplicate(m, sales!),
  );

  return NextResponse.json({
    sales: [...sales, ...pendingManual],
    fetchedAt: new Date().toISOString(),
  });
}
