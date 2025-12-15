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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params.id), [params.id]);

  const [scriptText, setScriptText] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setSubmissions((data as Submission[]) ?? []);
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
    loadSubmissions();
  }

  useEffect(() => {
    loadSubmissions();
  }, [projectId]);

  return (
    <main style={{ padding: 24, maxWidth: 820 }}>
      <p>
        <Link href="/projects">← Back to Projects</Link>
      </p>

      <h1>Project</h1>
      <p>Project ID: {projectId}</p>

      <section style={{ marginTop: 24 }}>
        <h2>New submission</h2>
        <textarea
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Paste your script here..."
          style={{ width: "100%", minHeight: 140, padding: 10 }}
        />
        <button onClick={createSubmission} style={{ marginTop: 10 }}>
          Save submission
        </button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Submissions</h2>
        <ul>
          {submissions.map((s) => (
            <li key={s.id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{new Date(s.created_at).toLocaleString()}</strong>
              </div>
              <pre style={{ whiteSpace: "pre-wrap" }}>{s.script_text}</pre>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
