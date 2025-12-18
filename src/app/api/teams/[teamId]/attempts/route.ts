import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, uid, type Attempt } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const userId = await getUserId();
  const db = await readDb();

  const me = db.members.find(m => m.teamId === teamId && m.userId === userId);
  if (!me) return NextResponse.json({ ok: false, error: "Not a member" }, { status: 403 });
  if (me.role !== "rep") return NextResponse.json({ ok: false, error: "Reps only" }, { status: 403 });

  const body = await req.json();

  const a: Attempt = {
    id: uid("att"),
    teamId,
    repUserId: userId,
    repName: String(body?.repName ?? me.displayName ?? "Rep"),
    createdAt: String(body?.createdAt ?? new Date().toISOString()),
    market: String(body?.market ?? "d2d_pest"),
    scenarioId: String(body?.scenarioId ?? "unknown"),
    score: Number(body?.score ?? 0),
    failTags: Array.isArray(body?.failTags) ? body.failTags : [],
    durationSec: Number(body?.durationSec ?? 0),
  };

  db.attempts.push(a);
  await writeDb(db);

  return NextResponse.json({ ok: true, attempt: a });
}
