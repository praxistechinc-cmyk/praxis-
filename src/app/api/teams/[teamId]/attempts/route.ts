import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, uid } from "@/lib/store";

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

  // Managers see all attempts; reps see only their own
  const attempts =
    me.role === "manager"
      ? db.attempts?.filter((a: any) => a.teamId === teamId) ?? []
      : db.attempts?.filter((a: any) => a.teamId === teamId && a.repUserId === userId) ?? [];

  return NextResponse.json({ ok: true, attempts });
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

  const body = await req.json().catch(() => ({}));

  const attempt = {
    id: uid("att"),
    teamId,
    repUserId: userId,
    createdAt: new Date().toISOString(),
    ...(body as any),
  };

  (db as any).attempts = Array.isArray((db as any).attempts) ? (db as any).attempts : [];
  (db as any).attempts.push(attempt);

  await writeDb(db);

  return NextResponse.json({ ok: true, attempt });
}
