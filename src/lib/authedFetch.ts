"use client";

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
  // If this ever runs on the server (SSR/build), do a normal fetch.
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token ?? null;

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
