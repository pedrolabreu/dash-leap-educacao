import { createClient } from "@supabase/supabase-js";

/**
 * Returns null (rather than throwing) when the env vars aren't set, so
 * callers can fall back to the Sheets-based source during the transition.
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
