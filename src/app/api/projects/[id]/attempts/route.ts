import { NextResponse } from "next/server";
import { addAttempt, listAttempts } from "@/lib/data/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempts = listAttempts(id);
  return NextResponse.json({ ok: true, projectId: id, attempts });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  addAttempt({
    projectId: id,
    repId: String(body.repId ?? "rep_1"),
    repName: String(body.repName ?? "Rep"),
    createdAt: String(body.createdAt ?? new Date().toISOString()),
    market: String(body.market ?? "d2d_pest"),
    scenarioId: String(body.scenarioId ?? "unknown"),
    score: Number(body.score ?? 0),
    failTags: Array.isArray(body.failTags) ? body.failTags.map(String) : [],
    durationSec: Number(body.durationSec ?? 0),
  });

  return NextResponse.json({ ok: true });
}
