import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, type TeamMember } from "@/lib/store";

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const code = String((body as any)?.code ?? "").trim();
  const displayName = String((body as any)?.displayName ?? "Rep").slice(0, 80);

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing invite code" }, { status: 400 });
  }

  const db = await readDb();
  const team = db.teams.find((t) => t.inviteCode === code);

  if (!team) {
    return NextResponse.json({ ok: false, error: "Invalid invite code" }, { status: 404 });
  }

  const already = db.members.find((m) => m.teamId === team.id && m.userId === userId);
  if (already) {
    return NextResponse.json({ ok: true, team });
  }

  const member: TeamMember = {
    teamId: team.id,
    userId, // ✅ guaranteed string
    role: "rep",
    displayName,
    joinedAt: new Date().toISOString(),
  };

  db.members.push(member);
  await writeDb(db);

  return NextResponse.json({ ok: true, team });
}
