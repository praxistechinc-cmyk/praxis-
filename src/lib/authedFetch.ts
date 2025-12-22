// src/lib/authedFetch.ts
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/**
 * fetch() wrapper that attaches Authorization: Bearer <access_token>
 * if a Supabase session exists in the browser.
 */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // If this ever runs on the server (build/SSR), just do a normal fetch.
  // authedFetch is intended for client-side usage.
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  const supabase = supabaseBrowser();

  const { data, error } = await supabase.auth.getSession();
  const token = error ? null : data.session?.access_token ?? null;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
