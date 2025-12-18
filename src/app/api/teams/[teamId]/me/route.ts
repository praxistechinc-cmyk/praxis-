import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const userId = await getUserId();

  const db = await readDb();
  const member = db.members.find(m => m.teamId === teamId && m.userId === userId);
  if (!member) return NextResponse.json({ ok: false, error: "Not a member" }, { status: 403 });

  const team = db.teams.find(t => t.id === teamId);
  if (!team) return NextResponse.json({ ok: false, error: "Team not found" }, { status: 404 });

  return NextResponse.json({ ok: true, team, member });
}
