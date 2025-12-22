"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authedFetch } from "@/lib/authedFetch";


type BehaviorChecks = {
  acknowledged_objection?: boolean;
  asked_clarifying_question?: boolean;
  named_specific_pest_or_risk?: boolean;
  explained_value_in_homeowner_terms?: boolean;
  built_trust_process_or_credibility?: boolean;
  attempted_close_next_step?: boolean;
  kept_under_20_seconds?: boolean;
};

type PrimaryFailure = {
  code?:
    | "no_isolation"
    | "no_close"
    | "too_generic"
    | "too_wordy"
    | "low_trust"
    | "weak_tone";
  why_it_matters?: string;
  what_to_do_instead?: string;
};

type GradeResult = {
  overall_score?: number; // 0-100
  behavior_checks?: BehaviorChecks;
  primary_failure?: PrimaryFailure;
  one_action_fix?: { instruction?: string; example_line?: string };
  point_losses?: Array<{ dimension: string; lost: number; reason: string }>;
  rewrite?: { rep_response_v1?: string };
  variation_seed?: string;
};

const OBJECTION_TEXT: Record<string, string> = {
  dont_need: "I don't need pest control.",
  too_expensive: "It's too expensive.",
  already_have: "We already have a pest control company.",
  need_to_think: "I need to think about it.",
};

const OBJECTION_IDS = Object.keys(OBJECTION_TEXT) as Array<
  keyof typeof OBJECTION_TEXT
>;

const PRIMARY_FAILURE_LABEL: Record<string, string> = {
  no_isolation: "You didn’t isolate the real objection.",
  no_close: "You didn’t ask for a next step (no close).",
  too_generic: "You sounded generic (no homeowner-specific value).",
  too_wordy: "You rambled (too long / unclear).",
  low_trust: "You didn’t build trust (no process/credibility).",
  weak_tone: "Your tone felt weak or uncertain.",
};

function avg(nums: number[]) {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

function countTags(all: string[]) {
  const m = new Map<string, number>();
  for (const t of all) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
}

export default function PracticePage() {
  const params = useParams();
  const projectId = useMemo(() => String(params.id), [params.id]);

  // Fake identity for now (later: auth)
  const repId = "rep_1";
  const repName = "Rep";

  const ROUNDS = 5;

  const [round, setRound] = useState(0); // 0..4
  const [scenarioId, setScenarioId] = useState<keyof typeof OBJECTION_TEXT>(
    OBJECTION_IDS[0]
  );
  const [repResponse, setRepResponse] = useState("");
  const [busy, setBusy] = useState(false);

  const [saving, setSaving] = useState(false);
  const [reward, setReward] = useState<null | { sessionScore: number; topFailTags: { tag: string; count: number }[] }>(
    null
  );

  const [results, setResults] = useState<
    Array<{ scenarioId: string; response: string; grade: GradeResult; ms: number }>
  >([]);

  const sessionStartedAtRef = useRef<string>(new Date().toISOString());
  const roundStartMsRef = useRef<number>(Date.now());

  const isDone = results.length >= ROUNDS;
  const progressPct = Math.round(
    (Math.min(results.length, ROUNDS) / ROUNDS) * 100
  );

  async function postAttempt(payload: any) {
    await authedFetch(`/api/teams/${projectId}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function postSession(payload: any) {
  await authedFetch(`/api/teams/${projectId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

  async function gradeRound() {
    const trimmed = repResponse.trim();
    if (!trimmed) return alert("Write your response first.");

    const context =
      "D2D pest control at a homeowner’s door. Goal: close the sale for pest control service today (or schedule the first service with commitment). Keep it short, confident, and homeowner-aligned. Handle objections ethically. Build trust by explaining the process clearly. End with a clear close.";

    setBusy(true);
    try {
      const startMs = roundStartMsRef.current;
      const durationSec = Math.max(
        1,
        Math.round((Date.now() - startMs) / 1000)
      );

      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          objection: OBJECTION_TEXT[scenarioId],
          repResponse: trimmed,
          seed: `${projectId}-${repId}-${Date.now()}`,
        }),
      });

      const json = await res.json();
      if (!json?.ok) return alert(json?.error || JSON.stringify(json, null, 2));

      const rawGrade = json.result as GradeResult;

const safeGrade: GradeResult = {
  overall_score: Number(rawGrade?.overall_score ?? 0),
  behavior_checks: rawGrade?.behavior_checks ?? {},
  primary_failure: rawGrade?.primary_failure ?? {},
  one_action_fix: rawGrade?.one_action_fix ?? {},
  point_losses: rawGrade?.point_losses ?? [],
  rewrite: rawGrade?.rewrite ?? {},
  variation_seed: rawGrade?.variation_seed,
};


      const failTags: string[] = [];
      const code = safeGrade.primary_failure?.code;
      if (code) failTags.push(code);

      // Save attempt immediately (manager sees it instantly)
      await postAttempt({
        repId,
        repName,
        createdAt: new Date().toISOString(),
        market: "d2d_pest",
        scenarioId,
        score: Number(safeGrade.overall_score ?? 0),
        failTags,
        durationSec,
      });

      setResults((prev) => [
        ...prev,
        {
          scenarioId: String(scenarioId),
          response: trimmed,
          grade: safeGrade,
          ms: Date.now() - startMs,
        },
      ]);

      // Prep next round UI
      setRepResponse("");
      roundStartMsRef.current = Date.now();

      // Pick next scenario (simple rotation / variety)
      const next = OBJECTION_IDS[(round + 1) % OBJECTION_IDS.length];
      setScenarioId(next);
      setRound((r) => Math.min(r + 1, ROUNDS - 1));
    } finally {
      setBusy(false);
    }
  }

  async function finishSession() {
    const scores = results.map((r) => Number(r.grade.overall_score ?? 0));
    const sessionScore = Math.round(avg(scores));
    const tags = results.flatMap((r) =>
      r.grade.primary_failure?.code ? [r.grade.primary_failure.code] : []
    );
    const topFailTags = countTags(tags);

    setSaving(true);
    try {
      await postSession({
        repId,
        repName,
        startedAt: sessionStartedAtRef.current,
        endedAt: new Date().toISOString(),
        rounds: ROUNDS,
        sessionScore,
        topFailTags,
      });

      // ✅ Reward screen instead of alert
      setReward({ sessionScore, topFailTags });
    } finally {
      setSaving(false);
    }
  }

  function resetSession() {
    sessionStartedAtRef.current = new Date().toISOString();
    roundStartMsRef.current = Date.now();
    setRound(0);
    setScenarioId(OBJECTION_IDS[0]);
    setRepResponse("");
    setResults([]);
  }

  const last = results[results.length - 1];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Session Practice</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ROUNDS} rounds • Grade each rep • Get a session score
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted"
            >
              ← Projects
            </Link>

            <Link
              href={`/projects/${projectId}`}
              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted"
            >
              ← Project
            </Link>

            <Link
              href={`/projects/${projectId}/manager`}
              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted"
            >
              Manager view
            </Link>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold">
              Progress: {Math.min(results.length + 1, ROUNDS)}/{ROUNDS}
            </div>
            <div className="text-xs text-muted-foreground">
              Project {projectId} • Rep {repName}
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gray-900"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: Current round */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Round</div>
                <div className="text-lg font-semibold">
                  {Math.min(results.length + 1, ROUNDS)}
                </div>
              </div>

              <button
                onClick={resetSession}
                className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-muted"
              >
                Reset session
              </button>
            </div>

            <div className="rounded-xl border bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Homeowner says</div>
              <div className="mt-1 text-sm font-medium">
                {OBJECTION_TEXT[scenarioId]}
              </div>
            </div>

            <label className="text-sm font-medium">Your response</label>
            <textarea
              value={repResponse}
              onChange={(e) => setRepResponse(e.target.value)}
              placeholder="acknowledge → clarify → value → close"
              className="w-full min-h-[180px] rounded-xl border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              disabled={busy || isDone}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={gradeRound}
                disabled={busy || isDone}
                className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm ${
                  busy || isDone
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gray-900 text-white hover:bg-black"
                }`}
              >
                {busy ? "Grading..." : isDone ? "Session complete" : "Submit + Grade"}
              </button>

              {isDone ? (
                <button
                  onClick={finishSession}
                  disabled={saving}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm ${
                    saving ? "bg-gray-400" : "bg-black hover:opacity-90"
                  }`}
                >
                  {saving ? "Saving..." : "Save session"}
                </button>
              ) : null}
            </div>

            {isDone ? (
              <div className="rounded-xl border bg-muted/40 p-3 text-sm">
                Session done. Hit <span className="font-semibold">Save session</span>{" "}
                to push summary to managers.
              </div>
            ) : null}
          </section>

          {/* RIGHT: Feedback + session recap */}
          <section className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold">Latest feedback</div>

              {!last ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  Submit your first round to get feedback.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-semibold">
                      Score{" "}
                      <span className="text-2xl">
                        {last.grade.overall_score ?? "—"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {last.scenarioId}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/40 p-4">
                    <div className="text-xs text-muted-foreground">
                      Primary failure
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      {last.grade.primary_failure?.code
                        ? PRIMARY_FAILURE_LABEL[last.grade.primary_failure.code] ??
                          last.grade.primary_failure.code
                        : "—"}
                    </div>
                    {last.grade.one_action_fix?.instruction ? (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Fix:</span>{" "}
                        {last.grade.one_action_fix.instruction}
                      </div>
                    ) : null}
                    {last.grade.one_action_fix?.example_line ? (
                      <div className="mt-2 rounded-xl bg-white p-3 text-sm italic">
                        “{last.grade.one_action_fix.example_line}”
                      </div>
                    ) : null}
                  </div>

                  <details className="rounded-xl border p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Show rewrite
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm">
                      {last.grade.rewrite?.rep_response_v1 ?? "—"}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold">Session recap</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {results.length}/{ROUNDS} rounds completed
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Avg score</div>
                  <div className="mt-1 text-xl font-semibold">
                    {results.length
                      ? Math.round(
                          avg(results.map((r) => Number(r.grade.overall_score ?? 0)))
                        )
                      : "—"}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="mt-1 text-xl font-semibold">{results.length}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {results.slice(0, 5).map((r, i) => (
                  <div
                    key={`${r.scenarioId}-${i}`}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm"
                  >
                    <div className="text-muted-foreground">Round {i + 1}</div>
                    <div className="font-semibold">
                      {Number(r.grade.overall_score ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ✅ Reward Screen */}
      {reward ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-3xl bg-white border shadow-xl p-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Session complete</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">
                {reward.sessionScore}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Session score</div>
            </div>

            <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
              <div className="text-sm font-semibold">Top issues to fix</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(reward.topFailTags ?? []).length ? (
                  reward.topFailTags.slice(0, 3).map((t) => (
                    <span
                      key={t.tag}
                      className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium"
                    >
                      {t.tag.replaceAll("_", " ")} • {t.count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No major issues detected.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setReward(null);
                  resetSession();
                }}
                className="rounded-2xl bg-black text-white px-4 py-3 text-sm font-medium hover:opacity-90"
              >
                Run another session
              </button>

              <Link
                href={`/projects/${projectId}`}
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-center hover:bg-muted"
              >
                Back to Project
              </Link>

              <Link
                href={`/projects/${projectId}/overview`}
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-center hover:bg-muted"
              >
                Overview
              </Link>

              <Link
                href={`/projects/${projectId}/manager`}
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-center hover:bg-muted"
              >
                Manager
              </Link>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Don’t overthink it. Finish sessions. Fix one thing.
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
