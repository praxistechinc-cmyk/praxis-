import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, uid, type Session } from "@/lib/store";

export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const teamId = String(params.teamId);

  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const db = await readDb();

  const me = db.members.find((m) => m.teamId === teamId && m.userId === userId);
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "Not a member" },
      { status: 403 }
    );
  }

  const sessions =
    me.role === "manager"
      ? db.sessions.filter((s) => s.teamId === teamId)
      : db.sessions.filter((s) => s.teamId === teamId && s.repUserId === userId);

  return NextResponse.json({ ok: true, sessions });
}

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const teamId = String(params.teamId);

  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const db = await readDb();

  const me = db.members.find((m) => m.teamId === teamId && m.userId === userId);
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "Not a member" },
      { status: 403 }
    );
  }
  if (me.role !== "rep") {
    return NextResponse.json(
      { ok: false, error: "Reps only" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const s: Session = {
    id: uid("sess"),
    teamId,
    repUserId: userId,
    repName: String((body as any)?.repName ?? me.displayName ?? "Rep"),
    startedAt: String((body as any)?.startedAt ?? new Date().toISOString()),
    endedAt: String((body as any)?.endedAt ?? ""),
    rounds: Number((body as any)?.rounds ?? 5),
    sessionScore: Number((body as any)?.sessionScore ?? 0),
    topFailTags: Array.isArray((body as any)?.topFailTags)
      ? (body as any).topFailTags
      : [],
  };

  db.sessions.push(s);
  await writeDb(db);

  return NextResponse.json({ ok: true, session: s });
}
