import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

import { GradeCoreSchema, type GradeCore } from "./schema";
import { RUBRIC } from "./rubric";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set this in .env.local as OPENAI_MODEL=...
// Safe default:
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

type GradeInput = {
  objection: string;
  context: string;
  repResponse: string;
  seed?: string;
};

function computeOverall(dim: Record<string, number>) {
  const sum = Object.values(dim).reduce((a, b) => a + b, 0); // 0..30
  return Math.round((sum / 30) * 100);
}

/**
 * Structured Outputs: model MUST conform to the zod schema or the call fails.
 */
async function callLLMParsed<T>(params: {
  model: string;
  temperature: number;
  messages: Array<{ role: "system" | "user"; content: string }>;
  schema: z.ZodType<T>;
  schemaName: string;
}): Promise<T> {
  const res = await openai.responses.parse({
    model: params.model,
    reasoning: { effort: "none" }, // keeps temperature allowed + stable
    input: params.messages.map((m) => ({
      role: m.role,
      content: [{ type: "input_text", text: m.content }],
    })),
    temperature: params.temperature,
    text: {
      format: zodTextFormat(params.schema, params.schemaName),
    },
  });

  return res.output_parsed as T;
}

// Coach-only schema (small, so it stays fast + varied)
const CoachSchema = z.object({
  one_action_fix: z.object({
    instruction: z.string(),
    example_line: z.string(),
  }),
  rewrite: z.object({
    rep_response_v1: z.string(),
  }),
});
type CoachOut = z.infer<typeof CoachSchema>;

export async function gradeResponse(input: GradeInput): Promise<GradeCore> {
  const variation_seed = input.seed ?? `${Date.now().toString(36)}`;

  // PASS A: JUDGE (behavior-first, stable scoring)
  const judgeSystem = `
You are a strict evaluator for door-to-door pest control objection handling.
Your job is to diagnose behavior, not vibes.
Output must match the JSON schema exactly (Structured Output). No markdown.

Rules:
- First fill behavior_checks true/false based ONLY on the rep response.
- Then score the 6 dimensions 0-5 using anchors AND the caps below.
- Then choose exactly one primary_failure (most responsible for losing the deal).
- Then write point_losses ONLY where lost > 0.
- Then write one_action_fix (single behavior) + example_line.
- Then write rewrite.rep_response_v1 (porch speak, realistic, under 1200 chars).
`.trim();

  const judgeUser = `
CONTEXT:
${input.context}

OBJECTION:
${input.objection}

REP RESPONSE:
${input.repResponse}

DIMENSIONS:
${RUBRIC.dims.join(", ")}

ANCHORS:
${JSON.stringify(RUBRIC.anchors, null, 2)}

HOUSE RULES:
${JSON.stringify(RUBRIC.rules, null, 2)}

BEHAVIOR CHECK DEFINITIONS:
- acknowledged_objection: explicitly validates or acknowledges the objection.
- asked_clarifying_question: asks ONE question to isolate the real reason before explaining.
- named_specific_pest_or_risk: mentions a pest, seasonality, entry point, or prevention outcome.
- explained_value_in_homeowner_terms: value stated in plain homeowner terms (not features).
- built_trust_process_or_credibility: mentions what happens next / process / guarantee / proof.
- attempted_close_next_step: asks for commitment (start/schedule) with a clear next step.
- kept_under_20_seconds: would take ~20 seconds or less to say out loud.

HARD CAPS (apply these):
- If asked_clarifying_question = false => objection_isolation <= 2
- If attempted_close_next_step = false => close_attempt <= 2
- If named_specific_pest_or_risk = false => homeowner_alignment <= 3
- If built_trust_process_or_credibility = false => rapport_building <= 3
- If response is rambling => clarity <= 3

SCORING CONSTRAINT:
overall_score MUST equal round((sum(dimension_scores)/30)*100).

VARIATION SEED (use for wording only, NOT scores): ${variation_seed}
`.trim();

  const judgeData = await callLLMParsed<GradeCore>({
    model: MODEL,
    temperature: 0.1,
    messages: [
      { role: "system", content: judgeSystem },
      { role: "user", content: judgeUser },
    ],
    schema: GradeCoreSchema,
    schemaName: "grade_core",
  });

  // Enforce overall score to prevent drift (still do this)
  const fixedOverall = computeOverall(judgeData.dimension_scores as any);

  const core: GradeCore = {
    ...judgeData,
    overall_score: fixedOverall,
    variation_seed,
  };

  // PASS B: COACH (varied wording, MUST keep scores + logic)
  const coachSystem = `
You are a sales coach refining output presentation.
You MUST keep the scores exactly the same.
You MUST NOT contradict point_losses or primary_failure.
Make one_action_fix and rewrite feel fresh (not templated).
Output must match the schema exactly (Structured Output). No markdown.
`.trim();

  const coachUser = `
JUDGE OUTPUT:
${JSON.stringify(core, null, 2)}

Generate:
- one_action_fix.instruction: ONE specific behavior the rep should do next time
- one_action_fix.example_line: ONE line they can literally say
- rewrite.rep_response_v1: a high-quality rewrite that fits the objection + context

Constraints:
- Speakable on a porch.
- Under 1200 characters.
- Use a different sentence structure than the judge rewrite.
- Use variation_seed for phrasing variety: ${variation_seed}
`.trim();

  const coachOut = await callLLMParsed<CoachOut>({
    model: MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: coachSystem },
      { role: "user", content: coachUser },
    ],
    schema: CoachSchema,
    schemaName: "grade_coach",
  });

  const merged: GradeCore = {
    ...core,
    one_action_fix: coachOut.one_action_fix ?? core.one_action_fix,
    rewrite: coachOut.rewrite ?? core.rewrite,
  };

  // Final validation
  return GradeCoreSchema.parse(merged);
}
