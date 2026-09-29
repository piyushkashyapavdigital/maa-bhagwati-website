import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";
const bucket =
  process.env.SUPABASE_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "Images";

export const isSupabaseConfigured = Boolean(url && key);

// Never throw at import time (Vercel without env vars would crash every
// route). Queries fail gracefully and callers fall back to local data.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
);
export const BUCKET = bucket;

export function publicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
