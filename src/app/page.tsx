"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    await refreshUser();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>PRAXIS</h1>

      {email ? (
        <>
          <p>Logged in as: {email}</p>
     <p>
      <a href="/projects">Go to Projects</a>
    </p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <p>
          <Link href="/login">Go to login</Link>
        </p>
      )}
    </main>
  );
}

