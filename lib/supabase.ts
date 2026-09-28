import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SECRET_KEY!;
const bucket = process.env.SUPABASE_BUCKET ?? "Images";

export const supabase = createClient(url, key);
export const BUCKET = bucket;

export function publicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
