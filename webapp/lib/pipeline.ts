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
import { loadPrompt, runLlm } from "./llm";
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
import { STAGE1_ALL_FILES, parseStage1Reply, parseCriticReply, stripFences } from "./replyParsing";

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
  void execute(id, dir, input).catch((e) => {
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function buildStage1User(problem: string): string {
  return `Source problem:\n${problem}\n\nReturn each output file in a fenced block preceded by a line 'FILE: <name>'.`;
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
    for (const f of STAGE1_ALL_FILES) {
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
const CRITIC_ENVIRONMENT_NOTE = `Environment note: you are running inside an automated pipeline, not a file-system session. The draft package files appear above, each as a line "FILE: <name>" followed by that file's content in a fenced code block; the source problem at the top is problem.txt. You have two read-only corpus tools, list_books and read_corpus_file, which serve references_path. You have NO write tool. Wherever your instructions tell you to write a file, return it in your reply instead:
- If you would write phase1_error.txt, reply with exactly its single ERROR line and nothing else.
- If you would update lo_mapping.json, reply with the line "FILE: lo_mapping.json" followed by the COMPLETE updated file in a fenced code block, then your one-line report.`;

function buildCriticUser(dir: string, problem: string): string {
  return `Source problem:\n${problem}\n\n${readStage1Files(dir)}\n\n${CRITIC_ENVIRONMENT_NOTE}`;
}

async function runCritic(id: string, dir: string, input: RunInput): Promise<boolean> {
  await updateState(id, (s) => {
    s.stages.critic = { status: "running" };
  });

  const user = buildCriticUser(dir, input.problem);
  const system = loadPrompt("phase1_critic_prompt_v1");

  // Corpus tools are what make audit items A1 (independent search), A3 (extract-vs-source
  // faithfulness), and A4 (byte-exact attribution) possible at all.
  let reply = await runLlm({ stage: "critic", system, user, tools: "corpus" });
  let parsed = parseCriticReply(reply);

  if (parsed.kind === "unusable") {
    // One retry, the same single-retry convention the case-study and JSON stages use.
    const retryUser = `${user}\n\nYour previous reply did not match the required format. Reply with EITHER exactly one ERROR line (calibration failure or unreadable package) and nothing else, OR the line "FILE: lo_mapping.json" followed by the complete updated lo_mapping.json in a fenced code block, then your one-line report.`;
    reply = await runLlm({ stage: "critic", system, user: retryUser, tools: "corpus" });
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

  // Pass path: the critic's updated lo_mapping.json (nine critique fields, plus verified
  // and extended missing_concepts) replaces the generator's draft, so every downstream
  // stage reads the audited mapping rather than the unaudited one.
  writeFileSync(path.join(dir, "lo_mapping.json"), parsed.content);

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
  return `${readStage1Files(dir)}\n\nFILE question.txt:\n\`\`\`\n${input.problem}\n\`\`\`${themeLine}\n\nReturn ONLY the complete LaTeX source.`;
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
  return `${readStage1Files(dir)}\n\nFILE question.txt:\n\`\`\`\n${input.problem}\n\`\`\`${themeLine}${topicLine}`;
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
