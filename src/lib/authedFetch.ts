import { supabaseBrowser } from "@/lib/supabaseBrowser";

/**
 * fetch() wrapper that automatically attaches
 * Authorization: Bearer <access_token>
 * for authenticated API route calls.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const { data, error } = await supabaseBrowser.auth.getSession();

  if (error) {
    console.warn("authedFetch: failed to get session", error);
  }

  const token = data.session?.access_token;

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
