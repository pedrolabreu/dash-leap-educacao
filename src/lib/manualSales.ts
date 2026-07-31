import type { Sale } from "./types";

/**
 * Sales confirmed as paid but not yet reflected in the "vendas" sheet tab —
 * added here so the dashboard counts them immediately. Delete an entry once
 * its row shows up in the sheet; isManualDuplicate() also drops it
 * automatically at that point so nothing double-counts if cleanup is late.
 */
export const MANUAL_SALES: Sale[] = [
  {
    date: "2026-07-31",
    name: "Adriana Souza",
    email: "",
    phone: "",
    product: "Mentoria Clavis",
    value: 4960.68,
    expert: "Não informado",
    type: "",
    utmSource: "",
    utmCampaign: "",
    utmMedium: "",
    utmContent: "",
    utmTerm: "",
    dedupKey: "manual-adriana-souza-2026-07-31",
  },
];

export function isManualDuplicate(manual: Sale, existing: Sale[]): boolean {
  return existing.some(
    (s) =>
      s.date === manual.date &&
      Math.abs(s.value - manual.value) < 0.01 &&
      s.name.trim().toLowerCase() === manual.name.trim().toLowerCase(),
  );
}
