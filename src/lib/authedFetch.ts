// src/lib/authedFetch.ts
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/**
 * fetch() wrapper that attaches Authorization: Bearer <access_token>
 * if a Supabase session exists in the browser.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  // Server/build/SSR: never touch browser Supabase client
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // If env isn't present, just proceed without auth header
  if (!supabaseBrowser) {
    return fetch(input, { ...init, headers });
  }

  const { data, error } = await supabaseBrowser.auth.getSession();
  const token = error ? null : data.session?.access_token ?? null;

  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
