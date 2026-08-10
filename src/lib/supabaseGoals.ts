import { getSupabaseClient } from "./supabaseClient";
import type { MonthGoals } from "./goals";

/**
 * Reads metas_mes (mes, empresa, comercial) + metas_mes_vendedor (mes,
 * vendedor, meta) and reshapes into the same MonthGoals[] the Sheets parser
 * produces, so page.tsx doesn't need to know which source is active.
 * Returns null when Supabase isn't configured, so the caller can fall back.
 */
export async function fetchMonthGoalsFromSupabase(): Promise<
  MonthGoals[] | null
> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const [mesesRes, vendedoresRes] = await Promise.all([
    supabase.from("metas_mes").select("mes, empresa, comercial"),
    supabase.from("metas_mes_vendedor").select("mes, vendedor, meta"),
  ]);
  if (mesesRes.error) throw new Error(mesesRes.error.message);
  if (vendedoresRes.error) throw new Error(vendedoresRes.error.message);

  const meses = mesesRes.data ?? [];
  const vendedores = vendedoresRes.data ?? [];

  return meses.map((row) => ({
    month: String(row.mes).slice(0, 7),
    empresa: row.empresa,
    comercial: row.comercial,
    vendedores: vendedores
      .filter((v) => v.mes === row.mes)
      .map((v) => ({ name: v.vendedor, value: v.meta })),
  }));
}
