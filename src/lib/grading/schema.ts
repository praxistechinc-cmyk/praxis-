import { z } from "zod";

/**
 * 1. Dimension scores (derived, capped by behaviors)
 */
export const DimensionScoresSchema = z.object({
  clarity: z.number().int().min(0).max(5),
  objection_isolation: z.number().int().min(0).max(5),
  homeowner_alignment: z.number().int().min(0).max(5),
  tone: z.number().int().min(0).max(5),
  close_attempt: z.number().int().min(0).max(5),
  rapport_building: z.number().int().min(0).max(5),
});

/**
 * 2. Binary behavior checks (THIS is the core of behavior change)
 */
export const BehaviorChecksSchema = z.object({
  acknowledged_objection: z.boolean(),
  asked_clarifying_question: z.boolean(),
  named_specific_pest_or_risk: z.boolean(),
  explained_value_in_homeowner_terms: z.boolean(),
  built_trust_process_or_credibility: z.boolean(),
  attempted_close_next_step: z.boolean(),
  kept_under_20_seconds: z.boolean(),
});

/**
 * 3. Point losses (only where points were actually lost)
 */
export const PointLossSchema = z.object({
  dimension: DimensionScoresSchema.keyof(),
  lost: z.number().int().min(0).max(5),
  reason: z.string().min(5),
});

/**
 * 4. One forced behavioral correction
 */
export const OneActionFixSchema = z.object({
  instruction: z.string().min(8),
  example_line: z.string().min(3),
});

/**
 * 5. Rewrite
 */
export const RewriteSchema = z.object({
  rep_response_v1: z.string().min(3),
});

/**
 * 6. Root cause diagnosis (ONE dominant failure)
 */
export const PrimaryFailureSchema = z.object({
  code: z.enum([
    "no_isolation",
    "no_close",
    "too_generic",
    "too_wordy",
    "low_trust",
    "weak_tone",
  ]),
  why_it_matters: z.string().min(10),
  what_to_do_instead: z.string().min(10),
});

/**
 * FINAL OUTPUT SHAPE
 */
export const GradeCoreSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  dimension_scores: DimensionScoresSchema,
  behavior_checks: BehaviorChecksSchema,
  primary_failure: PrimaryFailureSchema,
  point_losses: z.array(PointLossSchema).default([]),
  one_action_fix: OneActionFixSchema,
  rewrite: RewriteSchema,
  variation_seed: z.string().nullable(),
});

export type GradeCore = z.infer<typeof GradeCoreSchema>;
