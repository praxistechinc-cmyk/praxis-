import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Role = "manager" | "rep";

export type Team = {
  id: string;
  name: string;
  inviteCode: string; // short code reps type in
  createdAt: string;
  createdByUserId: string;
};

export type TeamMember = {
  teamId: string;
  userId: string;
  role: Role;
  displayName?: string | null;
  joinedAt: string;
};

export type Session = {
  id: string;
  teamId: string;
  repUserId: string;
  repName: string;
  startedAt: string;
  endedAt: string;
  rounds: number;
  sessionScore: number;
  topFailTags: Array<{ tag: string; count: number }>;
};

export type Attempt = {
  id: string;
  teamId: string;
  repUserId: string;
  repName: string;
  createdAt: string;
  market: string;
  scenarioId: string;
  score: number;
  failTags: string[];
  durationSec: number;
};

type DB = {
  teams: Team[];
  members: TeamMember[];
  sessions: Session[];
  attempts: Attempt[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "praxis.json");

async function ensureDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const empty: DB = { teams: [], members: [], sessions: [], attempts: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf8");
  }
}

export async function readDb(): Promise<DB> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DB;
}

export async function writeDb(db: DB) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function uid(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function inviteCode() {
  // readable: 8 chars, no symbols
  return crypto.randomBytes(5).toString("base64url").slice(0, 8).toUpperCase();
}
