import { NextResponse } from "next/server";
import { listAttempts } from "@/lib/data/store";
import { buildSummary } from "@/lib/manager/metrics";
import { buildCoachingPlans } from "@/lib/manager/coaching";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 🔑 REAL DATA (from rep sessions)
  const attempts = listAttempts(id);

  const { readiness, topFailTags } = buildSummary(attempts);

  const plans = buildCoachingPlans(attempts, 20);

  // Team-level coaching actions (top 3 highest-impact reps)
  const actions = plans.slice(0, 3).map((p) => ({
    repId: p.repId,
    repName: p.repName,
    issue: p.focus,
    recommendation: `Run "${p.drillName}" today (${p.impact} impact).`,
    goal: p.goal,
    why: p.why,
    impact: p.impact,
  }));

  return NextResponse.json({
    projectId: id,
    readiness,
    topFailTags,
    actions,
    plans,
  });
}
