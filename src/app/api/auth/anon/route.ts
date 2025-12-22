import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  return NextResponse.json({ ok: true, userId });
}
