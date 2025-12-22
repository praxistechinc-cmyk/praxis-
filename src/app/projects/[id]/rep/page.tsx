import { headers } from "next/headers";
import Link from "next/link";

import RepKpis from "@/components/rep/RepKpis";
import TodaysFocus from "@/components/rep/TodaysFocus";

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

export default async function RepDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Reuse existing reps/coaching output for now
  const repsRes = await getJson<any>(`/api/projects/${id}/manager/reps`);
  const reps = repsRes.reps as any[];

  // Pick a “current rep” placeholder (later: auth user)
  const me = reps[0];

  const streak = 3;
  const attempts7d = me?.attempts ?? 0;
  const avgScore7d = me?.avgScore ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rep Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Project {id} • Simple daily execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${id}/overview`}
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted"
          >
            ← Project
          </Link>

          <Link
            href={`/projects/${id}/practice`}
            className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90"
          >
            Practice now
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <RepKpis
        streak={streak}
        attempts7d={attempts7d}
        avgScore7d={avgScore7d}
      />

      {/* Focus */}
      <TodaysFocus
        focus={me?.focus ?? "discovery"}
        drill={me?.drill ?? "Run today’s drill"}
        goal={me?.goal ?? "Increase your score by +10 this week"}
      />

      {/* Next steps */}
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="font-medium">Next steps</div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href={`/projects/${id}/practice`}
            className="rounded-xl border p-3 hover:bg-muted"
          >
            <div className="text-sm font-medium">Start a practice session</div>
            <div className="text-sm text-muted-foreground mt-1">
              5 rounds. One session score. Real progress.
            </div>
          </Link>

          <Link
            href={`/projects/${id}/manager`}
            className="rounded-xl border p-3 hover:bg-muted"
          >
            <div className="text-sm font-medium">View manager dashboard</div>
            <div className="text-sm text-muted-foreground mt-1">
              Transparency into sessions and coaching
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
