export type Attempt = {
  projectId: string;
  repId: string;
  repName: string;
  createdAt: string; // ISO
  market: string;
  scenarioId: string; // objection id
  score: number; // 0-100
  failTags: string[];
  durationSec: number;
};

export type Session = {
  projectId: string;
  repId: string;
  repName: string;
  startedAt: string;
  endedAt: string;
  rounds: number;
  sessionScore: number; // 0-100
  topFailTags: { tag: string; count: number }[];
};

const g = globalThis as any;

// Persist across HMR in dev
g.__PRAXIS_STORE__ ??= { attempts: [] as Attempt[], sessions: [] as Session[] };

export function addAttempt(a: Attempt) {
  g.__PRAXIS_STORE__.attempts.push(a);
}

export function listAttempts(projectId?: string) {
  const all: Attempt[] = g.__PRAXIS_STORE__.attempts;
  return projectId ? all.filter((x) => x.projectId === projectId) : all;
}

export function addSession(s: Session) {
  g.__PRAXIS_STORE__.sessions.push(s);
}

export function listSessions(projectId?: string) {
  const all: Session[] = g.__PRAXIS_STORE__.sessions;
  return projectId ? all.filter((x) => x.projectId === projectId) : all;
}
