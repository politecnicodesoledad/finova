/**
 * Supabase client. Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * When they are missing the app keeps working in demo mode (localStorage),
 * so `supabase` is null and `isSupabaseConfigured` is false.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured && typeof window !== "undefined"
    ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;

export type DataMode = "supabase" | "demo";
export const dataMode: DataMode = isSupabaseConfigured ? "supabase" : "demo";
