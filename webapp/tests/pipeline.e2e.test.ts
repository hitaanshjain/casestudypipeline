// webapp/tests/pipeline.e2e.test.ts
// RUNS_DIR is read by lib/paths.ts at module-import time, so it must be set via
// vi.stubEnv BEFORE lib/pipeline.ts (or anything that transitively imports
// lib/paths.ts) is ever imported. Vitest isolates each test file into its own
// module registry by default, so a single dynamic import in beforeAll, after the
// stub, is enough for every test in this file to share the same scratch RUNS_DIR.
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "fs";
import os from "os";
import path from "path";

const E2E_TIMEOUT = 120_000;

let tmpDir: string;
let startRun: typeof import("../lib/pipeline").startRun;
let parsePrimarySection: typeof import("../lib/pipeline").parsePrimarySection;
let readState: typeof import("../lib/runStore").readState;
let runDir: typeof import("../lib/runStore").runDir;
let mockCalls: typeof import("../lib/llm").mockCalls;
let dbAvailable: typeof import("../lib/db").dbAvailable;
let ConceptCardsPayload: typeof import("../lib/contracts").ConceptCardsPayload;
let artifactsGET: typeof import("../app/api/runs/[id]/artifacts/[name]/route").GET;

beforeAll(async () => {
  tmpDir = mkdtempSync(path.join(os.tmpdir(), "mathgpt-runs-"));
  vi.stubEnv("RUNS_DIR", tmpDir);
  vi.stubEnv("MOCK_LLM", "1");

  const pipeline = await import("../lib/pipeline");
  const runStore = await import("../lib/runStore");
  const llm = await import("../lib/llm");
  const db = await import("../lib/db");
  const contracts = await import("../lib/contracts");
  const artifactsRoute = await import("../app/api/runs/[id]/artifacts/[name]/route");

  startRun = pipeline.startRun;
  parsePrimarySection = pipeline.parsePrimarySection;
  readState = runStore.readState;
  runDir = runStore.runDir;
  mockCalls = llm.mockCalls;
  dbAvailable = db.dbAvailable;
  ConceptCardsPayload = contracts.ConceptCardsPayload;
  artifactsGET = artifactsRoute.GET;
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(tmpDir, { recursive: true, force: true });
});

async function pollUntilDone(id: string, capMs = 60_000): Promise<ReturnType<typeof readState>> {
  const start = Date.now();
  for (;;) {
    const s = readState(id);
    if (s.done) return s;
    if (Date.now() - start > capMs) {
      throw new Error(`run ${id} did not reach done within ${capMs}ms (last state: ${JSON.stringify(s)})`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

describe("parsePrimarySection", () => {
  it("extracts the PRIMARY section's book_tag and section number from the real Stage 1 fixture", () => {
    const loMapping = JSON.parse(readFileSync(new URL("../fixtures/stage1/lo_mapping.json", import.meta.url), "utf8"));
    const primary = parsePrimarySection(loMapping);
    expect(primary).toEqual({ bookTag: "openstax_calc1", section: "5.4" });
  });

  it("returns null when sections is missing or not an array", () => {
    expect(parsePrimarySection({})).toBeNull();
    expect(parsePrimarySection({ sections: null })).toBeNull();
  });

  it("returns null on the degenerate no-primary shape (no PRIMARY role present)", () => {
    expect(
      parsePrimarySection({ no_primary_available: true, sections: [{ role: "SUPPORTING", corpus: "x", section_number: "1.1" }] })
    ).toBeNull();
  });
});

describe("pipeline e2e (mock mode)", () => {
  it(
    "happy path: stage1 -> critic -> fan-out all complete, case_study.pdf compiles for real via tectonic",
    async () => {
      vi.stubEnv("MOCK_STAGE_OVERRIDES", "");
      mockCalls.length = 0;

      const id = await startRun({
        problem: "A tank fills at r(t)=6t liters per hour starting from 40 liters; will it exceed 5000 liters in 12 hours?",
      });
      const state = await pollUntilDone(id, E2E_TIMEOUT);

      expect(state.failed).toBe(false);
      expect(state.stages.stage1.status).toBe("done");
      expect(state.stages.critic.status).toBe("done");
      expect(state.stages.case_study.status).toBe("done");

      const dir = runDir(id);
      const pdfPath = path.join(dir, "case_study.pdf");
      expect(existsSync(pdfPath)).toBe(true);
      const pdfBytes = readFileSync(pdfPath);
      expect(pdfBytes.subarray(0, 4).toString("latin1")).toBe("%PDF");

      expect(["done", "cached"]).toContain(state.stages.concept_cards.status);
      expect(["done", "cached"]).toContain(state.stages.practice_deck.status);

      const cardsJson = JSON.parse(readFileSync(path.join(dir, "concept_cards.json"), "utf8"));
      expect(ConceptCardsPayload.safeParse(cardsJson).success).toBe(true);
    },
    E2E_TIMEOUT
  );

  it(
    "cache path: a second run reuses cached concept cards without calling the LLM for that stage (only when flashcards_db is reachable)",
    async () => {
      const up = await dbAvailable();
      if (!up) {
        // Documented per Task 9 brief decision 5: reviewers may rerun this suite
        // with the container down; the cache path is then simply unverifiable.
        return;
      }

      // Prime the cache: any prior run in this file (the happy path above) may
      // already have populated it, and a dedicated run here guarantees it does.
      const seedId = await startRun({ problem: "Seed run so flashcards_db has a card for this run's chapter." });
      await pollUntilDone(seedId, E2E_TIMEOUT);

      mockCalls.length = 0;
      const id = await startRun({ problem: "Second run should hit the concept-card cache for the same chapter." });
      const state = await pollUntilDone(id, E2E_TIMEOUT);

      expect(state.stages.concept_cards.status).toBe("cached");
      expect(mockCalls).not.toContain("concept_cards");
    },
    E2E_TIMEOUT
  );

  it(
    "critic failure path: MOCK_STAGE_OVERRIDES redirects to the calibration-mismatch fixture, run fails, no downstream artifacts are written",
    async () => {
      vi.stubEnv("MOCK_STAGE_OVERRIDES", "critic=critic_fail");
      mockCalls.length = 0;

      const id = await startRun({ problem: "This problem's critic re-derivation will disagree with verified_answer.txt." });
      const state = await pollUntilDone(id, E2E_TIMEOUT);

      vi.stubEnv("MOCK_STAGE_OVERRIDES", "");

      expect(state.failed).toBe(true);
      expect(state.stages.critic.status).toBe("failed");
      expect(state.stages.critic.message).toContain("calibration failed");

      const dir = runDir(id);
      expect(existsSync(path.join(dir, "case_study.tex"))).toBe(false);
      expect(existsSync(path.join(dir, "case_study.pdf"))).toBe(false);
      expect(existsSync(path.join(dir, "concept_cards.json"))).toBe(false);
      expect(existsSync(path.join(dir, "practice_deck.json"))).toBe(false);
    },
    E2E_TIMEOUT
  );
});

describe("artifact route allowlist", () => {
  it("404s a path-traversal name that is not on the allowlist, without touching the filesystem", async () => {
    const res = await artifactsGET({} as never, {
      params: Promise.resolve({ id: "deadbeef", name: "../../CLAUDE.md" }),
    });
    expect(res.status).toBe(404);
  });

  it("404s an unknown-but-plausible artifact name", async () => {
    const res = await artifactsGET({} as never, {
      params: Promise.resolve({ id: "deadbeef", name: "lo_mapping.json" }),
    });
    expect(res.status).toBe(404);
  });
});
