// webapp/lib/pipeline.ts
// Orchestrates one run: Stage 1 (generator) -> critic calibration gate -> topic
// resolution against flashcards_db -> a three-way fan-out (case study LaTeX +
// tectonic compile, concept cards, practice deck), each independently cacheable
// by chapter. State lives at runs/<id>/state.json (runStore.ts); every mutation
// goes through updateState() below, which serializes read-modify-write cycles
// per run id so the three fan-out stages (run via Promise.allSettled) never
// interleave writes to the same state.json from this one Node process.
import { writeFileSync, readFileSync, copyFileSync, existsSync } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { newRunDir, writeState, readState, type RunState, type StageKey } from "./runStore";
import { loadPrompt, runLlm, usageStore, type StageUsage } from "./llm";
import {
  ConceptCard,
  ConceptCardsPayload,
  PracticeDeck,
  PracticeDeckGenerated,
  parseModelJson,
  type TConceptCardsPayload,
  type TPracticeDeck,
} from "./contracts";
import * as db from "./db";
import { TECTONIC } from "./paths";
import {
  STAGE1_ALL_FILES,
  parseStage1Reply,
  parseCriticReply,
  stripFences,
  validateCapturedMapping,
} from "./replyParsing";

const execFileP = promisify(execFile);

// process.cwd() is webapp/ under vitest, `next dev`, and a bundled `next build`
// server function alike (same convention as llm.ts's MOCK_FIXTURES_DIR).
const STAGE1_FIXTURES_DIR = path.join(process.cwd(), "fixtures", "stage1");

export type RunInput = { problem: string; preferredContext?: string };

// ---------------------------------------------------------------------------
// Per-run state mutex: a promise chain keyed by run id. Every mutation reads
// the current state.json fresh, applies `mutate`, and writes it back, all
// inside the chained callback, so concurrent callers queue rather than race.
// ---------------------------------------------------------------------------
const stateChains = new Map<string, Promise<void>>();

function updateState(id: string, mutate: (s: RunState) => void): Promise<void> {
  const prev = stateChains.get(id) ?? Promise.resolve();
  const next = prev.then(() => {
    const s = readState(id);
    mutate(s);
    writeState(id, s);
  });
  // The chain itself must never stay rejected (a failed mutation would otherwise
  // permanently wedge every later update for this run id); callers still observe
  // failures via the promise returned to them.
  stateChains.set(id, next.catch(() => {}));
  return next;
}

// ---------------------------------------------------------------------------
// startRun
// ---------------------------------------------------------------------------
export async function startRun(input: RunInput): Promise<string> {
  const { id, dir } = newRunDir();
  const state: RunState = {
    id,
    input,
    createdAt: new Date().toISOString(),
    stages: Object.fromEntries(
      (["stage1", "critic", "case_study", "concept_cards", "practice_deck"] as StageKey[]).map((s) => [
        s,
        { status: "pending" as const },
      ])
    ) as RunState["stages"],
    done: false,
    failed: false,
  };
  writeState(id, state);
  // Token usage for every stage of THIS run lands in `usage`, then gets written
  // to runs/<id>/usage.json. Cache reads bill at ~a tenth of fresh input, so the
  // read-vs-creation split is what tells you whether caching is actually working.
  const usage: StageUsage[] = [];
  void usageStore
    .run(usage, () => execute(id, dir, input).finally(() => writeUsage(dir, usage)))
    .catch((e) => {
    // execute()'s own rejection is already the unhappy path; readState/writeState
    // here can themselves throw (run dir vanished, disk full, etc.). That must
    // never become an unhandled rejection, since Node treats one as a crash of
    // the whole server. Never let a failure while recording a failure escape.
    try {
      const s = readState(id);
      s.failed = true;
      s.done = true;
      for (const k of Object.keys(s.stages) as StageKey[]) {
        if (s.stages[k].status === "running" || s.stages[k].status === "pending") {
          s.stages[k] = { status: "failed", message: String(e?.message ?? e) };
        }
      }
      writeState(id, s);
    } catch (writeErr) {
      console.error(
        `startRun: run ${id} failed (${String(e?.message ?? e)}) and recording that failure also failed:`,
        writeErr
      );
    } finally {
      stateChains.delete(id);
    }
  });
  return id;
}

// Writes a per-stage token breakdown beside the run's artifacts. Best-effort:
// a failure here must never take down a run that otherwise succeeded.
function writeUsage(dir: string, usage: StageUsage[]): void {
  if (usage.length === 0) return; // mock mode makes no API calls
  try {
    const total = usage.reduce(
      (acc, u) => ({
        requests: acc.requests + u.requests,
        input_tokens: acc.input_tokens + u.input_tokens,
        output_tokens: acc.output_tokens + u.output_tokens,
        cache_creation_input_tokens: acc.cache_creation_input_tokens + u.cache_creation_input_tokens,
        cache_read_input_tokens: acc.cache_read_input_tokens + u.cache_read_input_tokens,
      }),
      { requests: 0, input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
    );
    writeFileSync(path.join(dir, "usage.json"), JSON.stringify({ total, stages: usage }, null, 2));
  } catch (e) {
    console.error("could not write usage.json:", e);
  }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function buildStage1User(problem: string): string {
  return `Source problem:\n${problem}\n\nEnvironment note: you are running inside an automated pipeline and have NO write tool, only the read-only corpus tools list_books and read_corpus_file (they serve references_path). Return every output file in your reply instead of writing it: one line 'FILE: <name>' followed by that file's complete content in a fenced code block. On the honest failure path, where your instructions tell you to write phase1_error.txt, reply with exactly its single ERROR line and nothing else.`;
}

function readStage1Files(dir: string): string {
  return STAGE1_ALL_FILES.filter((f) => existsSync(path.join(dir, f)))
    .map((f) => `FILE: ${f}\n\`\`\`\n${readFileSync(path.join(dir, f), "utf8")}\n\`\`\``)
    .join("\n\n");
}

function extractLOs(primaryMd: string): string {
  const m = primaryMd.match(/## Section Outcomes \/ Learning Objectives\n([\s\S]*?)\n##/);
  return m ? m[1].trim() : "";
}

// The primary-section shape lives in lo_mapping.json's top-level `sections` array
// (see webapp/fixtures/stage1/lo_mapping.json): one entry per cited section, each
// carrying `role` ("PRIMARY" | "SUPPORTING"), `section_number` (e.g. "5.4"), and
// `corpus` (the book_tag db.resolveChapter expects, e.g. "openstax_calc1" — NOT
// `book_key`, which is the DB's own internal identifier, see lib/db.ts). Returns
// null on the degenerate no-primary path (no_primary_available: true, empty
// sections) or any unexpected shape, so callers fall back to cacheOffline.
export function parsePrimarySection(loMapping: unknown): { bookTag: string; section: string } | null {
  if (!loMapping || typeof loMapping !== "object") return null;
  const sections = (loMapping as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return null;
  const primary = sections.find((s) => s && typeof s === "object" && (s as { role?: unknown }).role === "PRIMARY") as
    | { corpus?: unknown; section_number?: unknown }
    | undefined;
  if (!primary) return null;
  const { corpus, section_number } = primary;
  if (typeof corpus !== "string" || !corpus || typeof section_number !== "string" || !section_number) return null;
  return { bookTag: corpus, section: section_number };
}

// ---------------------------------------------------------------------------
// Stage 1
// ---------------------------------------------------------------------------
async function runStage1(id: string, dir: string, input: RunInput): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.stage1 = { status: "running" };
  });

  const reply = await runLlm({
    stage: "stage1",
    system: loadPrompt("phase1_generator_prompt_v1"),
    user: buildStage1User(input.problem),
    tools: "corpus",
  });

  if (process.env.MOCK_LLM === "1") {
    // Mock behavior: the fixture text ("MOCK STAGE1 COMPLETE") is not parsed;
    // instead copy the real Stage 1 fixture package into the run dir.
    // Test hook: MOCK_STAGE1_OMIT="primary.md,supporting_01.md" skips those files, which
    // is the only way to exercise the honest no-coverage package (no extracts) through
    // the real pipeline, since the fixture package is always complete.
    const omit = new Set((process.env.MOCK_STAGE1_OMIT ?? "").split(",").map((f) => f.trim()).filter(Boolean));
    for (const f of STAGE1_ALL_FILES) {
      if (omit.has(f)) continue;
      copyFileSync(path.join(STAGE1_FIXTURES_DIR, f), path.join(dir, f));
    }
    await updateState(id, (s) => {
      s.stages.stage1 = { status: "done" };
    });
    return true;
  }

  const parsed = parseStage1Reply(reply);

  if (parsed.kind === "error") {
    await updateState(id, (s) => {
      s.stages.stage1 = { status: "failed", message: parsed.message };
    });
    return false;
  }

  if (parsed.kind === "missing") {
    await updateState(id, (s) => {
      s.stages.stage1 = {
        status: "failed",
        message: `stage1 missing required output file(s): ${parsed.missing.join(", ")}`,
      };
    });
    return false;
  }

  // Extracts are optional: prompts/phase1_generator_prompt_v1.md defines an honest
  // no-coverage path on which primary.md and the supporting files legitimately do not
  // exist. Write whatever arrived; downstream stages check their own preconditions.
  for (const f of STAGE1_ALL_FILES) {
    if (parsed.files[f] !== undefined) writeFileSync(path.join(dir, f), parsed.files[f]);
  }
  await updateState(id, (s) => {
    s.stages.stage1 = { status: "done" };
  });
  return true;
}

// ---------------------------------------------------------------------------
// Critic
// ---------------------------------------------------------------------------
// The critic prompt (prompts/phase1_critic_prompt_v1.md, a tested artifact this pipeline
// does not edit) was written for an agentic session with read/search/write file tools: it
// says to WRITE phase1_error.txt on a calibration failure and to UPDATE lo_mapping.json in
// place otherwise. Here it runs as a single API call with read-only corpus tools and no
// write tool, so this note maps both file operations onto the two reply shapes
// parseCriticReply understands. Same adapter pattern buildStage1User uses for the generator.
// TURN 1. The critic prompt's first hard rule outranks everything else in it: re-solve
// the problem completely BEFORE opening any draft file, because a solution written after
// seeing verified_answer.txt is not independent, and independence is the only thing the
// calibration gate measures. A single message carrying both the problem and the drafts
// makes that rule impossible to obey, so the drafts are withheld until this turn is
// answered: the model's own solution is a completed assistant turn before any draft
// content enters the context.
function buildCriticSolveUser(problem: string): string {
  return `Environment note: you are running inside an automated pipeline, not a file-system session. This is the first of two messages. It contains ONLY problem.txt, which satisfies your first hard rule: solve it here, in full, before any draft file is shown to you. The draft package will arrive in the next message, after this solution is written; you cannot see it yet.

problem.txt:
${problem}

Now do step 2 of your first hard rule and nothing else: solve every part, showing every operator-bearing step, every intermediate result, and every final value, then run the substitution self-check. Do not audit, do not critique, and do not ask for the drafts; just write your complete independent solution.`;
}

// TURN 2. Only now do the drafts appear. The write-tool remapping lives here because
// these are the instructions the model acts on after auditing.
function buildCriticAuditUser(dir: string): string {
  return `${readStage1Files(dir)}

Environment note, continued: the draft package is above, each file as a line "FILE: <name>" followed by its content in a fenced code block. Your input paths bind as follows: problem_path is the problem in the previous message, output_path is that set of file blocks, and references_path is served by your two read-only corpus tools, list_books and read_corpus_file. Your independent solution in the previous message is the one the calibration gate compares against verified_answer.txt; it was written before you saw any of this, so the gate is valid.

You have NO write tool. Wherever your instructions tell you to write a file, return it in your reply instead:
- If you would write phase1_error.txt, reply with its single ERROR line and nothing else besides your one-line report.
- If you would update lo_mapping.json, reply with the line "FILE: lo_mapping.json" followed by the COMPLETE updated file in a fenced code block, then your one-line report. Emit the whole document, every field, not just the fields you changed; an abbreviated mapping is rejected.`;
}

async function runCritic(id: string, dir: string, input: RunInput): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.critic = { status: "running" };
  });

  const system = loadPrompt("phase1_critic_prompt_v1");

  // Turn 1: the independent re-solve, with no draft content in context.
  const solveUser = buildCriticSolveUser(input.problem);
  const solution = await runLlm({ stage: "critic_solve", system, user: solveUser });

  // Turn 2: the drafts plus the audit instructions, replaying turn 1 so the model's own
  // solution is what its calibration gate compares against. Corpus tools are what make
  // audit items A1 (independent search), A3 (extract-vs-source faithfulness), and A4
  // (byte-exact attribution) possible at all.
  const auditUser = buildCriticAuditUser(dir);
  const priorTurns = [
    { role: "user" as const, content: solveUser },
    { role: "assistant" as const, content: solution },
  ];

  let reply = await runLlm({ stage: "critic", system, user: auditUser, tools: "corpus", priorTurns });
  let parsed = parseCriticReply(reply);

  if (parsed.kind === "unusable") {
    // One retry, the same single-retry convention the case-study and JSON stages use.
    // The rejected reply is quoted back so the model can see what was wrong with it.
    const retryUser = `${auditUser}\n\nYour previous reply did not match the required format and was rejected. It began:\n\n${reply.slice(0, 500)}\n\nReply now with EITHER its single ERROR line (calibration failure or unreadable package) and nothing else, OR the line "FILE: lo_mapping.json" followed by the COMPLETE updated lo_mapping.json in a fenced code block, then your one-line report.`;
    reply = await runLlm({ stage: "critic", system, user: retryUser, tools: "corpus", priorTurns });
    parsed = parseCriticReply(reply);
  }

  if (parsed.kind === "error") {
    await updateState(id, (s) => {
      s.stages.critic = { status: "failed", message: parsed.message };
    });
    return false;
  }

  if (parsed.kind === "unusable") {
    // Fail-safe: an unreadable critic reply means the calibration verdict is UNKNOWN, and
    // treating unknown as a pass would let an uncertified package through the one gate
    // built to stop it.
    await updateState(id, (s) => {
      s.stages.critic = {
        status: "failed",
        message: "critic reply did not match the reply contract after one retry; package not certified",
      };
    });
    return false;
  }

  // The capture replaces a file every downstream stage reads, so it is validated before
  // it is trusted: a "pending" critique_status means no audit happened, and a dropped
  // top-level field means the model abbreviated the 15KB document instead of re-emitting
  // it, which would silently break topic resolution with no error anywhere.
  const mappingPath = path.join(dir, "lo_mapping.json");
  const draft = readFileSync(mappingPath, "utf8");
  const check = validateCapturedMapping(parsed.content, draft);
  if (!check.ok) {
    await updateState(id, (s) => {
      s.stages.critic = { status: "failed", message: `critic critique rejected: ${check.reason}` };
    });
    return false;
  }

  // The generator's draft is kept beside the audited one: without it, a bad capture
  // cannot be diffed against what Stage 1 actually produced when debugging a live run.
  writeFileSync(path.join(dir, "lo_mapping.generator.json"), draft);
  writeFileSync(mappingPath, parsed.content);

  await updateState(id, (s) => {
    s.stages.critic = { status: "done" };
  });
  return true;
}

// ---------------------------------------------------------------------------
// Case study (LaTeX + tectonic compile, one retry on failure)
// ---------------------------------------------------------------------------
function buildCaseStudyUser(dir: string, input: RunInput): string {
  const themeLine = input.preferredContext ? `\npreferred_context: ${input.preferredContext}` : "";
  return `${readStage1Files(dir)}\n\nFILE: question.txt\n\`\`\`\n${input.problem}\n\`\`\`${themeLine}\n\nReturn ONLY the complete LaTeX source.`;
}

async function compileTex(dir: string): Promise<boolean> {
  try {
    await execFileP(TECTONIC, ["case_study.tex"], { cwd: dir, timeout: 120_000 });
    return existsSync(path.join(dir, "case_study.pdf"));
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    const log = `${err.stdout ?? ""}\n${err.stderr ?? ""}`.trim() || String(err.message ?? e);
    writeFileSync(path.join(dir, "compile.log"), log);
    return false;
  }
}

async function runCaseStudy(id: string, dir: string, input: RunInput): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.case_study = { status: "running" };
  });

  // A no-coverage Stage 1 package has no primary.md. The master prompt's file contract
  // requires it, so fail here with a student-readable reason rather than sending a
  // contract-violating user message and letting the model improvise.
  if (!existsSync(path.join(dir, "primary.md"))) {
    await updateState(id, (s) => {
      s.stages.case_study = {
        status: "failed",
        message: "Stage 1 found no primary textbook section for this problem, so the case study cannot be grounded.",
      };
    });
    return false;
  }

  const user = buildCaseStudyUser(dir, input);
  let reply = await runLlm({ stage: "case_study", system: loadPrompt("case_study_master_prompt"), user });
  writeFileSync(path.join(dir, "case_study.tex"), stripFences(reply));

  let ok = await compileTex(dir);
  if (!ok) {
    const log = existsSync(path.join(dir, "compile.log")) ? readFileSync(path.join(dir, "compile.log"), "utf8") : "";
    const retryUser = `${user}\n\nThe previous source failed to compile with this log; return corrected complete LaTeX source only.\n\n${log}`;
    reply = await runLlm({ stage: "case_study_retry", system: loadPrompt("case_study_master_prompt"), user: retryUser });
    writeFileSync(path.join(dir, "case_study.tex"), stripFences(reply));
    ok = await compileTex(dir);
  }

  if (!ok || !existsSync(path.join(dir, "case_study.pdf"))) {
    await updateState(id, (s) => {
      s.stages.case_study = { status: "failed", message: "LaTeX compile failed twice; see compile.log" };
    });
    return false;
  }

  await updateState(id, (s) => {
    s.stages.case_study = { status: "done" };
  });
  return true;
}

// ---------------------------------------------------------------------------
// Concept cards (cacheable by chapter)
// ---------------------------------------------------------------------------
function buildConceptCardsUser(dir: string, problem: string): string {
  const primary = readFileSync(path.join(dir, "primary.md"), "utf8");
  const supporting = (["supporting_01.md", "supporting_02.md"] as const)
    .filter((f) => existsSync(path.join(dir, f)))
    .map((f) => `FILE: ${f}\n\`\`\`\n${readFileSync(path.join(dir, f), "utf8")}\n\`\`\``)
    .join("\n\n");
  const los = extractLOs(primary);
  return `FILE: primary.md\n\`\`\`\n${primary}\n\`\`\`\n\n${supporting}\n\nLearning objectives:\n${los}\n\nSource problem:\n${problem}`;
}

async function runConceptCards(
  id: string,
  dir: string,
  input: RunInput,
  chapterId: number | undefined,
  cacheAvailable: boolean
): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.concept_cards = { status: "running" };
  });

  // Checked before the cache lookup: buildConceptCardsUser reads primary.md
  // unconditionally, so a no-coverage package would otherwise crash with a raw ENOENT
  // on a cache miss.
  if (!existsSync(path.join(dir, "primary.md"))) {
    await updateState(id, (s) => {
      s.stages.concept_cards = {
        status: "failed",
        message: "Stage 1 found no primary textbook section for this problem, so concept cards cannot be grounded.",
      };
    });
    return false;
  }

  if (cacheAvailable && chapterId !== undefined) {
    try {
      const cached = await db.getCachedConceptCards(chapterId);
      // flashcards_db is a shared dev database: rows for this chapter may include
      // hand-inserted or negative-control test fixtures (e.g. db.integration.test.ts's
      // {"a":1}-shaped rows) that are not real ConceptCard content. Validate before
      // trusting the cache rather than assuming every row in the chapter is one of
      // ours; a row that fails validation is treated as absent, not as a crash.
      const validCached = cached.filter((c) => ConceptCard.safeParse(c).success);
      if (validCached.length > 0) {
        const payload: TConceptCardsPayload = { cards: validCached, skipped_concepts: [] };
        writeFileSync(path.join(dir, "concept_cards.json"), JSON.stringify(payload, null, 2));
        await updateState(id, (s) => {
          s.stages.concept_cards = { status: "cached" };
        });
        return true;
      }
    } catch (e) {
      if (e instanceof db.DbUnavailableError) {
        await updateState(id, (s) => {
          s.cacheOffline = true;
        });
        cacheAvailable = false;
      } else {
        throw e;
      }
    }
  }

  const user = buildConceptCardsUser(dir, input.problem);
  let reply = await runLlm({ stage: "concept_cards", system: loadPrompt("concept_flashcards_prompt"), user });
  let parsed = parseModelJson(ConceptCardsPayload, reply);
  if (!parsed.ok) {
    const retryUser = `${user}\n\nYour previous reply failed validation: ${parsed.error}\n\nReturn corrected JSON only.`;
    reply = await runLlm({ stage: "concept_cards", system: loadPrompt("concept_flashcards_prompt"), user: retryUser });
    parsed = parseModelJson(ConceptCardsPayload, reply);
  }

  if (!parsed.ok) {
    await updateState(id, (s) => {
      s.stages.concept_cards = { status: "failed", message: parsed.error };
    });
    return false;
  }

  writeFileSync(path.join(dir, "concept_cards.json"), JSON.stringify(parsed.data, null, 2));

  if (cacheAvailable && chapterId !== undefined) {
    try {
      await db.storeConceptCards(chapterId, parsed.data);
    } catch {
      // A DbUnavailableError or insert error degrades caching only; the stage
      // already produced valid, written output and must not fail because of it.
      await updateState(id, (s) => {
        s.cacheOffline = true;
      });
    }
  }

  await updateState(id, (s) => {
    s.stages.concept_cards = { status: "done" };
  });
  return true;
}

// ---------------------------------------------------------------------------
// Practice deck (mirror of concept cards)
// ---------------------------------------------------------------------------
function buildPracticeDeckUser(dir: string, input: RunInput, topic: string | undefined): string {
  const themeLine = input.preferredContext ? `\npreferred_context: ${input.preferredContext}` : "";
  const topicLine = topic ? `\ntopic: ${topic}` : "";
  return `${readStage1Files(dir)}\n\nFILE: question.txt\n\`\`\`\n${input.problem}\n\`\`\`${themeLine}${topicLine}`;
}

async function runPracticeDeck(
  id: string,
  dir: string,
  input: RunInput,
  chapterId: number | undefined,
  cacheAvailable: boolean,
  topicLabel: string | undefined
): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.practice_deck = { status: "running" };
  });

  // practice_deck_prompt.md lists primary.md as a REQUIRED input (it is the authority for
  // notation, variable names, and rigor level), so a no-coverage package fails here for
  // the same reason the other two stages do rather than improvising without it.
  if (!existsSync(path.join(dir, "primary.md"))) {
    await updateState(id, (s) => {
      s.stages.practice_deck = {
        status: "failed",
        message: "Stage 1 found no primary textbook section for this problem, so the practice deck cannot be grounded.",
      };
    });
    return false;
  }

  if (cacheAvailable && chapterId !== undefined) {
    try {
      const cached = await db.getCachedPracticeDeck(chapterId);
      // Same defensive-validation reasoning as concept cards above: only trust a
      // cached deck that actually round-trips through the contract.
      const parsedCached = cached ? PracticeDeck.safeParse(cached) : null;
      if (parsedCached?.success) {
        writeFileSync(path.join(dir, "practice_deck.json"), JSON.stringify(parsedCached.data, null, 2));
        await updateState(id, (s) => {
          s.stages.practice_deck = { status: "cached" };
        });
        return true;
      }
    } catch (e) {
      if (e instanceof db.DbUnavailableError) {
        await updateState(id, (s) => {
          s.cacheOffline = true;
        });
        cacheAvailable = false;
      } else {
        throw e;
      }
    }
  }

  const user = buildPracticeDeckUser(dir, input, topicLabel);
  let reply = await runLlm({ stage: "practice_deck", system: loadPrompt("practice_deck_prompt"), user });
  // PracticeDeckGenerated, not PracticeDeck: fresh model output is held to the
  // headline-equation rule, and the retry below is what makes that gate useful.
  // Decks read from the cache above stay on the looser PracticeDeck.
  let parsed = parseModelJson(PracticeDeckGenerated, reply);
  if (!parsed.ok) {
    const retryUser = `${user}\n\nYour previous reply failed validation: ${parsed.error}\n\nReturn corrected JSON only.`;
    reply = await runLlm({ stage: "practice_deck", system: loadPrompt("practice_deck_prompt"), user: retryUser });
    parsed = parseModelJson(PracticeDeckGenerated, reply);
  }

  if (!parsed.ok) {
    await updateState(id, (s) => {
      s.stages.practice_deck = { status: "failed", message: parsed.error };
    });
    return false;
  }

  const deck: TPracticeDeck = parsed.data;
  writeFileSync(path.join(dir, "practice_deck.json"), JSON.stringify(deck, null, 2));

  if (cacheAvailable && chapterId !== undefined) {
    try {
      await db.storePracticeDeck(chapterId, deck, deck.problem);
    } catch {
      await updateState(id, (s) => {
        s.cacheOffline = true;
      });
    }
  }

  await updateState(id, (s) => {
    s.stages.practice_deck = { status: "done" };
  });
  return true;
}

// ---------------------------------------------------------------------------
// Fan-out safety wrapper: Promise.allSettled never sees a rejection from these,
// since an uncaught exception mid-stage would otherwise leave that stage stuck
// at "running" forever (no one else would mark it failed).
// ---------------------------------------------------------------------------
async function safeStage(id: string, key: StageKey, fn: () => Promise<boolean>): Promise<boolean> {
  try {
    return await fn();
  } catch (e) {
    await updateState(id, (s) => {
      s.stages[key] = { status: "failed", message: String((e as Error)?.message ?? e) };
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// execute
// ---------------------------------------------------------------------------
async function execute(id: string, dir: string, input: RunInput): Promise<void> {
  try {
    const stage1Ok = await runStage1(id, dir, input);
    if (!stage1Ok) {
      await updateState(id, (s) => {
        s.done = true;
        s.failed = true;
      });
      return;
    }

    const criticOk = await runCritic(id, dir, input);
    if (!criticOk) {
      await updateState(id, (s) => {
        s.done = true;
        s.failed = true;
      });
      return;
    }

    // Topic resolution: parse lo_mapping.json's PRIMARY section, then look it up
    // against flashcards_db. Any failure (parse failure, DB down, section not
    // found in the DB) degrades to cacheOffline rather than failing the run;
    // every fan-out stage still runs and generates its own content.
    let chapterId: number | undefined;
    let cacheAvailable = false;
    // Fallback per practice_deck_prompt.md's <input> contract: the resolved
    // chapter title when the DB has one, else the lo_mapping PRIMARY section
    // number, so the deck prompt's "topic" input is never silently omitted
    // just because flashcards_db is offline.
    let topicLabel: string | undefined;
    try {
      const loMapping = JSON.parse(readFileSync(path.join(dir, "lo_mapping.json"), "utf8"));
      const primary = parsePrimarySection(loMapping);
      if (primary) {
        topicLabel = primary.section;
        await updateState(id, (s) => {
          s.topic = { bookTag: primary.bookTag, section: primary.section };
        });
        if (await db.dbAvailable()) {
          const chapter = await db.resolveChapter(primary.bookTag, primary.section);
          if (chapter) {
            chapterId = chapter.chapterId;
            cacheAvailable = true;
            topicLabel = chapter.title;
            await updateState(id, (s) => {
              s.topic = { bookTag: primary.bookTag, section: primary.section, chapterId, title: chapter.title };
            });
          } else {
            await updateState(id, (s) => {
              s.cacheOffline = true;
            });
          }
        } else {
          await updateState(id, (s) => {
            s.cacheOffline = true;
          });
        }
      } else {
        await updateState(id, (s) => {
          s.cacheOffline = true;
        });
      }
    } catch {
      await updateState(id, (s) => {
        s.cacheOffline = true;
      });
    }

    const results = await Promise.allSettled([
      safeStage(id, "case_study", () => runCaseStudy(id, dir, input)),
      safeStage(id, "concept_cards", () => runConceptCards(id, dir, input, chapterId, cacheAvailable)),
      safeStage(id, "practice_deck", () => runPracticeDeck(id, dir, input, chapterId, cacheAvailable, topicLabel)),
    ]);
    const anySucceeded = results.some((r) => r.status === "fulfilled" && r.value === true);

    await updateState(id, (s) => {
      s.done = true;
      s.failed = !anySucceeded;
    });
  } finally {
    stateChains.delete(id);
  }
}
