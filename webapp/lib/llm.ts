// webapp/lib/llm.ts
// Prompt loading + the Anthropic client with a read-only tool-use loop over references/
// (corpusTools.ts). MOCK_LLM=1 short-circuits every call to a canned fixture under
// webapp/fixtures/mock/, which is how this pipeline is testable on a machine with no
// Anthropic API key (this one).
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import path from "path";
import { PROMPTS_DIR } from "./paths";
import { corpusToolDefs, runCorpusTool } from "./corpusTools";

export type StageName =
  | "stage1"
  | "critic_solve"
  | "critic"
  | "case_study"
  | "case_study_retry"
  | "concept_cards"
  | "practice_deck";

type PromptName =
  | "phase1_generator_prompt_v1"
  | "phase1_critic_prompt_v1"
  | "case_study_master_prompt"
  | "concept_flashcards_prompt"
  | "practice_deck_prompt";

export function loadPrompt(name: PromptName): string {
  return readFileSync(path.join(PROMPTS_DIR, `${name}.md`), "utf8");
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const MAX_TOOL_TURNS = 25;
// webapp/fixtures/mock/<stage>.txt; process.cwd() is webapp/ (matches lib/paths.ts's
// existing REPO_ROOT convention), not import.meta.url, so this resolves the same way
// whether run under vitest, `next dev`, or a bundled `next build` server function.
const MOCK_FIXTURES_DIR = path.join(process.cwd(), "fixtures", "mock");

// Test hook (Task 9): in mock mode, every runLlm call appends its stage name here, in call
// order, so a pipeline test can assert stage sequencing without a real API key.
export const mockCalls: string[] = [];

// Test hook (Task 9): MOCK_STAGE_OVERRIDES="critic=critic_fail,stage1=stage1_alt" (comma-
// separated stage=fixture pairs) redirects a stage to a differently-named fixture file, e.g.
// to force the critic-failure path without a second real StageName.
function resolveFixtureName(stage: StageName): string {
  const raw = process.env.MOCK_STAGE_OVERRIDES;
  if (!raw) return stage;
  for (const pair of raw.split(",")) {
    const [k, v] = pair.split("=").map((s) => s.trim());
    if (k === stage && v) return v;
  }
  return stage;
}

export async function runLlm(opts: {
  stage: StageName;
  system: string;
  user: string;
  tools?: "corpus";
  // Completed turns to replay before `user`. The critic uses this to satisfy its
  // prompt's first hard rule: it solves the problem in turn 1, and only turn 2 carries
  // the draft package, so its own solution provably predates seeing verified_answer.txt.
  priorTurns?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  if (process.env.MOCK_LLM === "1") {
    mockCalls.push(opts.stage);
    const fixtureName = resolveFixtureName(opts.stage);
    return readFileSync(path.join(MOCK_FIXTURES_DIR, `${fixtureName}.txt`), "utf8");
  }

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    ...(opts.priorTurns ?? []).map((t) => ({ role: t.role, content: t.content }) as Anthropic.MessageParam),
    { role: "user", content: opts.user },
  ];

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: opts.system,
      messages,
      tools: opts.tools === "corpus" ? corpusToolDefs : undefined,
    });

    if (res.stop_reason !== "tool_use") {
      return res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
    }

    // res.content is Array<ContentBlock> (the response shape); messages wants
    // Array<ContentBlockParam> (the request shape). The SDK's own multi-turn tool-use
    // examples round-trip a prior response's content back in as the next request's
    // assistant turn this same way; the Block/Param types differ only in which fields
    // are required vs optional (e.g. TextBlock.citations is required, TextBlockParam's
    // is optional), not in shape, so this is a safe widening, not an unsafe cast of
    // unrelated data.
    messages.push({ role: "assistant", content: res.content as unknown as Anthropic.ContentBlockParam[] });

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      let out: string;
      let isError = false;
      try {
        out = runCorpusTool(block.name, block.input);
      } catch (e) {
        out = (e as Error).message;
        isError = true;
      }
      results.push({ type: "tool_result", tool_use_id: block.id, content: out.slice(0, 200_000), is_error: isError });
    }
    messages.push({ role: "user", content: results });
  }

  throw new Error(`stage ${opts.stage}: tool loop exceeded ${MAX_TOOL_TURNS} turns`);
}
