import { getSupabaseClient } from "./supabaseClient";
import type { Sale } from "./types";

const SELECT_COLUMNS =
  "data_venda, nome, email, telefone, produto, valor, expert, tipo, utm_source, utm_campaign, utm_medium, utm_content, utm_term, chave_dedup";

const PAGE_SIZE = 1000; // PostgREST's default page cap — paginate past it.

/**
 * Reads sales_leap (consolidated across payment gateways — Hubla, Eduzz)
 * and reshapes into Sale[], same contract the Sheets CSV parser produces.
 * Returns null when Supabase isn't configured, so the caller can fall back.
 */
export async function fetchSalesFromSupabase(): Promise<Sale[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const rows: Record<string, unknown>[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("sales_leap")
      .select(SELECT_COLUMNS)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows
    .filter((row) => row.data_venda)
    .map((row) => ({
      date: String(row.data_venda),
      name: (row.nome as string) ?? "",
      email: (row.email as string) ?? "",
      phone: (row.telefone as string) ?? "",
      product: (row.produto as string) ?? "",
      value: Number(row.valor) || 0,
      expert: (row.expert as string)?.trim() || "Não informado",
      type: (row.tipo as string) ?? "",
      utmSource: (row.utm_source as string) ?? "",
      utmCampaign: (row.utm_campaign as string) ?? "",
      utmMedium: (row.utm_medium as string) ?? "",
      utmContent: (row.utm_content as string) ?? "",
      utmTerm: (row.utm_term as string) ?? "",
      dedupKey: (row.chave_dedup as string) ?? "",
    }));
}
