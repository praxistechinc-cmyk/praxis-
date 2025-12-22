// src/lib/supabaseBrowser.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser-only Supabase client singleton.
 * If env vars aren't available at build/SSR time, it stays null.
 */
export const supabaseBrowser =
  url && anon ? createClient(url, anon) : null;
