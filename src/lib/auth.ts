import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "praxis_uid";

export async function getUserId() {
  const c = await cookies();
  let id = c.get(COOKIE)?.value;

  if (!id) {
    id = `u_${crypto.randomBytes(8).toString("hex")}`;
    c.set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
  }

  return id;
}
