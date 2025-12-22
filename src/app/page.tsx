import Link from "next/link";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">Praxis</div>
          <div className="flex items-center gap-3">
            <Link href="/projects" className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted">
              Projects
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge>Sessions</Badge>
              <Badge>Coaching Plans</Badge>
              <Badge>Manager Visibility</Badge>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Train reps like it’s a sport.
              <span className="block text-muted-foreground">Fast sessions. Clear feedback. Real coaching.</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-xl">
              Reps run short sessions, get graded on every round, and fix one thing at a time. Managers see sessions,
              trends, and exactly who needs coaching today.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90"
              >
                Enter app
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:bg-muted"
              >
                How it works
              </a>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              Tip: Keep sessions short. Consistency beats intensity.
            </div>
          </div>

          {/* Right: “official” card */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">What reps do</div>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border p-4">
                <div className="font-medium text-gray-900">1) Run a 5-round session</div>
                <div className="mt-1">Quick scenarios. Instant grading. No fluff.</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-medium text-gray-900">2) Fix one thing</div>
                <div className="mt-1">Primary failure + one action fix. Then repeat.</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-medium text-gray-900">3) Build proof</div>
                <div className="mt-1">Sessions + scores create real training evidence.</div>
              </div>
            </div>

            <div id="how-it-works" className="mt-6 rounded-2xl bg-muted/40 p-4">
              <div className="text-sm font-semibold">What managers get</div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Sessions completed (who’s actually training)</li>
                <li>• Coaching plans (who to coach today)</li>
                <li>• Trends (who’s improving vs slipping)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          Praxis • Training system for reps and managers
        </div>
      </div>
    </main>
  );
}
