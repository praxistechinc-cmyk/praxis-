import { NextResponse } from "next/server";
import { z } from "zod";
import { gradeResponse } from "@/lib/grading/grade";

const BodySchema = z.object({
  context: z.string().min(5),
  objection: z.string().min(3),
  repResponse: z.string().min(3),
  seed: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    console.log("GRADE REQUEST:", body);

    const result = await gradeResponse(body);

    console.log("GRADE RESULT:", {
  overall: result.overall_score,
  dims: result.dimension_scores,
  one_fix: result.one_action_fix?.instruction,
});


    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("GRADE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}

