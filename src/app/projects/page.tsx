"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setProjects(data ?? []);
  }

  async function createProject() {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return alert("Not logged in");

    const trimmed = name.trim();
    if (!trimmed) return;

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: trimmed,
    });

    if (error) return alert(error.message);

    setName("");
    loadProjects();
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Projects</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={createProject}>Create</button>
      </div>

      <ul style={{ marginTop: 24 }}>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 10 }}>
            <Link href={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
