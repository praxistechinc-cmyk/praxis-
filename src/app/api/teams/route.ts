import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import {
  readDb,
  writeDb,
  uid,
  inviteCode,
  type Team,
  type TeamMember,
} from "@/lib/store";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();

  const myTeamIds = new Set(
    db.members.filter((m) => m.userId === userId).map((m) => m.teamId)
  );
  const teams = db.teams.filter((t) => myTeamIds.has(t.id));

  return NextResponse.json({ ok: true, teams });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "My Team").slice(0, 80);

  const db = await readDb();

  const team: Team = {
    id: uid("team"),
    name,
    inviteCode: inviteCode(),
    createdAt: new Date().toISOString(),
    createdByUserId: userId,
  };

  const member: TeamMember = {
    teamId: team.id,
    userId,
    role: "manager",
    displayName: "Manager",
    joinedAt: new Date().toISOString(),
  };

  db.teams.push(team);
  db.members.push(member);

  await writeDb(db);

  return NextResponse.json({ ok: true, team });
}
