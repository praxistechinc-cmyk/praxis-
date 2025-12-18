import { NextResponse } from "next/server";
import { listAttempts } from "@/lib/data/store";
import { buildRepRows } from "@/lib/manager/metrics";
import { buildCoachingPlans } from "@/lib/manager/coaching";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const attempts = listAttempts(id);

  const reps = buildRepRows(attempts);
  const plans = buildCoachingPlans(attempts, 20);

  const planByRep = new Map(plans.map((p) => [p.repId, p]));

  const repsWithCoaching = reps.map((r) => {
    const p = planByRep.get(r.repId);
    return {
      ...r,
      focus: p?.focus ?? null,
      drill: p?.drillName ?? null,
      goal: p?.goal ?? null,
      impact: p?.impact ?? null,
    };
  });

  return NextResponse.json({
    projectId: id,
    reps: repsWithCoaching,
  });
}
