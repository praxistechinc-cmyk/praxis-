import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { readDb, type TeamMember } from "@/lib/store";

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

  const member = db.members.find(
    (m: TeamMember) => m.teamId === teamId && m.userId === userId
  );

  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Not a member" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, member });
}
