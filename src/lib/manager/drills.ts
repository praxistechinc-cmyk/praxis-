export type Phase = "opener" | "discovery" | "objection" | "close";

export type Drill = {
  id: string;
  name: string;
  durationMin: number;
  prescription: string[];
  pass: string;
  focus: Phase;
  triggers: {
    failTags?: string[];
  };
};

export const DRILLS: Drill[] = [
  {
    id: "drill_ask_close_3x",
    name: "Ask for the close 3 times",
    durationMin: 8,
    prescription: [
      "Run 10 roleplays.",
      "Ask for the sale by minute 2, again by minute 3, again by minute 4.",
      "Use ONE close line. No rambling.",
      "End with a clear next step (schedule / same-day service / inspection).",
    ],
    pass: "Asked 3 times + got a clear next step in 7/10 reps",
    focus: "close",
    triggers: { failTags: ["no_close"] },
  },
  {
    id: "drill_discovery_5q",
    name: "5-question discovery",
    durationMin: 10,
    prescription: [
      "Ask: pain, urgency, past attempts, decision maker, next step.",
      "No pitching until all 5 are answered.",
      "Summarize their answers in one sentence before you pitch.",
    ],
    pass: "5/5 questions before pitching in 8/10 reps",
    focus: "discovery",
    triggers: { failTags: ["weak_discovery"] },
  },
  {
    id: "drill_objection_loop",
    name: "Objection loop (acknowledge → clarify → answer → check)",
    durationMin: 10,
    prescription: [
      "Run 10 objections back-to-back.",
      "Acknowledge: 'Totally fair.'",
      "Clarify: 'Is it price or trust?'",
      "Answer in 15 seconds max.",
      "Check: 'Does that solve it?' then close.",
    ],
    pass: "Resolved objection + attempted close in 7/10 reps",
    focus: "objection",
    triggers: { failTags: ["objection_handling"] },
  },
  {
    id: "drill_rapport_10sec",
    name: "10-second rapport + permission",
    durationMin: 6,
    prescription: [
      "Open with a human line + permission: 'I’ll be 20 seconds—fair?'",
      "Mirror their energy (calm/fast).",
      "Ask one simple question before pitching.",
    ],
    pass: "Permission asked + question asked in 8/10 reps",
    focus: "opener",
    triggers: { failTags: ["rapport"] },
  },
];
