// webapp/lib/llm.ts
// Prompt loading + the Anthropic client with a read-only tool-use loop over references/
// (corpusTools.ts). MOCK_LLM=1 short-circuits every call to a canned fixture under
// webapp/fixtures/mock/, which is how this pipeline is testable on a machine with no
// Anthropic API key (this one).
import Anthropic from "@anthropic-ai/sdk";
import { AsyncLocalStorage } from "async_hooks";
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
// max_tokens caps thinking AND response text together, and claude-sonnet-5 thinks
// by default. Stage 1 alone emits five files (~7K tokens of content), so the old
// 16000 left too little headroom: run fd95ad94 spent its whole budget and was cut
// off midway through lo_mapping.json, which surfaced as a bogus "missing output
// file" error. Anything above ~16K must be streamed or the request risks an SDK
// HTTP timeout, which is why runLlm streams unconditionally. Unused headroom is
// free: billing counts tokens generated, not the ceiling.
const MAX_OUTPUT_TOKENS = 32000;
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

// Per-call token accounting, so a run can show where the money went instead of
// leaving it to the billing dashboard. Summed across every request a stage makes
// (a tool loop makes many).
export type StageUsage = {
  stage: StageName;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};

// Every stage in one pipeline run shares an accumulator without threading a
// callback through each call site. AsyncLocalStorage follows awaits and the
// fan-out's Promise.allSettled, so concurrent runs never mix their totals.
export const usageStore = new AsyncLocalStorage<StageUsage[]>();

// Reasoning depth per stage. claude-sonnet-5 defaults to effort "high" AND runs
// adaptive thinking whenever `thinking` is unset, so leaving this unspecified is
// the most expensive setting, not a neutral one. Stages that do original
// mathematics keep "high" because a wrong number is worth far more than the
// tokens saved; concept cards restate definitions already present in the
// supplied textbook sections, which is the one genuinely lighter job here.
const STAGE_EFFORT: Record<StageName, "low" | "medium" | "high"> = {
  stage1: "high",
  critic_solve: "high",
  critic: "high",
  case_study: "high",
  case_study_retry: "high",
  concept_cards: "medium",
  // Measured on run ec2f17ca: the deck spent 25,420 output tokens per attempt,
  // more than double the full LaTeX worksheet, for six JSON steps. Its work is
  // one clean textbook-style problem plus a structured write-up, not open-ended
  // reasoning, so "medium" is the right tier. This is the one effort setting here
  // with a real quality trade — the deck does invent and solve a fresh problem —
  // so watch the first few decks' arithmetic before treating it as settled.
  practice_deck: "medium",
};

// Moves the single rolling cache breakpoint to the end of the conversation so
// each tool-loop turn reuses everything cached by the previous turn. Only one
// message-side breakpoint is kept (the API allows 4 total, and the system block
// holds one), which stays well inside the 20-block lookback window: a tool turn
// appends 2 blocks, so the previous turn's entry is always within reach.
function moveRollingCacheBreakpoint(messages: Anthropic.MessageParam[]): void {
  for (const m of messages) {
    if (!Array.isArray(m.content)) continue;
    for (const block of m.content) {
      if (block && typeof block === "object" && "cache_control" in block) {
        delete (block as { cache_control?: unknown }).cache_control;
      }
    }
  }
  const last = messages[messages.length - 1];
  if (!last || !Array.isArray(last.content) || last.content.length === 0) return;
  const tail = last.content[last.content.length - 1];
  if (tail && typeof tail === "object") {
    (tail as { cache_control?: { type: "ephemeral" } }).cache_control = { type: "ephemeral" };
  }
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

  const tally: StageUsage = {
    stage: opts.stage,
    requests: 0,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
  const report = () => usageStore.getStore()?.push(tally);

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    // Caching is a prefix match over tools -> system -> messages, so a breakpoint
    // on the system block covers the tool definitions and the (large, unchanging)
    // stage prompt together. Without it, every tool-loop turn re-bills the whole
    // prompt plus every corpus file read so far, which grows quadratically and is
    // the single largest cost in a run.
    const res = await client.messages
      .stream({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        output_config: { effort: STAGE_EFFORT[opts.stage] },
        system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
        messages,
        tools: opts.tools === "corpus" ? corpusToolDefs : undefined,
      })
      .finalMessage();

    tally.requests += 1;
    tally.input_tokens += res.usage.input_tokens ?? 0;
    tally.output_tokens += res.usage.output_tokens ?? 0;
    tally.cache_creation_input_tokens += res.usage.cache_creation_input_tokens ?? 0;
    tally.cache_read_input_tokens += res.usage.cache_read_input_tokens ?? 0;

    if (res.stop_reason !== "tool_use") {
      report();
      // A truncated reply is not a malformed reply. Without this branch the cut-off
      // final block simply fails to parse and the stage reports whichever file went
      // missing, which points the next debugger at the parser instead of the cap.
      if (res.stop_reason === "max_tokens") {
        throw new Error(
          `stage ${opts.stage}: the model's reply was cut off at the ${MAX_OUTPUT_TOKENS}-token output limit ` +
            `(thinking plus text share this budget). Raise MAX_OUTPUT_TOKENS or lower this stage's effort.`
        );
      }
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
    moveRollingCacheBreakpoint(messages);
  }

  report();
  throw new Error(`stage ${opts.stage}: tool loop exceeded ${MAX_TOOL_TURNS} turns`);
}
