# Web App + Pipeline Design (approved July 29, 2026)

Approved by Hitaansh in-session July 29, 2026, with pre-approval to implement without
a further review gate. This spec supersedes the phase-2 v3 case path, the flashcard
v2 card contract, and the two-format DB plan; reversals are logged in CLAUDE.md sec 9.

## 1. Goal

A Next.js web app that fronts the full pipeline: a student (or instructor) enters a
textbook problem or subject plus a preferred scenario theme (soccer, architecture,
anything), and the app returns three artifacts on one results page:

1. a one-page case-study worksheet PDF,
2. concept flashcards for the topic (two-sided, navy/ivory design),
3. a practice-problem slide deck (step-by-step slideshow, manual navigation).

Flashcards are cached in the existing MySQL database keyed by textbook section:
cache hit = serve stored cards, no generation; miss = generate, validate, insert,
serve. Case studies are theme-dependent and always generated fresh.

## 2. The three production prompts

The user supplied three prompts that become the ONLY generation prompts on this path,
plus the retained phase-1 pair that feeds them.

| Prompt (new repo path) | Source file | Role |
|---|---|---|
| prompts/case_study_master_prompt.md | Master Prompt.txt | Stage 2 case study (LaTeX -> PDF) |
| prompts/concept_flashcards_prompt.md | concept flashcards prompt.txt | Concept cards (JSON out, rewritten) |
| prompts/practice_deck_prompt.md | Practice Problem Flashcard Master Prompt .txt | Practice slideshow deck (JSON out, rewritten) |
| prompts/phase1_generator_prompt_v1.md | (existing, unchanged) | problem -> 5-file Stage 1 package |
| prompts/phase1_critic_prompt_v1.md | (existing, unchanged) | calibration gate + audit |

All three new prompts are converted to .md, snake_case, no title/lineage header
(start at first contract tag), per repo conventions. The root .txt originals are
deleted after the move.

### 2a. case_study_master_prompt.md edits (small)

- Add an optional `preferred_context` input: when supplied by the app, the scenario
  MUST be set in that domain provided the mathematics genuinely fits there; the
  anti-anchoring section governs scenario choice only when preferred_context is
  absent. If the domain cannot honestly host the math, the prompt says to pick the
  nearest honest neighbor and note the substitution in a LaTeX comment.
- No other content changes. Delivery stays "PDF only"; in this pipeline the app is
  the compile stage (tectonic), so the model's deliverable is the .tex source and
  the app compiles it. The prompt's compile-and-inspect language applies when an
  agentic environment runs it; the API pipeline treats returned .tex as the artifact
  and compiles server-side.

### 2b. concept_flashcards_prompt.md rewrite (substantial)

Keep (as content rules): one concept per card; two-sided design (Slide 1 concept,
Slide 2 worked example); title/subtitle/central statement/variable key/two
description lines/footer cue on the front; complete self-contained question,
complete reasoning, fully bold final answer, concept-specific footer on the back;
concept-only inventory rules (no cards for examples/warnings/duplicates); provenance
gates (every number/symbol given, defined, or derived); question-solution-answer
agreement; navy #011E4F / ivory #FAF8F4 / periwinkle #82A4F5 / blue #176CF8 palette
identity (expressed by the web renderer, not by the model).

Change:
- Input: no textbook URL, no web traversal. Inputs are the Stage 1 files
  (primary.md required; supporting_*.md optional) plus the section's learning
  objectives, all pasted/injected by the pipeline.
- Scope: only concepts substantively taught in the supplied section content and
  relevant to the source problem. Typically 2-6 cards per run, not 75.
- Output: a single JSON object `{ "cards": [ ... ] }`. Each card:

```json
{
  "concept_name": "string",
  "front": {
    "title": "string, <= 60 chars",
    "subtitle": "string, 2-4 words",
    "central_latex": "string, LaTeX, no $ delimiters",
    "central_prose": "string or null (exactly one of central_latex/central_prose non-null)",
    "variable_key": [ { "symbol": "LaTeX", "meaning": "string" } ],
    "description_main": "string, <= 14 words",
    "description_support": "string, <= 17 words"
  },
  "back": {
    "question": "string, may contain inline \\( \\) math",
    "steps": [ { "latex": "string or null", "prose": "string or null" } ],
    "final_answer_latex": "string, LaTeX",
    "footer": "string, <= 12 words, concept-specific insight"
  },
  "source": { "book_tag": "string", "section": "string", "lo_ordinal": "int or null" }
}
```

- Drop entirely: PPTX/ZIP/LibreOffice machinery, slide geometry inches/points,
  font names, whole-book ledger, batch workflow, collection validation. Visual/graph
  generation is out of scope for v1 cards (formula/prose cards only); the prompt
  says to prefer a NONVISUAL treatment and skip concepts that genuinely require a
  drawn graph, listing them in a `skipped_concepts` array with reasons.

### 2c. practice_deck_prompt.md rewrite (schema swap)

Keep: one original problem (never copied from the textbook), textbook-faithful
notation and difficulty, 4-7 steps, one step per major move, independent
verification before writing JSON, no method previews in the question, callouts
only when they add judgment, plain-English "why" explanation per step.

Change output to the animation renderer schema (schemaVersion 1.1, renderer id
`math-animation-dark-sidebar`), exactly as consumed by the existing renderer page:

- Top level: `schemaVersion`, `renderer`, `animationId`, `title`, `subtitle`,
  `problem { prompt, latex, answerLatex }`, `steps[]`, `reference`.
- Each step: `id`, `title`, `caption`, `equations[] { label, latex, style }`
  (style in primary | rule | secondary | final), `cards[] { label, latex, tone }`
  (tone blue | violet), optional `callout { type, title, text }` (type in
  goal | tip | memory | check | warning | success).
- `reference` carries ONLY `equations[] { title, latex, text, stepId }` (the Key
  Equations & Formulas group). tips/shortcuts/tricks/commonMistakes/checks are
  removed from the schema.
- Removed fields: `narration`, `durationMs`, `settings` (no autoplay, no speeds).
- The old highlighter system is gone; emphasis is expressed through equation-row
  styles and card tones.
- Last step: the boxed final answer with style "final" plus a short verification
  row; exactly one final step.

Callout label mapping from the old prompt: Start here -> goal, Formula -> rule
equation row (not a callout), Keep in mind -> memory, Common mistake -> warning,
Shortcut -> tip, Check -> check/success.

## 3. Pipeline architecture

Single Next.js app in `webapp/` (App Router, TypeScript). All LLM and DB work in
route handlers / server code. No Python in the serving path.

Run flow (`POST /api/runs` -> run id; client polls `GET /api/runs/[id]`):

1. **Stage 1**: phase-1 generator prompt via Anthropic SDK with a minimal tool loop:
   `list_book_map` (returns references/<book>/book_map.json content) and
   `read_section` (returns one section file). Tools are read-only and path-fenced
   to references/. Output: primary.md, supporting_01/02.md, lo_mapping.json,
   verified_answer.txt written to runs/<id>/.
2. **Critic**: phase-1 critic prompt, fresh conversation, same tool fence. A
   calibration mismatch fails the run honestly ("the model could not verify the
   source problem"), no artifacts.
3. **Topic resolution + cache check**: lo_mapping.json names the PRIMARY section;
   map to the `chapter` row (by book_tag + section number). Query flashcards for
   that chapter's concepts: `concept_example` cards and a `problem_solution` card.
4. **Fan-out (parallel)**:
   - Case study: master prompt (Stage 1 files + preferred_context) -> .tex ->
     tectonic (tools/tectonic.exe, child_process, cwd runs/<id>/) -> PDF. Nonzero
     exit: one retry with the compile log appended to the conversation, then fail
     honestly. Always generated fresh.
   - Concept cards: cache hit -> serve; miss -> concept prompt -> zod-validate ->
     insert (concept rows + flashcard rows, front/back format 'json') -> serve.
   - Practice deck: cache hit -> serve; miss -> practice prompt -> zod-validate ->
     insert as card_type 'problem_solution' attached to the section's first concept
     row: the first concept generated this run, else the chapter's lowest-id
     existing concept, else a new concept row named after the section topic
     (front_content = problem object JSON, back_content = full deck JSON) -> serve.
5. Results page reads the run record and renders the three tabs.

LLM config: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (default `claude-sonnet-5`)
from `.env.local`. **Mock mode**: `MOCK_LLM=1` swaps every LLM call for fixture
responses under `webapp/fixtures/` (a full happy-path run recorded by hand from the
repo's existing artifacts), so the entire pipeline, DB writes included, runs and is
testable with no key. Fixtures cover: Stage 1 package, critic pass, one .tex case,
one concept-cards JSON, one practice-deck JSON, plus one invalid-JSON variant each
for retry-path tests.

Error policy: every stage writes its status (pending/running/done/failed + message)
to the run record; the UI shows failures plainly; no stage fabricates success.
DB unreachable: flashcard stages degrade to generate-without-cache and the results
page shows a "cache offline" note; in mock mode without DB the cards still render.

## 4. MySQL integration

- Reuse flashcards_db/ compose stack (mysql:8.4, localhost, existing dev creds).
- **DB emptied of legacy content** (user decision July 29): delete
  `init/03_concept_cards.sql` (75 v1 cards + 75 concepts) from init; keep
  01_schema.sql (six-table core, UNCHANGED) and 02_seed.sql (subject/textbook/
  chapter/LO hierarchy, needed to attach new cards). Going forward the DB holds
  only pipeline-generated JSON cards. Legacy cards remain in git history.
- Card storage: front_format/back_format 'json'. concept_example: front_content =
  card.front JSON + concept_name + source, back_content = card.back JSON.
  problem_solution: front_content = problem object, back_content = full animation
  deck JSON. format_version is implicit in this new content (the webapp is the only
  reader); no schema change.
- Concept rows are created by the pipeline on insert (name from concept_name,
  lo_id resolved from source.lo_ordinal via the chapter's LO list, else the
  chapter's first LO with a review flag in the run log).
- webapp connects via mysql2 pool; creds in .env.local.

## 5. Web UI

Design system lifted from the animation renderer page and applied everywhere:
dark navy #07111f background with the two radial glows, glass panels
rgba(15,29,49,.92) with 24px radius and 1px rgba(255,255,255,.12) borders,
accents #7ca7ff / #aa91ff, success #8be0b1, warning #ffd38a, Inter, the same
progress-bar and eyebrow/step-title typography. MathJax v4 (CDN, tex-chtml) for
all math rendering.

Pages:
- **Home** (`/`): one centered panel: problem textarea (placeholder shows a sample
  problem), optional subject line, theme input with suggestion chips (Soccer,
  Architecture, Music, Cooking, Space, ...), Run button.
- **Run** (`/runs/[id]`): stage checklist (Understand problem -> Verify math ->
  Case study / Concept cards / Practice deck) with live status via polling, honest
  error panels, auto-forward to results when done.
- **Results** (`/runs/[id]/results`): one shell, three tabs:
  - *Case Study*: embedded PDF (iframe/object) + download button.
  - *Concept Cards*: responsive card grid; each card flips on click; front navy
    with ivory text (title, subtitle, divider, central math, variable key,
    descriptions, "Flip for a worked example"), back ivory with navy text
    (Worked Example, question in blue, divider, steps, bold final answer, blue
    footer). Fully rendered from JSON via MathJax, mirroring the deck design.
  - *Practice Deck*: the animation stage adapted:
    - Controls: "← Previous", "Next →", "Final Slide ⇥" only. No play/pause, no
      reset, no speed. Keyboard ← / → kept, plus End for final slide.
    - Step counter + progress bar kept. Slide-entry animations kept.
    - Right sidebar: Current Problem card + slides-overview list (all step titles,
      clickable, active highlighted, NO internal max-height/scrollbox). JSON
      textarea, Apply/Load buttons, and status line removed.
    - Below the stage: single "Key Equations & Formulas" panel (open list, no
      accordion needed for one group, each item keeps its View Step jump button).
- Scrollability rule: no fixed-height internal scroll regions anywhere; content
  flows and the page scrolls as one. `overflow-x: auto` remains only on individual
  equation containers as a last-resort for very wide math at narrow widths.

## 6. Repo reorganization

Deleted (git rm; all recoverable from history):
- prompts/: p1, p2, p3, universal_case_study_prompt_v4.md,
  universal_case_study_prompt_v5.md, phase2_case_study_prompt_v1/v2/v3.md,
  phase2_flashcards_prompt_v1.md, flashcard_concept_card_prompt_v2.md
- tools/: check_flashcard_json.py, test_check_flashcard_json.py,
  generate_card_schema.py, fixtures/flashcard_json/ (the v2 contract toolchain)
- flashcards_db/card_schema_v2.json, flashcard_examples_v2/
- flashcards_db/init/03_concept_cards.sql (DB emptying)
- plan/ (all pre-existing files; this spec and its implementation plan are the new
  contents), recon/, phase1_runs/, prompt_review_request.md
- root: "Master Prompt.txt", "concept flashcards prompt.txt", "Practice Problem
  Flashcard Master Prompt .txt" (after conversion into prompts/),
  universal_case_study_prompt_v5.md and pipeline_build_plan.md (root duplicates;
  diff against tracked copies first and note anything that differs in the commit),
  chain-rule-nested-power-animation.html and derivative-animation-renderer.html
  (after the webapp replicates them; the chain-rule JSON example becomes a webapp
  fixture).

Kept: CLAUDE.md, prompts/phase1_*, references/ (corpus + PDF), cases/,
flashcards_db/ (minus the two files above), tools/ tectonic.exe +
check_phase1_package.ps1 + generate_flashcards_seed.py + the flashcard DB tools
that still serve it (import/check/render tools for the OLD decks are deleted with
the v2 toolchain ONLY where they exclusively served deleted content: keep
generate_flashcards_seed.py, delete import_concept_flashcards.py,
test_import_concept_flashcards.py, flashcard_lo_mapping.csv,
verify_flashcard_import.sql, check_blob_round_trip.py, render_flashcards.py once
the DB is emptied and the webapp renders cards), phase1example/, .claude/skills/,
OpenStax_Calculus_Volume_1_Concept_Only_Flashcards/ (untracked, UNTOUCHED until
the Drive backup exists).

New: webapp/ (Next.js app), runs/ output directory (gitignored).

## 7. Verification

- zod schemas for both flashcard JSON contracts at the API boundary; invalid
  output = one retry with validation errors appended, then honest failure.
- tectonic exit 0 = the PDF gate; compile log stored in the run record.
- Phase-1 critic calibration gate kept as-is.
- Mock-mode end-to-end test: `npm test` runs unit tests (validators, cache logic,
  callout/style mapping) plus a scripted mock run that exercises
  POST -> stages -> DB insert -> cache hit on second run -> results payload.
- DB negative controls preserved: duplicate card type and phantom concept inserts
  must still be rejected by the schema.
- Live-key smoke test deferred until Peter supplies the API key (flagged in
  CLAUDE.md backlog).

## 8. Out of scope (explicit)

- No auth, no multi-user run history UI, no deployment config (localhost demo).
  Deployment TARGET decided July 29 (Hitaansh): Render free tier as a single
  Docker web service (Vercel rejected: serverless kills the long-running
  pipeline, the tectonic child process, and disk-backed runs/). Needs a Linux
  tectonic binary via TECTONIC_PATH and a hosted MySQL (Render free DB is
  Postgres-only; candidates Aiven / TiDB Cloud serverless). Deferred until the
  API key exists; backlogged in CLAUDE.md.
- No GIF export of decks; browser JSON is the settled animation format.
- No graph/diagram generation inside concept cards (v1: formula/prose cards).
- No regeneration of the 75 legacy decks; they live in git history and the
  untracked PPTX folder only.
- MathGPT production integration (their renderer, their MySQL conventions) stays
  future work; the schema is unchanged partly for that reason.

## 9. Cleanup notes

Two root-level files were duplicates of tracked files in `prompts/` and `plan/`. Task 1 diffed them before deletion to check for substantive changes.

**universal_case_study_prompt_v5.md (root) vs prompts/universal_case_study_prompt_v5.md**: substantive changes in 237 lines of diff output (approximately 60 lines of actual content changes after filtering hunks). Key changes include: updated P1-P8 playbook derivation rules with expanded examples and clearer scope fence; refined the twelve invariants with better wording (e.g., invariant 3 "trap materiality" criterion, invariant 6 time budget, invariant 10 verdict-first); added guidance on reference data in data blocks; improved hint concealment examples; relaxed page-count rule to budgets; and clarified the derive-then-generate playbook emission. These reflect the refinements from the July 2 external review and subsequent team convergence.

**pipeline_build_plan.md (root) vs plan/pipeline_build_plan.md**: substantive changes in 33 lines of diff output. Key changes: version references updated from v4 to v5 (now the single-shot manual prompt); clarified that the pipeline adapts IMathAS recon ideas; adjusted stage descriptions to reference v5 invariants and playbooks; and added harvest fixtures from v4 review. The root file was an older snapshot; tracked file is current.

