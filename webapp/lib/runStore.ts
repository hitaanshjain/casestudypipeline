// webapp/lib/runStore.ts
// Persistence for one pipeline run's state: runs/<id>/state.json plus the run's
// artifact directory. Read-modify-write; callers that mutate concurrently (the
// pipeline's fan-out stages) must serialize through pipeline.ts's per-run mutex,
// not through this module (this module has no locking of its own).
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { RUNS_DIR } from "./paths";

export type StageStatus = "pending" | "running" | "done" | "failed" | "cached";
export type StageKey = "stage1" | "critic" | "case_study" | "concept_cards" | "practice_deck";

export type RunState = {
  id: string;
  input: { problem: string; preferredContext?: string };
  createdAt: string;
  stages: Record<StageKey, { status: StageStatus; message?: string }>;
  topic?: { bookTag: string; section: string; chapterId?: number; title?: string };
  cacheOffline?: boolean;
  done: boolean;
  failed: boolean;
};

export function newRunDir(): { id: string; dir: string } {
  const id = randomUUID().slice(0, 8);
  const dir = path.join(RUNS_DIR, id);
  mkdirSync(dir, { recursive: true });
  return { id, dir };
}

export function runDir(id: string): string {
  if (!/^[a-f0-9-]{8}$/.test(id)) throw new Error("bad run id");
  return path.join(RUNS_DIR, id);
}

export function readState(id: string): RunState {
  return JSON.parse(readFileSync(path.join(runDir(id), "state.json"), "utf8"));
}

export function writeState(id: string, state: RunState): void {
  // Atomic write: a crash or unhandled error mid-write must never leave a
  // truncated/corrupt state.json behind, since every later read-modify-write in
  // pipeline.ts's per-run mutex chain depends on state.json always parsing.
  const finalPath = path.join(runDir(id), "state.json");
  const tmpPath = `${finalPath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2));
  renameSync(tmpPath, finalPath);
}

export function runExists(id: string): boolean {
  try {
    return existsSync(path.join(runDir(id), "state.json"));
  } catch {
    return false;
  }
}
