import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, writeDb, type TeamMember } from "@/lib/store";

export async function POST(req: Request) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim().toUpperCase();
  const displayName = String(body?.displayName ?? "Rep").slice(0, 40);

  if (!code) return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });

  const db = await readDb();
  const team = db.teams.find(t => t.inviteCode === code);
  if (!team) return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 404 });

  const already = db.members.find(m => m.teamId === team.id && m.userId === userId);
  if (!already) {
    const member: TeamMember = {
      teamId: team.id,
      userId,
      role: "rep",
      displayName,
      joinedAt: new Date().toISOString(),
    };
    db.members.push(member);
    await writeDb(db);
  }

  return NextResponse.json({ ok: true, teamId: team.id });
}
