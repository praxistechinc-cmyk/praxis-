import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, uid, type Session } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const userId = await getUserId();
  const db = await readDb();

  const me = db.members.find(m => m.teamId === teamId && m.userId === userId);
  if (!me) return NextResponse.json({ ok: false, error: "Not a member" }, { status: 403 });

  const sessions =
    me.role === "manager"
      ? db.sessions.filter(s => s.teamId === teamId)
      : db.sessions.filter(s => s.teamId === teamId && s.repUserId === userId);

  return NextResponse.json({ ok: true, sessions });
}

export async function POST(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const userId = await getUserId();
  const db = await readDb();

  const me = db.members.find(m => m.teamId === teamId && m.userId === userId);
  if (!me) return NextResponse.json({ ok: false, error: "Not a member" }, { status: 403 });
  if (me.role !== "rep") return NextResponse.json({ ok: false, error: "Reps only" }, { status: 403 });

  const body = await req.json();

  const s: Session = {
    id: uid("sess"),
    teamId,
    repUserId: userId,
    repName: String(body?.repName ?? me.displayName ?? "Rep"),
    startedAt: String(body?.startedAt),
    endedAt: String(body?.endedAt),
    rounds: Number(body?.rounds ?? 5),
    sessionScore: Number(body?.sessionScore ?? 0),
    topFailTags: Array.isArray(body?.topFailTags) ? body.topFailTags : [],
  };

  db.sessions.push(s);
  await writeDb(db);

  return NextResponse.json({ ok: true, session: s });
}
