import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

type Body = {
  market?: string;
  objectionId: string;
  objectionText: string;
  repResponse: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side admin for DB reads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    if (!body?.repResponse || !body?.objectionText) {
      return NextResponse.json({ error: "Missing repResponse or objectionText" }, { status: 400 });
    }

    // Verify user
    const { data: userRes, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const market = body.market || "d2d_pest";

    // Load prompt preset
    const { data: preset, error: presetErr } = await supabaseAdmin
      .from("prompt_presets")
      .select("instructions, rules")
      .eq("market_slug", market)
      .single();

    if (presetErr || !preset) {
      return NextResponse.json({ error: "Missing prompt preset", market }, { status: 500 });
    }

    // Force schema output
    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: preset.instructions,
      input: `You are running PRACTICE MODE.

Homeowner objection:
"""${body.objectionText}"""

Rep response:
"""${body.repResponse}"""

Market rules:
${preset.rules}

Return ONLY JSON matching the required schema.`,
      text: {
        format: {
          type: "json_schema",
          name: "praxis_practice_grade",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "number" },
              objection_type: { type: "string" },
              issues: { type: "array", items: { type: "string" }, maxItems: 3 },
              rewrite: { type: "string" },
              followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
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

    return NextResponse.json({ ok: true, analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
