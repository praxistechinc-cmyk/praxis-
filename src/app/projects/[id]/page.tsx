"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

function Logo() {
  return (
    <div className="text-center">
      <div className="text-4xl font-semibold tracking-tight">PRAXIS</div>
      <div className="mt-2 text-sm text-muted-foreground">
        Training system for reps and managers
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = String(params.id);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6 px-6">
        {/* Logo */}
        <Logo />

        {/* Primary actions */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href={`/projects/${projectId}/overview`}
            className="rounded-2xl border bg-white p-5 shadow-sm hover:bg-muted/30"
          >
            <div className="text-sm font-semibold">Overview</div>
            <div className="mt-1 text-sm text-muted-foreground">
              See stats, sessions, and where to go next.
            </div>
          </Link>

          <Link
            href={`/projects/${projectId}/practice`}
            className="rounded-2xl bg-black p-5 text-white shadow-sm hover:opacity-90"
          >
            <div className="text-sm font-semibold">Practice session</div>
            <div className="mt-1 text-sm text-white/70">
              5 rounds • graded each round • session score at the end
            </div>
          </Link>
        </div>

        {/* Footer hint */}
        <div className="text-center text-xs text-muted-foreground">
          Tip: practice works best when you finish the full session.
        </div>

        {/* Back link */}
        <div className="pt-4 text-center">
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-gray-900"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
