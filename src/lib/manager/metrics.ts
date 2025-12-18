import { Attempt } from "./mock";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function buildSummary(attempts: Attempt[]) {
  const totalAttempts = attempts.length;
  const activeReps = new Set(attempts.map(a => a.repId)).size;

  const avgScore =
    totalAttempts === 0 ? 0 : attempts.reduce((s, a) => s + a.score, 0) / totalAttempts;

  const scoreBuckets = {
    "0-49": 0,
    "50-69": 0,
    "70-84": 0,
    "85-100": 0,
  };

  for (const a of attempts) {
    if (a.score < 50) scoreBuckets["0-49"]++;
    else if (a.score < 70) scoreBuckets["50-69"]++;
    else if (a.score < 85) scoreBuckets["70-84"]++;
    else scoreBuckets["85-100"]++;
  }

  const tagCounts = new Map<string, number>();
  for (const a of attempts) {
    for (const t of a.failTags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const topFailTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }));

  // simple leading indicator: "readiness" from score + consistency
  const durations = attempts.map(a => a.durationSec);
  const avgDuration = durations.length ? durations.reduce((s, d) => s + d, 0) / durations.length : 0;

  const readiness = clamp(
    0.7 * avgScore + 0.3 * (avgDuration >= 90 ? 100 : (avgDuration / 90) * 100),
    0,
    100
  );

  return {
    totalAttempts,
    activeReps,
    avgScore: Math.round(avgScore * 10) / 10,
    scoreBuckets,
    topFailTags,
    readiness: Math.round(readiness),
  };
}

export function buildRepRows(attempts: Attempt[]) {
  const byRep = new Map<string, Attempt[]>();
  for (const a of attempts) {
    byRep.set(a.repId, [...(byRep.get(a.repId) ?? []), a]);
  }

  return [...byRep.entries()].map(([repId, repsAttempts]) => {
    const repName = repsAttempts[0]?.repName ?? "Unknown";
    const total = repsAttempts.length;
    const avg = repsAttempts.reduce((s, a) => s + a.score, 0) / total;

    const sorted = [...repsAttempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const delta = prev ? last.score - prev.score : 0;

    const tagCounts = new Map<string, number>();
    for (const a of repsAttempts) for (const t of a.failTags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      repId,
      repName,
      attempts: total,
      avgScore: Math.round(avg * 10) / 10,
      lastScore: last?.score ?? 0,
      trend: Math.round(delta),
      topIssue: topTag,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
}

export function buildTrend(attempts: Attempt[]) {
  // group by day
  const byDay = new Map<string, { sum: number; n: number }>();
  for (const a of attempts) {
    const day = a.createdAt.slice(0, 10); // YYYY-MM-DD
    const cur = byDay.get(day) ?? { sum: 0, n: 0 };
    cur.sum += a.score;
    cur.n += 1;
    byDay.set(day, cur);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ day, avgScore: Math.round((v.sum / v.n) * 10) / 10 }));
}
