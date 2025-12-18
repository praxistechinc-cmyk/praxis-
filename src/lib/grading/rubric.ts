export const RUBRIC = {
  // Canonical dimension keys (use these everywhere)
  dims: [
    "clarity",
    "objection_isolation",
    "homeowner_alignment",
    "tone",
    "close_attempt",
    "rapport_building",
  ],

  // Human-readable descriptions (optional UI/prompt support)
  dimensions: [
    {
      key: "clarity",
      name: "Clarity",
      what_good_looks_like:
        "Direct, concise, easy to understand. No rambling. Uses simple homeowner language.",
    },
    {
      key: "objection_isolation",
      name: "Objection isolation",
      what_good_looks_like:
        "Quickly identifies the real objection (timing/price/already-have/value). Asks a tight clarifying question.",
    },
    {
      key: "homeowner_alignment",
      name: "Alignment with homeowner",
      what_good_looks_like:
        "Acknowledges their concern, references their situation, avoids pushy/argumentative framing.",
    },
    {
      key: "tone",
      name: "Tone",
      what_good_looks_like:
        "Confident, respectful, calm. No guilt trips. Sounds human, not a script robot.",
    },
    {
      key: "close_attempt",
      name: "Close attempt",
      what_good_looks_like:
        "Ends with a clear next step (start service / schedule first treatment) with a specific ask.",
    },
    {
      key: "rapport_building",
      name: "Rapport building",
      what_good_looks_like:
        "Small human element (quick empathy, simple question, personalization) without wasting time.",
    },
  ],

  // Scoring anchors to keep the model consistent (0–5)
  anchors: {
    clarity: {
      "5": "Short, specific, no filler, homeowner language, easy to repeat.",
      "3": "Mostly clear but wordy or slightly confusing in spots.",
      "1": "Hard to follow, rambling, vague, or full of filler.",
      "0": "Incoherent / not an answer.",
    },
    objection_isolation: {
      "5": "Quickly surfaces the real barrier with ONE tight question.",
      "3": "Asks a question but it’s too broad or takes too long to get there.",
      "1": "Doesn’t isolate; talks past the objection.",
      "0": "Ignores the objection entirely.",
    },
    homeowner_alignment: {
      "5": "Validates + connects to homeowner’s situation; respectful framing.",
      "3": "Some empathy but generic / not tailored.",
      "1": "Pushy, argumentative, or dismissive.",
      "0": "Disrespectful / manipulative.",
    },
    tone: {
      "5": "Calm, confident, friendly, professional.",
      "3": "Mostly fine but slightly needy, defensive, or robotic.",
      "1": "Anxious, aggressive, or guilt-trippy.",
      "0": "Hostile / inappropriate.",
    },
    close_attempt: {
      "5": "Clear next step with a specific close (schedule/start) and a simple choice.",
      "3": "Close exists but weak/vague (e.g., “so… what do you think?”).",
      "1": "No close or ends with information only.",
      "0": "Actively avoids asking for action.",
    },
    rapport_building: {
      "5": "Quick personal touch (question or observation) that builds trust fast.",
      "3": "Some rapport attempt but generic.",
      "1": "No rapport; purely transactional or awkward.",
      "0": "Damages rapport.",
    },
  },

  // House rules (these are NOT universal truths; they are YOUR product’s standards)
  // Keep these aligned with your desired behavior change.
  rules: {
    start_style: "Acknowledge quickly (e.g., 'Totally fair.') but do NOT force exact wording.",
    isolate_with_one_question: true,
    include_specific_pest_or_property_reference: true,
    close_required: true,
    ethical_only: true,
  },
} as const;
