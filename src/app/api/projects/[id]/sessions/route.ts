import { NextResponse } from "next/server";
import { addSession, listSessions } from "@/lib/data/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessions = listSessions(id);
  return NextResponse.json({ ok: true, projectId: id, sessions });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  addSession({
    projectId: id,
    repId: String(body.repId ?? "rep_1"),
    repName: String(body.repName ?? "Rep"),
    startedAt: String(body.startedAt ?? new Date().toISOString()),
    endedAt: String(body.endedAt ?? new Date().toISOString()),
    rounds: Number(body.rounds ?? 5),
    sessionScore: Number(body.sessionScore ?? 0),
    topFailTags: Array.isArray(body.topFailTags) ? body.topFailTags : [],
  });

  return NextResponse.json({ ok: true });
}
