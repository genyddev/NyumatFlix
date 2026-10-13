import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import { getSupabaseEnvironment } from "./config";

export function createPublicSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnvironment();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
