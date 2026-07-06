export interface Sale {
  date: string; // ISO yyyy-mm-dd
  name: string;
  email: string;
  phone: string;
  product: string;
  value: number;
  expert: string;
  type: string;
  utmSource: string;
  utmCampaign: string;
  utmMedium: string;
  utmContent: string;
  utmTerm: string;
  dedupKey: string;
}
