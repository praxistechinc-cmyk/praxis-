export type Attempt = {
  repId: string;
  repName: string;
  createdAt: string; // ISO
  market: string;
  scenarioId: string;
  score: number; // 0-100
  failTags: string[]; // e.g. ["no_close", "weak_discovery"]
  durationSec: number;
};

export const MOCK_ATTEMPTS: Attempt[] = [
  {
    repId: "r1",
    repName: "Avery",
    createdAt: new Date(Date.now() - 86400_000 * 1).toISOString(),
    market: "d2d_pest",
    scenarioId: "pest_price",
    score: 62,
    failTags: ["weak_discovery", "no_close"],
    durationSec: 92,
  },
  {
    repId: "r1",
    repName: "Avery",
    createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
    market: "d2d_pest",
    scenarioId: "pest_competitor",
    score: 71,
    failTags: ["objection_handling"],
    durationSec: 110,
  },
  {
    repId: "r2",
    repName: "Blake",
    createdAt: new Date(Date.now() - 86400_000 * 1).toISOString(),
    market: "d2d_pest",
    scenarioId: "pest_not_interested",
    score: 44,
    failTags: ["rapport", "no_close"],
    durationSec: 78,
  },
];
