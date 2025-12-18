import { Attempt } from "./mock";
import { DRILLS, Phase } from "./drills";

export type RepCoachingPlan = {
  repId: string;
  repName: string;
  focus: Phase;
  drillId: string;
  drillName: string;
  goal: string;
  why: string;
  impact: "High" | "Medium" | "Low";
};

function mostFrequent(items: string[]) {
  const m = new Map<string, number>();
  for (const x of items) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function avg(nums: number[]) {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

function pickFocusFromTags(tags: string[]): Phase {
  // ruthless priority: close > discovery > objection > opener
  if (tags.includes("no_close")) return "close";
  if (tags.includes("weak_discovery")) return "discovery";
  if (tags.includes("objection_handling")) return "objection";
  if (tags.includes("rapport")) return "opener";
  return "discovery";
}

function pickDrill(focus: Phase, topTag: string | null) {
  // try tag match first
  if (topTag) {
    const match = DRILLS.find((d) => d.triggers.failTags?.includes(topTag));
    if (match) return match;
  }
  // fallback to focus match
  return DRILLS.find((d) => d.focus === focus) ?? DRILLS[0];
}

export function buildCoachingPlans(attempts: Attempt[], windowN = 20): RepCoachingPlan[] {
  const byRep = new Map<string, Attempt[]>();
  for (const a of attempts) byRep.set(a.repId, [...(byRep.get(a.repId) ?? []), a]);

  const plans: RepCoachingPlan[] = [];

  for (const [repId, repAttempts] of byRep.entries()) {
    const repName = repAttempts[0]?.repName ?? "Unknown";
    const sorted = [...repAttempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const recent = sorted.slice(-windowN);

    const recentScores = recent.map((a) => a.score);
    const last5 = recent.slice(-5).map((a) => a.score);
    const prev5 = recent.slice(-10, -5).map((a) => a.score);

    const trend = avg(last5) - avg(prev5);

    const allTags = recent.flatMap((a) => a.failTags);
    const topTag = mostFrequent(allTags);

    const focus = pickFocusFromTags(allTags);
    const drill = pickDrill(focus, topTag);

    const scoreNow = Math.round(avg(recentScores));
    const target = Math.min(100, scoreNow + 10);

    const impact: "High" | "Medium" | "Low" =
      trend < -3 || scoreNow < 60 ? "High" : scoreNow < 75 ? "Medium" : "Low";

    const why = topTag
      ? `Most common issue is "${topTag}".`
      : "Not enough tag data—defaulting to most likely bottleneck.";

    const goal =
      focus === "close"
        ? `Raise close effectiveness: score ${scoreNow} → ${target} by running "${drill.name}" daily.`
        : focus === "discovery"
          ? `Improve discovery depth: score ${scoreNow} → ${target} by running "${drill.name}" daily.`
          : focus === "objection"
            ? `Tighten objection handling: score ${scoreNow} → ${target} by running "${drill.name}" daily.`
            : `Improve opener/rapport: score ${scoreNow} → ${target} by running "${drill.name}" daily.`;

    plans.push({
      repId,
      repName,
      focus,
      drillId: drill.id,
      drillName: drill.name,
      goal,
      why,
      impact,
    });
  }

  // Sort: highest urgency first
  return plans.sort((a, b) => {
    const rank = (x: RepCoachingPlan) => (x.impact === "High" ? 3 : x.impact === "Medium" ? 2 : 1);
    return rank(b) - rank(a);
  });
}
