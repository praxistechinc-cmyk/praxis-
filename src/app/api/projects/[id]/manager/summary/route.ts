import { NextResponse } from "next/server";
import { listAttempts } from "@/lib/data/store";
import { buildSummary, buildTrend } from "@/lib/manager/metrics";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const attempts = listAttempts(id);

  const summary = buildSummary(attempts);
  const trend = buildTrend(attempts);

  return NextResponse.json({
    projectId: id,
    summary,
    trend,
  });
}


