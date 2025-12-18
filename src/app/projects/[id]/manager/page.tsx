import { headers } from "next/headers";

import KpiCards from "@/components/manager/KpiCards";
import SessionsTable from "@/components/manager/SessionsTable";
import ScoreTrendChart from "@/components/manager/ScoreTrendChart";
import RepTable from "@/components/manager/RepTable";
import InsightPanel from "@/components/manager/InsightPanel";

async function getJson<T>(path: string): Promise<T> {
  const h = await headers();
  const host = h.get("host");

  if (!host) {
    throw new Error("Missing host header (cannot build absolute URL).");
  }

  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed fetch: ${url}`);
  return res.json();
}

export default async function ManagerDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = `/api/projects/${id}/manager`;

  const [{ summary, trend }, { reps }, insights, sessionsRes] = await Promise.all([
    getJson<any>(`${base}/summary`),
    getJson<any>(`${base}/reps`),
    getJson<any>(`${base}/insights`),
    getJson<any>(`/api/projects/${id}/sessions`),
  ]);

  const sessions = (sessionsRes?.sessions ?? []) as any[];
  const sessionsCount = sessions.length;
  const avgSessionScore =
    sessionsCount === 0
      ? 0
      : Math.round(
          (sessions.reduce((s: number, x: any) => s + Number(x.sessionScore ?? 0), 0) / sessionsCount) * 10
        ) / 10;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Project {id} • Levels 1–4</p>
        </div>
      </div>

      <KpiCards
        totalAttempts={summary.totalAttempts}
        activeReps={summary.activeReps}
        avgScore={summary.avgScore}
        readiness={insights.readiness}
        sessionsCount={sessionsCount}
        avgSessionScore={avgSessionScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreTrendChart trend={trend} />
        </div>

        <InsightPanel topFailTags={summary.topFailTags} actions={insights.actions} />
      </div>

      <RepTable reps={reps} />

      <SessionsTable sessions={sessions} />
    </div>
  );
}
