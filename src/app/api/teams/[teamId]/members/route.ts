import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const userId = await getUserId();

  const db = await readDb();
  const me = db.members.find(m => m.teamId === teamId && m.userId === userId);
  if (!me) return NextResponse.json({ ok: false, error: "Not a member" }, { status: 403 });
  if (me.role !== "manager") return NextResponse.json({ ok: false, error: "Managers only" }, { status: 403 });

  const reps = db.members
    .filter(m => m.teamId === teamId && m.role === "rep")
    .map(m => ({ userId: m.userId, displayName: m.displayName ?? "Rep", joinedAt: m.joinedAt }));

  return NextResponse.json({ ok: true, reps });
}
