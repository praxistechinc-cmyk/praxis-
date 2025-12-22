import { createClient } from "@supabase/supabase-js";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Server-only admin client (service role). Never use in the browser.
 */
export function supabaseAdmin() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

/**
 * Reads Authorization: Bearer <token> and returns the user id, or null.
 * Use this in Next.js route handlers.
 */
export async function getUserId(req: Request): Promise<string | null> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

  if (!token) return null;

  const supabase = createClient(url, anon);
  const { data, error } = await supabase.auth.getUser(token);

  if (error) return null;
  return data.user?.id ?? null;
}
