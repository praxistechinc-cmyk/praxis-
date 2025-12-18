import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  return NextResponse.json({ ok: true, userId });
}
