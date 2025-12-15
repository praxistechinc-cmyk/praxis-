"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase...");

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setStatus("ERROR: " + error.message);
      else setStatus("Connected ✅ session=" + (data.session ? "yes" : "no"));
    });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>PRAXIS</h1>
      <p>{status}</p>
    </main>
  );
}

