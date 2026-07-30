// webapp/tests/llm.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runLlm, loadPrompt, mockCalls } from "../lib/llm";
import { ConceptCardsPayload, parseModelJson } from "../lib/contracts";

describe("loadPrompt", () => {
  it("returns case_study_master_prompt containing preferred_context", () => {
    const text = loadPrompt("case_study_master_prompt");
    expect(text).toContain("preferred_context");
  });
});

describe("runLlm mock mode", () => {
  beforeEach(() => {
    vi.stubEnv("MOCK_LLM", "1");
    mockCalls.length = 0;
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns concept_cards fixture text that parses through ConceptCardsPayload", async () => {
    const out = await runLlm({ stage: "concept_cards", system: "sys", user: "user" });
    const parsed = parseModelJson(ConceptCardsPayload, out);
    expect(parsed.ok).toBe(true);
  });

  it("returns the exact one-line marker for stage1", async () => {
    const out = await runLlm({ stage: "stage1", system: "sys", user: "user" });
    expect(out.trim()).toBe("MOCK STAGE1 COMPLETE");
  });

  it("returns the exact one-line marker for critic", async () => {
    const out = await runLlm({ stage: "critic", system: "sys", user: "user" });
    expect(out.trim()).toBe("MOCK CRITIC PASS");
  });

  it("case_study_retry returns the same tex as case_study", async () => {
    const a = await runLlm({ stage: "case_study", system: "sys", user: "user" });
    const b = await runLlm({ stage: "case_study_retry", system: "sys", user: "user" });
    expect(b).toBe(a);
  });

  it("records the stage name of every call, in order, via mockCalls", async () => {
    await runLlm({ stage: "stage1", system: "sys", user: "user" });
    await runLlm({ stage: "critic", system: "sys", user: "user" });
    expect(mockCalls).toEqual(["stage1", "critic"]);
  });

  it("MOCK_STAGE_OVERRIDES redirects a stage to a different fixture (critic -> critic_fail)", async () => {
    vi.stubEnv("MOCK_STAGE_OVERRIDES", "critic=critic_fail");
    const out = await runLlm({ stage: "critic", system: "sys", user: "user" });
    expect(out).toContain("ERROR: calibration failed");
    expect(mockCalls).toEqual(["critic"]);
  });

  it("MOCK_STAGE_OVERRIDES only affects the named stage, others fall through unchanged", async () => {
    vi.stubEnv("MOCK_STAGE_OVERRIDES", "critic=critic_fail");
    const out = await runLlm({ stage: "stage1", system: "sys", user: "user" });
    expect(out.trim()).toBe("MOCK STAGE1 COMPLETE");
  });
});
