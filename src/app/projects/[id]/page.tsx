"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Submission = {
  id: string;
  script_text: string;
  created_at: string;
};

type Analysis = {
  submission_id: string;
  score: number | null;
  objection_type: string | null;
  issues: string[] | null;
  rewrite: string | null;
  followups: string[] | null;
  drill: string | null;
  created_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params.id), [params.id]);

  const [scriptText, setScriptText] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analysesBySubmissionId, setAnalysesBySubmissionId] = useState<Record<string, Analysis>>(
    {}
  );
  const [loadingAnalyze, setLoadingAnalyze] = useState<Record<string, boolean>>({});

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setSubmissions((data as Submission[]) ?? []);
  }

  async function loadAnalyses() {
    const { data: subs, error: sErr } = await supabase
      .from("submissions")
      .select("id")
      .eq("project_id", projectId);

    if (sErr) return alert(sErr.message);
    const ids = (subs ?? []).map((x) => x.id);
    if (ids.length === 0) {
      setAnalysesBySubmissionId({});
      return;
    }

    const { data: analyses, error: aErr } = await supabase
      .from("analyses")
      .select("*")
      .in("submission_id", ids);

    if (aErr) return alert(aErr.message);

    const map: Record<string, Analysis> = {};
    (analyses ?? []).forEach((a: any) => {
      map[a.submission_id] = a as Analysis;
    });
    setAnalysesBySubmissionId(map);
  }

  async function createSubmission() {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return alert("Not logged in");

    const trimmed = scriptText.trim();
    if (!trimmed) return alert("Paste a script first.");

    const { error } = await supabase.from("submissions").insert({
      user_id: user.id,
      project_id: projectId,
      script_text: trimmed,
    });

    if (error) return alert(error.message);

    setScriptText("");
    await loadSubmissions();
    await loadAnalyses();
  }

  async function analyzeSubmission(submissionId: string) {
    setLoadingAnalyze((p) => ({ ...p, [submissionId]: true }));
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) return alert("No session token. Try logging in again.");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submissionId }),
      });

  const json = await res.json();
if (!res.ok) return alert(JSON.stringify(json, null, 2));


      await loadAnalyses();
    } finally {
      setLoadingAnalyze((p) => ({ ...p, [submissionId]: false }));
    }
  }

  useEffect(() => {
    (async () => {
      await loadSubmissions();
      await loadAnalyses();
    })();
  }, [projectId]);

  return (
    <main style={{ padding: 24, maxWidth: 920 }}>
      <p>
        <Link href="/projects">← Back to Projects</Link>
      </p>

      <h1>Project</h1>
      <p style={{ opacity: 0.7 }}>Project ID: {projectId}</p>

      <section style={{ marginTop: 24 }}>
        <h2>New submission</h2>
        <textarea
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Paste your objection response script here..."
          style={{ width: "100%", minHeight: 140, padding: 10 }}
        />
        <button onClick={createSubmission} style={{ marginTop: 10 }}>
          Save submission
        </button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Submissions</h2>

        {submissions.length === 0 ? <p>No submissions yet.</p> : null}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {submissions.map((s) => {
            const a = analysesBySubmissionId[s.id];
            const busy = !!loadingAnalyze[s.id];

            return (
              <li
                key={s.id}
                style={{
                  marginBottom: 28,
                  paddingBottom: 18,
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{new Date(s.created_at).toLocaleString()}</strong>
                  <button onClick={() => analyzeSubmission(s.id)} disabled={busy}>
                    {busy ? "Analyzing..." : a ? "Re-analyze" : "Analyze"}
                  </button>
                </div>

                <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{s.script_text}</pre>

                {a ? (
                  <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <strong>Score:</strong> {a.score ?? "—"}
                      </div>
                      <div>
                        <strong>Objection:</strong> {a.objection_type ?? "—"}
                      </div>
                      <div>
                        <strong>Analyzed:</strong> {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Top issues</strong>
                      <ul>
                        {(a.issues ?? []).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Rewrite</strong>
                      <pre style={{ whiteSpace: "pre-wrap" }}>{a.rewrite ?? ""}</pre>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Follow-ups</strong>
                      <ul>
                        {(a.followups ?? []).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Drill</strong>
                      <p>{a.drill ?? ""}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ marginTop: 10, opacity: 0.7 }}>
                    No analysis yet. Click <strong>Analyze</strong>.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
