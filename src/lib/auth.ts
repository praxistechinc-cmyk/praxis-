import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function supabaseServer() {
  const store = await cookies();

  // Make the cookie adapter match whatever overload TS picks.
  const cookieAdapter = {
    getAll() {
      return store.getAll().map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(cookiesToSet: any[]) {
      for (const c of cookiesToSet) {
        // c.options comes from Supabase types (SerializeOptions-ish), including sameSite: false sometimes.
        store.set({ name: c.name, value: c.value, ...(c.options || {}) } as any);
      }
    },
  } as any;

  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: cookieAdapter,
    } as any
  );
}

export function supabaseAdmin() {
  return createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

export async function getUserId(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

