import type { DayGoal } from "./dailyGoals";

/**
 * Metas diárias de agosto/2026, recebidas diretamente do cliente. Sobrepõe
 * (por data) o que vier da aba controle_meta_dia do Sheets, então segue
 * valendo mesmo que a planilha ainda não tenha sido atualizada com essas
 * colunas. Remover quando a aba estiver com os mesmos números.
 */
export const MANUAL_DAILY_GOALS: DayGoal[] = [
  { date: "2026-08-01", metaEquipe: 6410, metaPorVendedor: 3205, metaFatGlobal: 9073 },
  { date: "2026-08-02", metaEquipe: 3205, metaPorVendedor: 1602.5, metaFatGlobal: 4980 },
  { date: "2026-08-03", metaEquipe: 21795, metaPorVendedor: 10897.5, metaFatGlobal: 28008 },
  { date: "2026-08-04", metaEquipe: 18590, metaPorVendedor: 9295, metaFatGlobal: 24359 },
  { date: "2026-08-05", metaEquipe: 15385, metaPorVendedor: 7692.5, metaFatGlobal: 20267 },
  { date: "2026-08-06", metaEquipe: 13462, metaPorVendedor: 6731, metaFatGlobal: 17900 },
  { date: "2026-08-07", metaEquipe: 11538, metaPorVendedor: 5769, metaFatGlobal: 15532 },
  { date: "2026-08-08", metaEquipe: 9615, metaPorVendedor: 4807.5, metaFatGlobal: 12278 },
  { date: "2026-08-09", metaEquipe: 0, metaPorVendedor: 0, metaFatGlobal: 1775 },
  { date: "2026-08-10", metaEquipe: 0, metaPorVendedor: 0, metaFatGlobal: 6657 },
  { date: "2026-08-11", metaEquipe: 26374, metaPorVendedor: 13187, metaFatGlobal: 59405 },
  { date: "2026-08-12", metaEquipe: 21578, metaPorVendedor: 10789, metaFatGlobal: 48925 },
  { date: "2026-08-13", metaEquipe: 3537, metaPorVendedor: 1768.5, metaFatGlobal: 11956 },
  { date: "2026-08-14", metaEquipe: 2948, metaPorVendedor: 1474, metaFatGlobal: 10334 },
  { date: "2026-08-15", metaEquipe: 983, metaPorVendedor: 491.5, metaFatGlobal: 5072 },
  { date: "2026-08-16", metaEquipe: 590, metaPorVendedor: 295, metaFatGlobal: 3399 },
  { date: "2026-08-17", metaEquipe: 199846, metaPorVendedor: 99923, metaFatGlobal: 262459 },
  { date: "2026-08-18", metaEquipe: 246323, metaPorVendedor: 123161.5, metaFatGlobal: 320203 },
  { date: "2026-08-19", metaEquipe: 12945, metaPorVendedor: 6472.5, metaFatGlobal: 19750 },
  { date: "2026-08-20", metaEquipe: 10808, metaPorVendedor: 5404, metaFatGlobal: 16649 },
  { date: "2026-08-21", metaEquipe: 10036, metaPorVendedor: 5018, metaFatGlobal: 15346 },
  { date: "2026-08-22", metaEquipe: 3563, metaPorVendedor: 1781.5, metaFatGlobal: 5695 },
  { date: "2026-08-23", metaEquipe: 2138, metaPorVendedor: 1069, metaFatGlobal: 3553 },
  { date: "2026-08-24", metaEquipe: 19274, metaPorVendedor: 9637, metaFatGlobal: 29448 },
  { date: "2026-08-25", metaEquipe: 5325, metaPorVendedor: 2662.5, metaFatGlobal: 11008 },
  { date: "2026-08-26", metaEquipe: 4438, metaPorVendedor: 2219, metaFatGlobal: 9362 },
  { date: "2026-08-27", metaEquipe: 3772, metaPorVendedor: 1886, metaFatGlobal: 8069 },
  { date: "2026-08-28", metaEquipe: 3328, metaPorVendedor: 1664, metaFatGlobal: 7134 },
  { date: "2026-08-29", metaEquipe: 1109, metaPorVendedor: 554.5, metaFatGlobal: 2678 },
  { date: "2026-08-30", metaEquipe: 665, metaPorVendedor: 332.5, metaFatGlobal: 1742 },
  { date: "2026-08-31", metaEquipe: 70000, metaPorVendedor: 35000, metaFatGlobal: 83384 },
];
