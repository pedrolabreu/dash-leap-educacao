import { getSupabaseClient } from "./supabaseClient";
import type { DayGoal } from "./dailyGoals";

/**
 * Reads metas_dia (data, meta_equipe, meta_por_vendedor, meta_fat_global)
 * and reshapes into DayGoal[], same contract as the Sheets parser. Returns
 * null when Supabase isn't configured, so the caller can fall back.
 */
export async function fetchDailyGoalsFromSupabase(): Promise<
  DayGoal[] | null
> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("metas_dia")
    .select("data, meta_equipe, meta_por_vendedor, meta_fat_global");
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    date: String(row.data),
    metaEquipe: row.meta_equipe ?? 0,
    metaPorVendedor: row.meta_por_vendedor ?? 0,
    metaFatGlobal: row.meta_fat_global ?? 0,
  }));
}
