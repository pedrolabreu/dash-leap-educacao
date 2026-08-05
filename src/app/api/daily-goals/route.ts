import { NextResponse } from "next/server";
import { parseDailyGoalsCsv } from "@/lib/dailyGoals";
import { MANUAL_DAILY_GOALS } from "@/lib/manualDailyGoals";

const DEFAULT_SHEET_ID = "1b3UFDTyn5gegoKbj_29yYOH9q57CuTLqlf3A0nDlYU8";
const DEFAULT_GID = "2028871865"; // "controle_meta_dia" tab

function csvUrl(): string {
  if (process.env.DAILY_GOALS_SHEET_CSV_URL)
    return process.env.DAILY_GOALS_SHEET_CSV_URL;
  const id = process.env.SHEET_ID || DEFAULT_SHEET_ID;
  const gid = process.env.DAILY_GOALS_SHEET_GID || DEFAULT_GID;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

export async function GET() {
  const res = await fetch(csvUrl(), { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Falha ao buscar a aba de metas diárias (status ${res.status})` },
      { status: 502 },
    );
  }

  const csvText = await res.text();
  const referenceYear = new Date().toISOString().slice(0, 4);
  const sheetGoals = parseDailyGoalsCsv(csvText, referenceYear);

  // Manual entries win over the sheet for their dates — lets us load
  // confirmed figures ahead of (or in place of) a stale/pending sheet update.
  const byDate = new Map(sheetGoals.map((g) => [g.date, g]));
  for (const manual of MANUAL_DAILY_GOALS) byDate.set(manual.date, manual);
  const dailyGoals = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return NextResponse.json({ dailyGoals });
}
