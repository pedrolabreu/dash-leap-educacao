import { NextResponse } from "next/server";
import { parseGoalsCsv } from "@/lib/goals";
import { fetchMonthGoalsFromSupabase } from "@/lib/supabaseGoals";

const DEFAULT_SHEET_ID = "1b3UFDTyn5gegoKbj_29yYOH9q57CuTLqlf3A0nDlYU8";
const DEFAULT_GOALS_GID = "406321113"; // "Controle de Metas" tab

function csvUrl(): string {
  if (process.env.GOALS_SHEET_CSV_URL) return process.env.GOALS_SHEET_CSV_URL;
  const id = process.env.SHEET_ID || DEFAULT_SHEET_ID;
  const gid = process.env.GOALS_SHEET_GID || DEFAULT_GOALS_GID;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

export async function GET() {
  // Prefer Supabase (metas_mes / metas_mes_vendedor) once configured; fall
  // back to the Sheets tab otherwise, or if the query itself fails.
  try {
    const supabaseGoals = await fetchMonthGoalsFromSupabase();
    if (supabaseGoals) return NextResponse.json({ goals: supabaseGoals });
  } catch (err) {
    console.error("Supabase goals fetch failed, falling back to sheet", err);
  }

  const res = await fetch(csvUrl(), { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Falha ao buscar a aba de metas (status ${res.status})` },
      { status: 502 },
    );
  }

  const csvText = await res.text();
  const goals = parseGoalsCsv(csvText);

  return NextResponse.json({ goals });
}
