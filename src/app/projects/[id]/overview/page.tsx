import { headers } from "next/headers";
import Link from "next/link";
import ActionCard from "@/components/ui/ActionCard";

async function getJson<T>(path: string): Promise<T> {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header.");

  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed fetch: ${url}`);
  return res.json();
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default async function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [summaryRes, sessionsRes, insightsRes] = await Promise.all([
    getJson<any>(`/api/projects/${id}/manager/summary`),
    getJson<any>(`/api/projects/${id}/sessions`),
    getJson<any>(`/api/projects/${id}/manager/insights`),
  ]);

  const summary = summaryRes.summary;
  const sessions = (sessionsRes?.sessions ?? []) as any[];
  const sessionsCount = sessions.length;

  const avgSessionScore =
    sessionsCount === 0
      ? 0
      : Math.round(
          (sessions.reduce((s: number, x: any) => s + Number(x.sessionScore ?? 0), 0) / sessionsCount) * 10
        ) / 10;

  const readiness = insightsRes.readiness ?? 0;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Project</div>
            <h1 className="text-2xl font-semibold">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Project {id} • Choose what you want to do next</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects" className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted">
              ← Projects
            </Link>
            <Link
              href={`/projects/${id}/practice`}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
            >
              Start session
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat label="Sessions" value={String(sessionsCount)} />
          <Stat label="Avg session" value={String(avgSessionScore)} />
          <Stat label="Attempts" value={String(summary.totalAttempts ?? 0)} />
          <Stat label="Avg score" value={String(summary.avgScore ?? 0)} />
          <Stat label="Readiness" value={`${readiness}%`} />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Practice session"
            description="Run a 5-round session, get graded each round, then save your session score."
            href={`/projects/${id}/practice`}
            cta="Start"
          />
          <ActionCard
            title="Rep dashboard"
            description="Simple daily view: focus, drill, and your personal stats."
            href={`/projects/${id}/rep`}
            cta="Open"
          />
          <ActionCard
            title="Manager dashboard"
            description="See sessions, coaching plans, trends, and who needs coaching today."
            href={`/projects/${id}/manager`}
            cta="Open"
          />
        </div>

        {/* Optional: quick note */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Operating principle</div>
          <div className="mt-2 text-sm text-muted-foreground">
            The goal isn’t to “practice more.” It’s to get reps to practice consistently and fix one thing per session.
          </div>
        </div>
      </div>
    </main>
  );
}
