// webapp/tests/lookup.e2e.test.ts
// Mirrors pipeline.e2e.test.ts's env-stub-then-dynamic-import pattern: RUNS_DIR
// and MOCK_LLM must be stubbed before lib/paths.ts is ever imported.
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";

const E2E_TIMEOUT = 120_000;

let tmpDir: string;
let startRun: typeof import("../lib/pipeline").startRun;
let readState: typeof import("../lib/runStore").readState;
let resolveRef: typeof import("../lib/exerciseBank").resolveRef;
let loadBank: typeof import("../lib/exerciseBank").loadBank;
let chapterOf: typeof import("../lib/exerciseBank").chapterOf;

beforeAll(async () => {
  tmpDir = mkdtempSync(path.join(os.tmpdir(), "mathgpt-lookup-"));
  vi.stubEnv("RUNS_DIR", tmpDir);
  vi.stubEnv("MOCK_LLM", "1");
  const pipeline = await import("../lib/pipeline");
  const runStore = await import("../lib/runStore");
  const bank = await import("../lib/exerciseBank");
  startRun = pipeline.startRun;
  readState = runStore.readState;
  resolveRef = bank.resolveRef;
  loadBank = bank.loadBank;
  chapterOf = bank.chapterOf;
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(tmpDir, { recursive: true, force: true });
});

async function pollUntilDone(id: string, capMs = 90_000) {
  const start = Date.now();
  for (;;) {
    const s = readState(id);
    if (s.done) return s;
    if (Date.now() - start > capMs) throw new Error("run did not finish in time");
    await new Promise((r) => setTimeout(r, 500));
  }
}

describe("textbook lookup end to end (mock mode)", () => {
  it("runs the pipeline from a resolved reference and keeps source provenance", async () => {
    const files = loadBank();
    expect(files.length).toBeGreaterThan(0); // bank must exist by this task
    const file = files.find((f) => f.exercises.some((e) => e.available))!;
    const ex = file.exercises.find((e) => e.available)!;
    const r = resolveRef(`${chapterOf(file)}.${ex.number}`);
    if (!(r.found && r.available)) throw new Error("expected an available resolution");
    const id = await startRun({
      problem: r.text,
      source: { book_key: "openstax_calculus_v1", chapter: r.ref.chapter, section: r.ref.section, number: r.ref.number },
    });
    const s = await pollUntilDone(id);
    expect(s.failed).toBe(false);
    expect(s.stages.stage1.status).toBe("done");
    expect(s.stages.critic.status).toBe("done");
    expect(s.stages.case_study.status).toBe("done");
    expect(["done", "cached"]).toContain(s.stages.concept_cards.status);
    expect(["done", "cached"]).toContain(s.stages.practice_deck.status);
    expect(s.input.problem).toBe(ex.text);
    expect(s.input.source).toMatchObject({ chapter: r.ref.chapter, section: r.ref.section, number: ex.number });
  }, E2E_TIMEOUT);
});
