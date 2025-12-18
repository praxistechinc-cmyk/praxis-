import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AnalyzeRequest = { submissionId: string; market?: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client bypasses RLS; we enforce ownership manually
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE);
// Auth client verifies user token
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY not set" },
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
    }

    const body = (await req.json()) as AnalyzeRequest;
    if (!body?.submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    // 1) Verify user from token
    const { data: userRes, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = userRes.user.id;

    // 2) Load submission and enforce ownership
    const { data: submission, error: subErr } = await supabaseAdmin
      .from("submissions")
      .select("id, user_id, script_text")
      .eq("id", body.submissionId)
      .single();

    if (subErr || !submission) {
      return NextResponse.json(
        {
          error: "Submission not found",
          submissionId: body.submissionId,
          supabaseError: subErr?.message ?? null,
        },
        { status: 404 }
      );
    }

    if (submission.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const script = submission.script_text as string;
// STEP B: Load market prompt preset
const market = body.market || "d2d_pest";

const { data: preset, error: presetErr } = await supabaseAdmin
  .from("prompt_presets")
  .select("instructions, rules")
  .eq("market_slug", market)
  .single();

if (presetErr || !preset) {
  return NextResponse.json(
    { error: "Missing prompt preset", market },
    { status: 500 }
  );
}


    // 3) Call OpenAI and force JSON schema via Responses API text.format
    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
     instructions: preset.instructions,

input: `Return ONLY JSON that matches the required schema.

Market rules:
${preset.rules}

Rep response:
"""${script}"""`,



      text: {
        format: {
          type: "json_schema",
          name: "praxis_objection_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "number" },
              objection_type: { type: "string" },
              issues: { type: "array", items: { type: "string" }, maxItems: 3 },
              rewrite: { type: "string" },
              followups: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 2,
              },
              drill: { type: "string" },
            },
            required: ["score", "objection_type", "issues", "rewrite", "followups", "drill"],
          },
        },
      },
    });

    const raw = resp.output_text?.trim() || "";
    let analysis: any;

    try {
      analysis = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON", raw }, { status: 500 });
    }

    // 4) Save (upsert) analysis for this submission
    const { error: upsertErr } = await supabaseAdmin
      .from("analyses")
      .upsert(
        {
          user_id: userId,
          submission_id: submission.id,
          model: "gpt-4.1-mini",
          score: Math.max(0, Math.min(100, Math.round(Number(analysis.score ?? 0)))),
          objection_type: String(analysis.objection_type ?? ""),
          issues: Array.isArray(analysis.issues) ? analysis.issues : [],
          rewrite: String(analysis.rewrite ?? ""),
          followups: Array.isArray(analysis.followups) ? analysis.followups : [],
          drill: String(analysis.drill ?? ""),
        },
        { onConflict: "submission_id" }
      );

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
