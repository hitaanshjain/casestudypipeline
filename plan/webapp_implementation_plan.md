# Web App + Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js web app that runs the full pipeline (problem + theme in; case-study PDF, concept flashcards, practice slideshow out, with MySQL flashcard caching), rewrite the three production prompts, and clean the repo down to what the pipeline uses.

**Architecture:** Next.js App Router app in `webapp/` does everything server-side: Anthropic SDK calls (with a MOCK_LLM fixture mode since no API key exists yet), a read-only tool loop over `references/`, tectonic compiles, and mysql2 access to the existing `flashcards_db` compose stack. The spec is `plan/webapp_pipeline_design.md`; read it before any task.

**Tech Stack:** Next.js 15 (App Router, TypeScript), zod, @anthropic-ai/sdk, mysql2, vitest, MathJax v4 (CDN), tools/tectonic.exe, mysql:8.4 via Docker.

## Global Constraints

- Platform: Windows 11. Shell commands in plan are Git Bash unless marked PowerShell. Repo root: `C:\Users\hitaa\Downloads\MathGPT`.
- Commit after every task, message is ONE line, no trailers, no Co-Authored-By (project rule).
- NEVER touch `OpenStax_Calculus_Volume_1_Concept_Only_Flashcards/` (only copy anywhere).
- No em dashes in any text written for the user or docs.
- Prompt files start at their first contract tag, no markdown title header.
- Model default `claude-sonnet-5`; key from `ANTHROPIC_API_KEY`; `MOCK_LLM=1` must make every pipeline path runnable without a key.
- The DB schema files `flashcards_db/init/01_schema.sql` and `02_seed.sql` are UNCHANGED by this work. Only `03_concept_cards.sql` is deleted.
- `.tex` artifacts must compile with `tools/tectonic.exe` exit 0.
- All new webapp code lives under `webapp/`; generated run artifacts under `runs/` (gitignored).

---

### Task 1: Repo cleanup round 1 + prompt file moves

**Files:**
- Delete (git rm): `prompts/p1`, `prompts/p2`, `prompts/p3`, `prompts/universal_case_study_prompt_v4.md`, `prompts/universal_case_study_prompt_v5.md`, `prompts/phase2_case_study_prompt_v1.md`, `prompts/phase2_case_study_prompt_v2.md`, `prompts/phase2_case_study_prompt_v3.md`, `prompts/phase2_flashcards_prompt_v1.md`, `prompts/flashcard_concept_card_prompt_v2.md`, `tools/check_flashcard_json.py`, `tools/test_check_flashcard_json.py`, `tools/generate_card_schema.py`, `tools/fixtures/` (whole dir), `flashcards_db/card_schema_v2.json`, `flashcard_examples_v2/` (whole dir), `flashcards_db/init/03_concept_cards.sql`, `recon/` (whole dir), `prompt_review_request.md`, and every file in `plan/` EXCEPT `webapp_pipeline_design.md` and `webapp_implementation_plan.md`.
- Delete (untracked, plain rm, AFTER diffing): root `universal_case_study_prompt_v5.md`, root `pipeline_build_plan.md`.
- Move (untracked -> tracked): `Master Prompt.txt` -> `prompts/case_study_master_prompt.md`, `concept flashcards prompt.txt` -> `prompts/concept_flashcards_prompt.md`, `Practice Problem Flashcard Master Prompt .txt` -> `prompts/practice_deck_prompt.md` (content verbatim in this task; rewrites are Tasks 2-4).
- Modify: `flashcards_db/README.md` (remove references to 03_concept_cards.sql and the 75 imported cards; state the DB now starts empty of cards and is populated by the web app).
- DO NOT delete yet (needed by later tasks, removed in Task 12): `phase1_runs/`, `chain-rule-nested-power-animation.html`, `derivative-animation-renderer.html`, `tools/render_flashcards.py`, `tools/import_concept_flashcards.py`, `tools/test_import_concept_flashcards.py`, `tools/flashcard_lo_mapping.csv`, `tools/verify_flashcard_import.sql`, `tools/check_blob_round_trip.py`.

**Interfaces:**
- Produces: the three prompt files at their new `prompts/` paths (Tasks 2-4 edit them in place).

- [ ] **Step 1: Diff the two root duplicates against their tracked counterparts and save the diffs**

```bash
cd /c/Users/hitaa/Downloads/MathGPT
diff "universal_case_study_prompt_v5.md" "prompts/universal_case_study_prompt_v5.md" > /tmp/v5_root_diff.txt; wc -l /tmp/v5_root_diff.txt
diff "pipeline_build_plan.md" "plan/pipeline_build_plan.md" > /tmp/pbp_root_diff.txt; wc -l /tmp/pbp_root_diff.txt
```
Read both diffs. If either contains substantive content (not whitespace/line endings), quote the substantive hunks in the Task 1 commit message body is NOT allowed (one-line messages); instead append a short note to `plan/webapp_pipeline_design.md` under a new "## 9. Cleanup notes" heading describing what differed. If only whitespace differs, no note.

- [ ] **Step 2: Move the three prompts to their new names**

```bash
mv "Master Prompt.txt" prompts/case_study_master_prompt.md
mv "concept flashcards prompt.txt" prompts/concept_flashcards_prompt.md
mv "Practice Problem Flashcard Master Prompt .txt" prompts/practice_deck_prompt.md
```

- [ ] **Step 3: Delete the tracked files**

```bash
git rm -q prompts/p1 prompts/p2 prompts/p3 \
  prompts/universal_case_study_prompt_v4.md prompts/universal_case_study_prompt_v5.md \
  prompts/phase2_case_study_prompt_v1.md prompts/phase2_case_study_prompt_v2.md \
  prompts/phase2_case_study_prompt_v3.md prompts/phase2_flashcards_prompt_v1.md \
  prompts/flashcard_concept_card_prompt_v2.md \
  flashcards_db/card_schema_v2.json flashcards_db/init/03_concept_cards.sql \
  prompt_review_request.md
git rm -rq flashcard_examples_v2 recon tools/fixtures
git rm -q tools/check_flashcard_json.py tools/test_check_flashcard_json.py tools/generate_card_schema.py
cd plan && ls | grep -v -E '^(webapp_pipeline_design|webapp_implementation_plan)\.md$' | xargs -d '\n' git rm -q && cd ..
rm "universal_case_study_prompt_v5.md" "pipeline_build_plan.md"
```
Note: `tools/check_flashcard_json.py` etc. were tracked via `git add -f` (tools/ is gitignored), so `git rm` works; if any path errors as untracked, `rm` it instead.

- [ ] **Step 4: Update flashcards_db/README.md**

Open it, remove/replace any text describing 03_concept_cards.sql, the 75 cards, or LaTeX-format placeholder cards. Add one short paragraph: the DB initializes with schema + hierarchy only (45 sections, 195 LOs, zero cards); cards are inserted by the pipeline web app in `webapp/` as JSON-format `concept_example` and `problem_solution` rows.

- [ ] **Step 5: Verify tree state**

```bash
git status --short
ls prompts/
```
Expected: prompts/ contains exactly `case_study_master_prompt.md`, `concept_flashcards_prompt.md`, `practice_deck_prompt.md`, `phase1_generator_prompt_v1.md`, `phase1_critic_prompt_v1.md`. Untracked leftovers at root: only the two HTML files, `phase1_runs/` content unchanged, the PPTX folder untouched.

- [ ] **Step 6: Commit**

```bash
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards'
git commit -m "Adopt the three team prompts as the production set and clear superseded prompts, plans, recon, and the legacy card seed"
```

---

### Task 2: Edit case_study_master_prompt.md (preferred_context)

**Files:**
- Modify: `prompts/case_study_master_prompt.md`

**Interfaces:**
- Produces: an `<input_files>` section that also documents `preferred_context`, consumed by the pipeline (Task 9) as a plain string substituted into the user message.

- [ ] **Step 1: Add preferred_context to the input contract**

In `<input_files>`, after the optional-files list, add:

```
Optional run parameter:
- preferred_context: a scenario domain requested by the student (for example
  soccer, architecture, music). It arrives as plain text alongside the files.
```

- [ ] **Step 2: Integrate with anti-anchoring**

At the TOP of `<anti_anchoring_requirement>` add:

```
PREFERRED CONTEXT OVERRIDE

When a preferred_context is supplied, set the scenario in that domain, provided
the central concept can honestly and materially matter there. Quantities,
constraints, and the decision must still arise naturally from the situation.

If the mathematics cannot honestly live in the requested domain, use the closest
related domain that works, and state the substitution in one LaTeX comment line
(% CONTEXT NOTE: ...) above \documentclass.

Everything below governs scenario choice only when no preferred_context is
supplied.
```

- [ ] **Step 3: Reconcile the strip test**

In `<case_design_principles>` under CONTEXT MUST CONSTRAIN, append one sentence: "A preferred_context does not weaken this test: the requested domain must still constrain the mathematics, not decorate it."

- [ ] **Step 4: Verify and commit**

Re-read the edited sections; check the file still starts at `<role>`, contains no markdown title header, and `grep -c "preferred_context" prompts/case_study_master_prompt.md` returns at least 3.

```bash
git add prompts/case_study_master_prompt.md
git commit -m "Add the optional preferred_context input to the case study master prompt"
```

---

### Task 3: Rewrite concept_flashcards_prompt.md (JSON output)

**Files:**
- Rewrite: `prompts/concept_flashcards_prompt.md` (full replacement)

**Interfaces:**
- Produces: a prompt whose only output is one JSON object matching `ConceptCardsPayload` in `webapp/lib/contracts.ts` (Task 6). The JSON shape in this prompt MUST byte-for-byte match the field names in spec section 2b.

- [ ] **Step 1: Rewrite the file**

Replace the entire content. Structure (all tags, in order): `<role>`, `<input>`, `<scope_contract>`, `<concept_only_inventory_contract>`, `<concept_separation_gate>`, `<card_content_contract>`, `<provenance_gates>`, `<output_contract>`, `<final_instruction>`.

Content rules to carry over from the original (rephrased for JSON, no PPTX/geometry/fonts/ZIP/URL-traversal):
- role: expert textbook-content analyst + instructional designer; cards for struggling students; correctness > fidelity > coverage > complete reasoning > bold final answers.
- input: the pipeline supplies `primary.md` (required), `supporting_*.md` (optional), the section's learning objectives list, and the source problem text. No web access; the supplied extracts are the sole instructional authority; do not expand the curriculum from memory.
- scope: create cards ONLY for distinct reusable concepts substantively taught in the supplied extracts AND relevant to the source problem. Typically 2 to 6 cards. Merge duplicates/restatements; no cards for worked examples, warnings, proofs, or one-off applications.
- concept separation gate: title, subtitle, central statement, variable key, descriptions, question, solution, final answer, and footer must all teach the SAME concept at the same scope.
- card content: front = one-line title (max 60 chars), 2-4 word subtitle (no generic wording like Core Concept), exactly one of central_latex OR central_prose, variable key defining every symbol used (empty array allowed only when no topic-specific notation appears), one main description (max 14 words), one supporting description (max 17 words). Back = complete self-contained question (givens + task, solvable without the textbook), 3-8 solution steps each doing one meaningful move (latex and/or prose per step), fully explicit final answer in final_answer_latex including units/conditions, concept-specific footer (max 12 words, no generic motivation).
- provenance: every number/symbol in the solution is given in the question, defined in the variable key, or derived in a prior step; final answer values must appear derived, never out of nowhere; question, steps, and answer must agree.
- visuals: this format has no drawn graphs. Prefer concepts teachable through formulas, text, and calculation. When a concept in scope genuinely requires a drawn graph to teach, do NOT force a degraded card: list it in `skipped_concepts` with a reason.
- LaTeX rules: no `$` delimiters in latex fields; inline math inside prose fields uses `\( \)`; no `\textcolor`/`\colorbox`; no environments (`\begin{...}`); `^{}`/`_{}` always braced.
- output: EXACTLY one JSON object, no markdown fences, no commentary. Schema (copy verbatim into the prompt):

```json
{
  "cards": [
    {
      "concept_name": "string",
      "front": {
        "title": "string, max 60 chars",
        "subtitle": "string, 2-4 words",
        "central_latex": "string LaTeX or null",
        "central_prose": "string or null (exactly one of the two is non-null)",
        "variable_key": [ { "symbol": "LaTeX", "meaning": "string" } ],
        "description_main": "string, max 14 words",
        "description_support": "string, max 17 words"
      },
      "back": {
        "question": "string, inline math as \\( \\)",
        "steps": [ { "latex": "string or null", "prose": "string or null" } ],
        "final_answer_latex": "string LaTeX",
        "footer": "string, max 12 words"
      },
      "source": { "book_tag": "string", "section": "string", "lo_ordinal": 1 }
    }
  ],
  "skipped_concepts": [ { "name": "string", "reason": "string" } ]
}
```

- final_instruction: derive the concept inventory from the supplied extracts, apply the gates, emit the single JSON object and nothing else; if the extracts teach nothing card-worthy for the problem, emit `{"cards": [], "skipped_concepts": [...]}` with reasons, never invent content.

- [ ] **Step 2: Verify and commit**

Checks: file starts at `<role>`; `grep -c "pptx\|PowerPoint\|ZIP\|URL" prompts/concept_flashcards_prompt.md` returns 0 (case-insensitive grep -ci); the JSON block parses (paste into `node -e "JSON.parse(...)"` after stripping the comment-ish value text is NOT required; instead verify field names against spec 2b by eye: concept_name, front.title, front.subtitle, front.central_latex, front.central_prose, front.variable_key[].symbol/meaning, front.description_main, front.description_support, back.question, back.steps[].latex/prose, back.final_answer_latex, back.footer, source.book_tag/section/lo_ordinal).

```bash
git add prompts/concept_flashcards_prompt.md
git commit -m "Rewrite the concept flashcards prompt for pipeline JSON output"
```

---

### Task 4: Rewrite practice_deck_prompt.md (animation schema)

**Files:**
- Rewrite: `prompts/practice_deck_prompt.md` (full replacement)
- Reference (read, do not modify): `chain-rule-nested-power-animation.html` lines 563-955 (the embedded JSON example)

**Interfaces:**
- Produces: a prompt whose only output is one JSON object matching `PracticeDeck` in `webapp/lib/contracts.ts` (Task 6): schemaVersion "1.1", renderer id "math-animation-dark-sidebar", steps with equations/cards/callout, reference with equations ONLY.

- [ ] **Step 1: Rewrite the file**

Structure: `<role>`, `<input>`, `<goal>`, `<deck_structure>`, `<json_schema>`, `<field_rules>`, `<content_rules>`, `<process>`, `<output_contract>`.

Carry over from the original prompt: original problem never copied from the textbook; textbook is the authority for notation/method/difficulty; subject scopes the skill, no drift; 4-7 steps, one slide per major reasoning move, never combine two major moves, never split one; no method previews in the problem prompt; each step explains why, not just what; independent verification before writing JSON (alternate method / substitute back), surfaced in the final step; clean values unless ugly ones teach something.

New input contract: the pipeline supplies the Stage 1 files (primary.md, question.txt, verified_answer.txt) plus the topic; textbook = the PRIMARY section's conventions; subject = the source problem's central skill. The generated problem must be fresh (not the source problem, not a reskin).

New schema section (copy into the prompt verbatim):

```json
{
  "schemaVersion": "1.1",
  "renderer": { "id": "math-animation-dark-sidebar", "version": "1.1.0" },
  "animationId": "kebab-case-unique-id",
  "title": "string, deck title",
  "subtitle": "string, one line",
  "problem": {
    "prompt": "string, plain-text task framing, no method names",
    "latex": "string LaTeX, the problem statement",
    "answerLatex": "string LaTeX, the final answer(s)"
  },
  "steps": [
    {
      "id": "kebab-case-step-id",
      "title": "string, short step name",
      "caption": "string, one-sentence why/what for this step",
      "equations": [
        { "label": "string, short uppercase-ish label", "latex": "string LaTeX", "style": "primary | rule | secondary | final" }
      ],
      "cards": [
        { "label": "string", "latex": "string LaTeX", "tone": "blue | violet" }
      ],
      "callout": { "type": "goal | tip | memory | check | warning | success", "title": "string", "text": "string" }
    }
  ],
  "reference": {
    "equations": [
      { "title": "string", "latex": "string LaTeX", "text": "string, when/why this formula applies", "stepId": "id of the step that uses it" }
    ]
  }
}
```

Field rules: 4-7 steps; first step restates/reads the problem (style primary); exactly the LAST step carries the boxed final answer as an equation with style "final" (`\boxed{...}`) plus a short verification row (style secondary); `callout` is optional per step (omit the key or use null), only when it adds judgment; callout type mapping from teaching intent: goal = what we are trying to do, tip = shortcut/efficiency, memory = a cue worth memorizing, check = verify a condition or result, warning = common mistake, success = confirmed result; cards are for side-by-side comparisons (correct vs incomplete, two sub-derivatives), 0 or 2 per step; equation `style`: "rule" for a general formula being invoked, "primary" for the main line of working, "secondary" for supporting computation, "final" only in the last step; `reference.equations` lists every general formula the solution invokes (3-6 items), each pointing at the step that uses it via stepId; NO other reference groups exist; NO narration, durationMs, settings, autoPlay, or highlights fields anywhere; no `$` delimiters; no color commands; `^{}`/`_{}` braced.

Output contract: exactly one JSON object, no fences, no commentary.

- [ ] **Step 2: Verify and commit**

Checks: `grep -ciE "narration|durationMs|autoPlay|highlight|colorbox|pptx" prompts/practice_deck_prompt.md` returns 0; the schema block's field names match Task 6's `PracticeDeck` zod schema; file starts at `<role>`.

```bash
git add prompts/practice_deck_prompt.md
git commit -m "Rewrite the practice deck prompt to emit the web animation JSON schema"
```

---

### Task 5: Next.js scaffold + design system + gitignore

**Files:**
- Create: `webapp/` via create-next-app, then `webapp/app/globals.css`, `webapp/app/layout.tsx`, `webapp/components/MathJaxProvider.tsx`, `webapp/lib/paths.ts`
- Modify: root `.gitignore`
- Reference: `chain-rule-nested-power-animation.html` lines 20-503 (the CSS to port)

**Interfaces:**
- Produces: `webapp/lib/paths.ts` exporting `REPO_ROOT`, `RUNS_DIR`, `PROMPTS_DIR`, `REFERENCES_DIR`, `TECTONIC` (used by Tasks 7-9). CSS custom properties and utility classes `.panel`, `.eyebrow`, `.btn`, `.btn-primary` (used by Tasks 10-11).

- [ ] **Step 1: Scaffold**

```bash
cd /c/Users/hitaa/Downloads/MathGPT
npx --yes create-next-app@latest webapp --ts --app --no-tailwind --eslint --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
cd webapp && npm install zod @anthropic-ai/sdk mysql2 && npm install -D vitest
```
If create-next-app prompts anyway, answer: TypeScript yes, ESLint yes, Tailwind no, src dir no, App Router yes, alias `@/*`.

- [ ] **Step 2: Root .gitignore additions**

Append to the ROOT `.gitignore` (keep existing lines):

```
runs/
webapp/node_modules/
webapp/.next/
webapp/.env.local
webapp/next-env.d.ts
```

- [ ] **Step 3: Port the design system into globals.css**

Replace `webapp/app/globals.css` with the design tokens and shared pieces ported from the reference HTML (read its `<style>` block and copy verbatim where possible): the `:root` variables (--bg #07111f, --panel #0f1d31, --panel-2 #14243b, --text #f7f9fc, --muted #aebbd0, --accent #7ca7ff, --accent-2 #aa91ff, --success #8be0b1, --warning #ffd38a, --border rgba(255,255,255,.12), --shadow), the body background with both radial gradients, Inter font stack, `* { box-sizing: border-box }`, and these shared classes copied from the reference: `.panel` (= the reference `.stage-shell, .sidebar` styling: rgba(15,29,49,.92) bg, 1px border, 24px radius, shadow, blur), `.eyebrow`, `.progress-track`/`.progress-fill`, `.callout` family with `.callout-icon`, `.equation-stack`/`.equation-row` with `rule|primary|final` variants, `.cards`/`.math-card` with `blue|violet`, `.timeline` family BUT with `max-height` and `overflow` REMOVED (spec: no internal scrollboxes), button styling from `.controls button` as `.btn` and `.controls button.primary` as `.btn-primary`, and the two media queries adapted (drop rules for removed elements).

- [ ] **Step 4: Layout + MathJax provider**

`webapp/app/layout.tsx`: html/body wrapper, metadata title "MathGPT Case Study Pipeline", loads globals.css, renders `<MathJaxProvider>{children}</MathJaxProvider>`.

`webapp/components/MathJaxProvider.tsx` (client component):

```tsx
"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const MathJaxReady = createContext(false);
export function useMathJaxReady() { return useContext(MathJaxReady); }

export default function MathJaxProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (window as any).MathJax = {
      tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
      chtml: { scale: 1.05, displayAlign: "center" },
      startup: { pageReady: () => (window as any).MathJax.startup.defaultPageReady().then(() => setReady(true)) },
    };
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js";
    s.defer = true;
    document.head.appendChild(s);
  }, []);
  return <MathJaxReady.Provider value={ready}>{children}</MathJaxReady.Provider>;
}
```

Also create `webapp/components/Math.tsx`, the one place math is typeset:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useMathJaxReady } from "./MathJaxProvider";

export function MathBlock({ latex, inline = false }: { latex: string; inline?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = inline ? `\\(${latex}\\)` : `\\[${latex}\\]`;
    if (ready) (window as any).MathJax?.typesetPromise?.([ref.current]).catch(() => {});
  }, [latex, inline, ready]);
  return <span ref={ref} />;
}

export function Prose({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = text;
    if (ready) (window as any).MathJax?.typesetPromise?.([ref.current]).catch(() => {});
  }, [text, ready]);
  return <span ref={ref} />;
}
```
(`textContent` assignment keeps user/model text inert; MathJax then scans the node. Never use dangerouslySetInnerHTML for model output.)

- [ ] **Step 5: paths.ts**

```ts
// webapp/lib/paths.ts
import path from "path";
export const REPO_ROOT = path.resolve(process.cwd(), "..");
export const RUNS_DIR = process.env.RUNS_DIR ?? path.join(REPO_ROOT, "runs");
export const PROMPTS_DIR = path.join(REPO_ROOT, "prompts");
export const REFERENCES_DIR = path.join(REPO_ROOT, "references");
export const TECTONIC = process.env.TECTONIC_PATH ?? path.join(REPO_ROOT, "tools", "tectonic.exe");
```

- [ ] **Step 6: Build check and commit**

```bash
cd webapp && npm run build
```
Expected: build succeeds (default pages fine for now).

```bash
cd .. && git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Scaffold the Next.js webapp with the shared dark design system and MathJax provider"
```

---

### Task 6: Contracts (zod) + fixtures + validator tests

**Files:**
- Create: `webapp/lib/contracts.ts`, `webapp/vitest.config.ts`, `webapp/tests/contracts.test.ts`
- Create fixtures: `webapp/fixtures/stage1/{primary.md,supporting_01.md,supporting_02.md,lo_mapping.json,verified_answer.txt}` (copied from `phase1_runs/water_tank/`), `webapp/fixtures/critic_ok.json`, `webapp/fixtures/case_study.tex` (copied from `cases/tests/test_phase1_e2e_water_tank_case.tex`), `webapp/fixtures/concept_cards.json`, `webapp/fixtures/concept_cards_invalid.json`, `webapp/fixtures/practice_deck.json` (transformed from the chain-rule HTML's embedded JSON), `webapp/fixtures/practice_deck_invalid.json`

**Interfaces:**
- Produces: `ConceptCardsPayload`, `PracticeDeck` zod schemas + inferred types `TConceptCardsPayload`, `TPracticeDeck`; consumed by Tasks 7 (db), 9 (pipeline), 11 (UI props).

- [ ] **Step 1: Copy file-based fixtures**

```bash
mkdir -p webapp/fixtures/stage1
cp phase1_runs/water_tank/primary.md phase1_runs/water_tank/supporting_01.md phase1_runs/water_tank/supporting_02.md phase1_runs/water_tank/lo_mapping.json phase1_runs/water_tank/verified_answer.txt webapp/fixtures/stage1/
cp cases/tests/test_phase1_e2e_water_tank_case.tex webapp/fixtures/case_study.tex
```
If any filename differs (list the directory first), use what exists; the five Stage 1 roles must all be present. `critic_ok.json`: write `{"status": "pass", "notes": "fixture critic approval"}`.

- [ ] **Step 2: Build practice_deck.json from the chain-rule embedded JSON**

Extract the JSON between `<script id="animation-data" ...>` and `</script>` in `chain-rule-nested-power-animation.html`. Transform with a throwaway node script: delete `settings`; delete `narration` and `durationMs` from every step; keep `callout`s; in `reference` keep ONLY the `equations` array (drop tips/shortcuts/tricks/commonMistakes/checks); write pretty-printed to `webapp/fixtures/practice_deck.json`.

`practice_deck_invalid.json`: copy of the valid one with `"steps": []`.

- [ ] **Step 3: Write concept_cards.json (hand-authored, must pass the Task 6 schema)**

```json
{
  "cards": [
    {
      "concept_name": "Net Change Theorem",
      "front": {
        "title": "The Net Change Theorem",
        "subtitle": "Accumulated Change",
        "central_latex": "F(b)=F(a)+\\int_{a}^{b} F'(x)\\,dx",
        "central_prose": null,
        "variable_key": [
          { "symbol": "F(a)", "meaning": "starting quantity" },
          { "symbol": "F'(x)", "meaning": "rate of change" }
        ],
        "description_main": "A quantity's new value is its start plus accumulated change.",
        "description_support": "Integrate the rate over the interval, then add the starting amount.",
      "back": {
        "question": "Water flows into a tank at \\( r(t)=6t \\) liters per hour. The tank starts with 40 liters. How much water is in the tank after 4 hours?",
        "steps": [
          { "latex": "V(4)=V(0)+\\int_{0}^{4} 6t\\,dt", "prose": "Apply the net change theorem with the given rate." },
          { "latex": "\\int_{0}^{4} 6t\\,dt=\\left[3t^{2}\\right]_{0}^{4}=48", "prose": "Evaluate the definite integral." },
          { "latex": "V(4)=40+48=88", "prose": "Add the accumulated change to the starting amount." }
        ],
        "final_answer_latex": "V(4)=88\\ \\text{liters}",
        "footer": "Rate integrated over time gives change, not total."
      },
      "source": { "book_tag": "openstax_calc1", "section": "5.4", "lo_ordinal": 1 }
    }
  ],
  "skipped_concepts": []
}
```
NOTE the deliberate structural check: as pasted above the `front` object is missing its closing brace before `"back"`. Fix that when writing the file (add `},` after the description_support line); the file MUST be valid JSON and pass the schema. Add a second card ("Average Value of a Function", central_latex `f_{avg}=\\frac{1}{b-a}\\int_{a}^{b} f(x)\\,dx`, same shape, a small worked example with clean numbers you verify by hand).

`concept_cards_invalid.json`: copy with the first card's `final_answer_latex` key deleted.

- [ ] **Step 4: Write contracts.ts**

```ts
// webapp/lib/contracts.ts
import { z } from "zod";

const noDollar = (s: string) => !s.includes("$");
const latexField = z.string().min(1).refine(noDollar, "no $ delimiters in latex fields");

export const VariableKeyEntry = z.object({
  symbol: z.string().min(1),
  meaning: z.string().min(1),
});

export const ConceptCardFront = z
  .object({
    title: z.string().min(1).max(60),
    subtitle: z.string().min(1),
    central_latex: latexField.nullable(),
    central_prose: z.string().min(1).nullable(),
    variable_key: z.array(VariableKeyEntry).max(8),
    description_main: z.string().min(1),
    description_support: z.string().min(1),
  })
  .refine((f) => (f.central_latex === null) !== (f.central_prose === null), {
    message: "exactly one of central_latex / central_prose must be non-null",
  });

export const ConceptCardStep = z
  .object({ latex: latexField.nullable(), prose: z.string().min(1).nullable() })
  .refine((s) => s.latex !== null || s.prose !== null, { message: "step needs latex or prose" });

export const ConceptCardBack = z.object({
  question: z.string().min(1),
  steps: z.array(ConceptCardStep).min(1).max(10),
  final_answer_latex: latexField,
  footer: z.string().min(1),
});

export const ConceptCard = z.object({
  concept_name: z.string().min(1),
  front: ConceptCardFront,
  back: ConceptCardBack,
  source: z.object({
    book_tag: z.string().min(1),
    section: z.string().min(1),
    lo_ordinal: z.number().int().positive().nullable(),
  }),
});

export const ConceptCardsPayload = z.object({
  cards: z.array(ConceptCard),
  skipped_concepts: z.array(z.object({ name: z.string(), reason: z.string() })).optional(),
});

export const DeckEquation = z.object({
  label: z.string(),
  latex: latexField,
  style: z.enum(["primary", "rule", "secondary", "final"]),
});
export const DeckSideCard = z.object({
  label: z.string(),
  latex: latexField,
  tone: z.enum(["blue", "violet"]),
});
export const DeckCallout = z.object({
  type: z.enum(["goal", "tip", "memory", "check", "warning", "success"]),
  title: z.string().min(1),
  text: z.string().min(1),
});
export const DeckStep = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  caption: z.string(),
  equations: z.array(DeckEquation),
  cards: z.array(DeckSideCard),
  callout: DeckCallout.nullable().optional(),
});

export const PracticeDeck = z
  .object({
    schemaVersion: z.literal("1.1"),
    renderer: z.object({ id: z.literal("math-animation-dark-sidebar"), version: z.string() }),
    animationId: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    problem: z.object({ prompt: z.string().min(1), latex: latexField, answerLatex: latexField }),
    steps: z.array(DeckStep).min(3).max(10),
    reference: z.object({
      equations: z.array(z.object({ title: z.string().min(1), latex: latexField, text: z.string(), stepId: z.string() })),
    }),
  })
  .superRefine((deck, ctx) => {
    const last = deck.steps[deck.steps.length - 1];
    if (!last.equations.some((e) => e.style === "final")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "last step must contain a style:'final' equation" });
    }
    const ids = new Set(deck.steps.map((s) => s.id));
    for (const r of deck.reference.equations) {
      if (!ids.has(r.stepId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `reference stepId '${r.stepId}' matches no step` });
      }
    }
  });

export type TConceptCardsPayload = z.infer<typeof ConceptCardsPayload>;
export type TConceptCard = z.infer<typeof ConceptCard>;
export type TPracticeDeck = z.infer<typeof PracticeDeck>;

export function parseModelJson<T>(schema: z.ZodType<T>, raw: string): { ok: true; data: T } | { ok: false; error: string } {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) text = fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return { ok: false, error: "no JSON object found in model output" };
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    const result = schema.safeParse(parsed);
    if (result.success) return { ok: true, data: result.data };
    return { ok: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  } catch (e) {
    return { ok: false, error: `JSON.parse failed: ${(e as Error).message}` };
  }
}
```

- [ ] **Step 5: vitest config + failing tests**

`webapp/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
```

Add `"test": "vitest run"` to webapp/package.json scripts.

`webapp/tests/contracts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { ConceptCardsPayload, PracticeDeck, parseModelJson } from "../lib/contracts";

const read = (p: string) => readFileSync(new URL(`../fixtures/${p}`, import.meta.url), "utf8");

describe("concept cards contract", () => {
  it("accepts the valid fixture", () => {
    expect(ConceptCardsPayload.safeParse(JSON.parse(read("concept_cards.json"))).success).toBe(true);
  });
  it("rejects the invalid fixture and names the missing field", () => {
    const r = ConceptCardsPayload.safeParse(JSON.parse(read("concept_cards_invalid.json")));
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("final_answer_latex");
  });
});

describe("practice deck contract", () => {
  it("accepts the valid fixture", () => {
    expect(PracticeDeck.safeParse(JSON.parse(read("practice_deck.json"))).success).toBe(true);
  });
  it("rejects an empty deck", () => {
    expect(PracticeDeck.safeParse(JSON.parse(read("practice_deck_invalid.json"))).success).toBe(false);
  });
  it("rejects a deck whose last step lacks a final equation", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    const last = deck.steps[deck.steps.length - 1];
    last.equations = last.equations.map((e: any) => ({ ...e, style: "primary" }));
    expect(PracticeDeck.safeParse(deck).success).toBe(false);
  });
});

describe("parseModelJson", () => {
  it("strips code fences", () => {
    const r = parseModelJson(ConceptCardsPayload, "```json\n" + read("concept_cards.json") + "\n```");
    expect(r.ok).toBe(true);
  });
  it("fails helpfully on prose", () => {
    const r = parseModelJson(ConceptCardsPayload, "I could not generate cards.");
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 6: Run tests, fix until green, commit**

```bash
cd webapp && npm test
```
Expected first run: failures if fixture JSON is malformed; fix fixtures (NOT the schema) until green. The transformed practice_deck.json has 9 steps; the schema allows up to 10 on purpose (the prompt says 4-7, the validator is lenient by design; do not tighten).

```bash
cd .. && git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the flashcard JSON contracts with fixtures and validator tests"
```

---

### Task 7: DB layer (mysql2) + integration tests on the emptied DB

**Files:**
- Create: `webapp/lib/db.ts`, `webapp/tests/db.integration.test.ts`
- Reference (read first, do not modify): `flashcards_db/init/01_schema.sql`, `flashcards_db/init/02_seed.sql`

**Interfaces:**
- Consumes: `TConceptCardsPayload`, `TPracticeDeck`, `TConceptCard` from Task 6.
- Produces (used by Task 9):
  - `resolveChapter(bookTag: string, section: string): Promise<{ chapterId: number; title: string } | null>`
  - `getCachedConceptCards(chapterId: number): Promise<TConceptCard[]>`
  - `getCachedPracticeDeck(chapterId: number): Promise<TPracticeDeck | null>`
  - `storeConceptCards(chapterId: number, payload: TConceptCardsPayload): Promise<number>`
  - `storePracticeDeck(chapterId: number, deck: TPracticeDeck, problemFront: object): Promise<void>`
  - `dbAvailable(): Promise<boolean>`
  - All throw only `DbUnavailableError` (exported) for connection-level failures.

- [ ] **Step 1: Start Docker Desktop and rebuild the DB from a fresh volume**

PowerShell:
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
Then poll `docker info` (bash: `until docker info >/dev/null 2>&1; do sleep 5; done`, cap at ~120s). Then:
```bash
cd flashcards_db && docker compose down -v && docker compose up -d && cd ..
```
Wait for healthy (`docker compose ps` or poll a query). Verify the emptied state (read compose file for the actual creds/db name and container name first):
```bash
docker exec <container> mysql -u<user> -p<pass> <db> -e "SELECT (SELECT COUNT(*) FROM chapter) chapters, (SELECT COUNT(*) FROM learning_objective) los, (SELECT COUNT(*) FROM concept) concepts, (SELECT COUNT(*) FROM flashcard) cards;"
```
Expected: 45 chapters, 195 LOs, 0 concepts, 0 cards. (Table names may differ; take them from 01_schema.sql.)

- [ ] **Step 2: Read the schema, then write db.ts**

Open `01_schema.sql` and `02_seed.sql`; adjust every identifier in the code below to the real names (table names, id columns, the chapter section identifier column, the LO text/ordinal columns, blob + format columns, card_type enum values). Skeleton (correct the identifiers, keep the shapes):

```ts
// webapp/lib/db.ts
import mysql, { Pool } from "mysql2/promise";
import type { TConceptCard, TConceptCardsPayload, TPracticeDeck } from "./contracts";

export class DbUnavailableError extends Error {}

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? "flashcards",
      password: process.env.MYSQL_PASSWORD ?? "flashcards",
      database: process.env.MYSQL_DATABASE ?? "flashcards",
      connectionLimit: 4,
    });
  }
  return pool;
}

async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows as T[];
  } catch (e: any) {
    if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "PROTOCOL_CONNECTION_LOST"].includes(e.code)) {
      throw new DbUnavailableError(e.message);
    }
    throw e;
  }
}

export async function dbAvailable(): Promise<boolean> {
  try { await q("SELECT 1"); return true; } catch { return false; }
}

export async function resolveChapter(bookTag: string, section: string) {
  const rows = await q(
    `SELECT c.id AS chapterId, c.title FROM chapter c
     JOIN textbook t ON t.id = c.textbook_id
     WHERE t.book_tag = ? AND c.title LIKE CONCAT(?, ' %')`,
    [bookTag, section]
  );
  return rows[0] ?? null;
}

export async function getCachedConceptCards(chapterId: number): Promise<TConceptCard[]> {
  const rows = await q(
    `SELECT f.front_content, f.back_content FROM flashcard f
     JOIN concept co ON co.id = f.concept_id
     JOIN learning_objective lo ON lo.id = co.lo_id
     WHERE lo.chapter_id = ? AND f.card_type = 'concept_example'`,
    [chapterId]
  );
  return rows.map((r) => {
    const front = JSON.parse(r.front_content.toString());
    return { concept_name: front.concept_name, front: front.front, back: JSON.parse(r.back_content.toString()), source: front.source };
  });
}

export async function getCachedPracticeDeck(chapterId: number): Promise<TPracticeDeck | null> {
  const rows = await q(
    `SELECT f.back_content FROM flashcard f
     JOIN concept co ON co.id = f.concept_id
     JOIN learning_objective lo ON lo.id = co.lo_id
     WHERE lo.chapter_id = ? AND f.card_type = 'problem_solution' LIMIT 1`,
    [chapterId]
  );
  return rows[0] ? JSON.parse(rows[0].back_content.toString()) : null;
}

async function loIdForOrdinal(chapterId: number, ordinal: number | null): Promise<number> {
  const rows = await q(`SELECT id FROM learning_objective WHERE chapter_id = ? ORDER BY id`, [chapterId]);
  if (rows.length === 0) throw new Error(`chapter ${chapterId} has no learning objectives`);
  if (ordinal && ordinal >= 1 && ordinal <= rows.length) return rows[ordinal - 1].id;
  return rows[0].id;
}

export async function storeConceptCards(chapterId: number, payload: TConceptCardsPayload): Promise<number> {
  let stored = 0;
  for (const card of payload.cards) {
    const loId = await loIdForOrdinal(chapterId, card.source.lo_ordinal);
    const [res]: any = await getPool().query(`INSERT INTO concept (lo_id, name) VALUES (?, ?)`, [loId, card.concept_name]);
    const conceptId = res.insertId;
    const frontBlob = JSON.stringify({ concept_name: card.concept_name, front: card.front, source: card.source });
    const backBlob = JSON.stringify(card.back);
    await getPool().query(
      `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
       VALUES (?, 'concept_example', ?, 'json', ?, 'json')`,
      [conceptId, frontBlob, backBlob]
    );
    stored++;
  }
  return stored;
}

export async function storePracticeDeck(chapterId: number, deck: TPracticeDeck, problemFront: object): Promise<void> {
  const first = await q(`SELECT co.id FROM concept co JOIN learning_objective lo ON lo.id = co.lo_id WHERE lo.chapter_id = ? ORDER BY co.id LIMIT 1`, [chapterId]);
  let conceptId: number;
  if (first[0]) conceptId = first[0].id;
  else {
    const loId = await loIdForOrdinal(chapterId, null);
    const [res]: any = await getPool().query(`INSERT INTO concept (lo_id, name) VALUES (?, ?)`, [loId, deck.title]);
    conceptId = res.insertId;
  }
  await getPool().query(
    `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
     VALUES (?, 'problem_solution', ?, 'json', ?, 'json')`,
    [conceptId, JSON.stringify(problemFront), JSON.stringify(deck)]
  );
}
```

- [ ] **Step 3: Integration tests (require the container; skip cleanly when absent)**

`webapp/tests/db.integration.test.ts`: guard at top:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { dbAvailable, resolveChapter, storeConceptCards, getCachedConceptCards, getCachedPracticeDeck, storePracticeDeck } from "../lib/db";
import { ConceptCardsPayload, PracticeDeck } from "../lib/contracts";
import { readFileSync } from "fs";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../fixtures/${p}`, import.meta.url), "utf8"));
const up = await dbAvailable();
const d = up ? describe : describe.skip;

d("db integration (live MySQL)", () => {
  it("resolves openstax_calc1 section 5.4 to a chapter row", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    expect(ch).not.toBeNull();
  });
  it("round-trips concept cards and hits the cache", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const payload = ConceptCardsPayload.parse(read("concept_cards.json"));
    await storeConceptCards(ch!.chapterId, payload);
    const cached = await getCachedConceptCards(ch!.chapterId);
    expect(cached.length).toBeGreaterThanOrEqual(payload.cards.length);
    expect(cached[0].front.title).toBeTruthy();
  });
  it("round-trips the practice deck", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const deck = PracticeDeck.parse(read("practice_deck.json"));
    await storePracticeDeck(ch!.chapterId, deck, deck.problem);
    const cached = await getCachedPracticeDeck(ch!.chapterId);
    expect(cached?.animationId).toBe(deck.animationId);
  });
  it("still rejects a second card of the same type on one concept (schema negative control)", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const payload = ConceptCardsPayload.parse(read("concept_cards.json"));
    await expect(storeConceptCards(ch!.chapterId, { cards: [payload.cards[0]], skipped_concepts: [] })).resolves.toBeGreaterThan(0);
    // same concept_name inserts a NEW concept row, so duplicates are allowed across rows;
    // the ENUM/UNIQUE control is per concept: insert the same card twice against ONE concept id manually here
  });
});
```
For the negative control test, use a direct pool query helper exported for tests (`export const _testPool = getPool` guarded by `process.env.NODE_ENV !== "production"`) to attempt two `concept_example` inserts against one concept id and assert the second rejects with `ER_DUP_ENTRY`. Adjust to the real UNIQUE constraint from 01_schema.sql.

- [ ] **Step 4: Run, fix identifiers until green, then re-verify the DB counts, and commit**

```bash
cd webapp && npm test
```
Integration tests leave rows behind; that is fine for a dev DB, but the pipeline tests in Task 9 assume they can create their own rows for OTHER sections, so after this task runs green, reset once more for a clean baseline:
```bash
cd ../flashcards_db && docker compose down -v && docker compose up -d && cd ..
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the mysql2 data layer with cache reads, JSON card writes, and live integration tests"
```

---

### Task 8: LLM client, prompt loading, tool loop, mock mode

**Files:**
- Create: `webapp/lib/llm.ts`, `webapp/lib/corpusTools.ts`, `webapp/tests/llm.test.ts`, `webapp/tests/corpusTools.test.ts`

**Interfaces:**
- Consumes: `PROMPTS_DIR`, `REFERENCES_DIR` from Task 5.
- Produces (used by Task 9):
  - `loadPrompt(name: "phase1_generator_prompt_v1" | "phase1_critic_prompt_v1" | "case_study_master_prompt" | "concept_flashcards_prompt" | "practice_deck_prompt"): string`
  - `runLlm(opts: { stage: StageName; system: string; user: string; tools?: "corpus" }): Promise<string>` where `StageName = "stage1" | "critic" | "case_study" | "case_study_retry" | "concept_cards" | "practice_deck"` and retry stages map to `<stage>_retry` fixtures when mocked.
  - `MOCK_LLM=1` short-circuits to `webapp/fixtures/mock/<stage>.txt`.

- [ ] **Step 1: corpusTools.ts (path-fenced read-only tools)**

```ts
// webapp/lib/corpusTools.ts
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { REFERENCES_DIR } from "./paths";

export function listBooks(): string[] {
  return readdirSync(REFERENCES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function fence(relPath: string): string {
  const abs = path.resolve(REFERENCES_DIR, relPath);
  if (!abs.startsWith(path.resolve(REFERENCES_DIR) + path.sep)) {
    throw new Error(`path escapes references/: ${relPath}`);
  }
  return abs;
}

export function readCorpusFile(relPath: string): string {
  const abs = fence(relPath);
  if (abs.endsWith(".pdf")) throw new Error("PDF files are not readable through this tool");
  return readFileSync(abs, "utf8");
}

export const corpusToolDefs = [
  {
    name: "list_books",
    description: "List the textbook corpora available under references/. Returns directory names.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "read_corpus_file",
    description: "Read one file from references/, e.g. 'openstax_calculus_v1/book_map.json' or 'openstax_calculus_v1/sections/<file>'. Text files only.",
    input_schema: { type: "object" as const, properties: { path: { type: "string" as const } }, required: ["path"] },
  },
];

export function runCorpusTool(name: string, input: any): string {
  if (name === "list_books") return JSON.stringify(listBooks());
  if (name === "read_corpus_file") return readCorpusFile(String(input?.path ?? ""));
  throw new Error(`unknown tool ${name}`);
}
```

- [ ] **Step 2: llm.ts**

```ts
// webapp/lib/llm.ts
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import path from "path";
import { PROMPTS_DIR } from "./paths";
import { corpusToolDefs, runCorpusTool } from "./corpusTools";

export type StageName = "stage1" | "critic" | "case_study" | "case_study_retry" | "concept_cards" | "practice_deck";

export function loadPrompt(name: string): string {
  return readFileSync(path.join(PROMPTS_DIR, `${name}.md`), "utf8");
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const MAX_TOOL_TURNS = 25;

export async function runLlm(opts: { stage: StageName; system: string; user: string; tools?: "corpus" }): Promise<string> {
  if (process.env.MOCK_LLM === "1") {
    const p = new URL(`../fixtures/mock/${opts.stage}.txt`, import.meta.url);
    return readFileSync(p, "utf8");
  }
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: opts.user }];
  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: opts.system,
      messages,
      tools: opts.tools === "corpus" ? corpusToolDefs : undefined,
    });
    if (res.stop_reason !== "tool_use") {
      return res.content.filter((b) => b.type === "text").map((b: any) => b.text).join("\n");
    }
    messages.push({ role: "assistant", content: res.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      let out: string, isError = false;
      try { out = runCorpusTool(block.name, block.input); }
      catch (e) { out = (e as Error).message; isError = true; }
      results.push({ type: "tool_result", tool_use_id: block.id, content: out.slice(0, 200_000), is_error: isError });
    }
    messages.push({ role: "user", content: results });
  }
  throw new Error(`stage ${opts.stage}: tool loop exceeded ${MAX_TOOL_TURNS} turns`);
}
```

- [ ] **Step 3: Mock fixtures**

Create `webapp/fixtures/mock/`:
- `stage1.txt`: a plausible generator final message; its exact content is not parsed (the pipeline reads Stage 1 OUTPUT FILES, see Task 9 mock behavior), so a one-line marker `MOCK STAGE1 COMPLETE` suffices.
- `critic.txt`: `MOCK CRITIC PASS`
- `critic_fail.txt`: the exact phase-1 calibration error line format; copy a real example from `phase1_runs/water_tank_corrupted/phase1_error.txt`.
- `case_study.txt`: the full content of `webapp/fixtures/case_study.tex`.
- `case_study_retry.txt`: same content (retry path returns identical tex).
- `concept_cards.txt`: the content of `webapp/fixtures/concept_cards.json`.
- `practice_deck.txt`: the content of `webapp/fixtures/practice_deck.json`.
Generate the copies with a small node script or `cp` so they never drift by hand-editing.

- [ ] **Step 4: Tests**

`webapp/tests/corpusTools.test.ts`: fence rejects `../CLAUDE.md` and absolute paths (expect throw); `read_corpus_file` reads `openstax_calculus_v1/book_map.json` successfully; PDF read rejects.

`webapp/tests/llm.test.ts`: with `process.env.MOCK_LLM = "1"` set in the test, `runLlm({stage:"concept_cards", ...})` returns fixture text that parses through `ConceptCardsPayload` via `parseModelJson`; `loadPrompt("case_study_master_prompt")` returns text containing `preferred_context`.

- [ ] **Step 5: Run tests, commit**

```bash
cd webapp && npm test && cd ..
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the Anthropic client with corpus tool loop, prompt loading, and mock mode"
```

---

### Task 9: Pipeline runner + API routes + mock end-to-end test

**Files:**
- Create: `webapp/lib/pipeline.ts`, `webapp/lib/runStore.ts`, `webapp/app/api/runs/route.ts`, `webapp/app/api/runs/[id]/route.ts`, `webapp/app/api/runs/[id]/artifacts/[name]/route.ts`, `webapp/tests/pipeline.e2e.test.ts`
- Reference (read first): `webapp/fixtures/stage1/lo_mapping.json` (for the primary-section shape), `prompts/phase1_generator_prompt_v1.md` (for the 5-file output contract)

**Interfaces:**
- Consumes: everything from Tasks 5-8.
- Produces:
  - `startRun(input: { problem: string; preferredContext?: string }): Promise<string>` (returns runId; fire-and-forget execution)
  - Run state JSON at `runs/<id>/state.json`:
    ```ts
    type RunState = {
      id: string;
      input: { problem: string; preferredContext?: string };
      createdAt: string;
      stages: Record<"stage1" | "critic" | "case_study" | "concept_cards" | "practice_deck", { status: "pending" | "running" | "done" | "failed" | "cached"; message?: string }>;
      topic?: { bookTag: string; section: string; chapterId?: number };
      cacheOffline?: boolean;
      done: boolean;
      failed: boolean;
    };
    ```
  - Artifact files in `runs/<id>/`: `primary.md`, `supporting_01.md`, `supporting_02.md`, `lo_mapping.json`, `verified_answer.txt`, `case_study.tex`, `case_study.pdf`, `concept_cards.json`, `practice_deck.json`, `compile.log`.
  - HTTP: `POST /api/runs` body `{problem, preferredContext}` -> `{id}`; `GET /api/runs/:id` -> RunState; `GET /api/runs/:id/artifacts/:name` -> file bytes (pdf as `application/pdf`, json as `application/json`; 404 unknown names, allowlist exactly the artifact names above).

- [ ] **Step 1: runStore.ts**

```ts
// webapp/lib/runStore.ts
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { RUNS_DIR } from "./paths";

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
export function readState(id: string): any {
  return JSON.parse(readFileSync(path.join(runDir(id), "state.json"), "utf8"));
}
export function writeState(id: string, state: any): void {
  writeFileSync(path.join(runDir(id), "state.json"), JSON.stringify(state, null, 2));
}
export function runExists(id: string): boolean {
  return existsSync(path.join(runDir(id), "state.json"));
}
```

- [ ] **Step 2: pipeline.ts**

Core logic (write it exactly with these behaviors; abbreviated bodies shown only where the pattern repeats):

```ts
// webapp/lib/pipeline.ts
import { writeFileSync, readFileSync, copyFileSync, existsSync } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { newRunDir, writeState, readState } from "./runStore";
import { loadPrompt, runLlm } from "./llm";
import { ConceptCardsPayload, PracticeDeck, parseModelJson } from "./contracts";
import * as db from "./db";
import { TECTONIC } from "./paths";

const execFileP = promisify(execFile);
const STAGE1_FILES = ["primary.md", "supporting_01.md", "supporting_02.md", "lo_mapping.json", "verified_answer.txt"] as const;

export async function startRun(input: { problem: string; preferredContext?: string }): Promise<string> {
  const { id, dir } = newRunDir();
  const state = {
    id, input, createdAt: new Date().toISOString(),
    stages: Object.fromEntries(["stage1", "critic", "case_study", "concept_cards", "practice_deck"].map(s => [s, { status: "pending" }])),
    done: false, failed: false,
  };
  writeState(id, state);
  void execute(id, dir, input).catch((e) => {
    const s = readState(id); s.failed = true; s.done = true;
    for (const k of Object.keys(s.stages)) if (s.stages[k].status === "running" || s.stages[k].status === "pending") s.stages[k] = { status: "failed", message: String(e?.message ?? e) };
    writeState(id, s);
  });
  return id;
}
```

`execute(id, dir, input)`:
1. **stage1**: set running. If `MOCK_LLM=1`: copy the five files from `webapp/fixtures/stage1/` into `dir` (this is the mock behavior; the mock LLM text is not parsed). Else: call `runLlm({stage:"stage1", system: loadPrompt("phase1_generator_prompt_v1"), user: buildStage1User(input.problem), tools: "corpus"})` where `buildStage1User` instructs: "Source problem:\n<problem>\n\nReturn each output file in a fenced block preceded by a line 'FILE: <name>'." Parse `FILE: <name>` sections from the reply and write the five files; if `phase1_error.txt` appears instead, fail the run with its first line. Missing any of the five files = stage failed with a named-file message. Set done.
2. **critic**: same pattern, `stage: "critic"`, user message = the five files inline plus the problem. If the reply contains a line starting with `ERROR` or matches the calibration-mismatch format, mark critic failed with that line, mark the run failed, stop. Mock: `critic.txt` passes; the e2e failure test temporarily renames `critic_fail.txt` -> `critic.txt` (see Step 5).
3. **topic resolution**: parse `lo_mapping.json` from `dir`. Extract bookTag + PRIMARY section number: read the fixture file FIRST and write `parsePrimarySection(loMapping: any): { bookTag: string; section: string } | null` against its actual shape (look for the primary citation entry and its section identifier; write a unit test in Step 5 pinning the fixture's expected values). If parsing fails or `db.dbAvailable()` is false, set `state.cacheOffline = true` and skip all cache reads/writes (generate everything).
4. **fan-out** with `Promise.allSettled` over three async fns:
   - `caseStudy`: running; user message = the Stage 1 files inline + `preferred_context: <theme>` line + "Return ONLY the complete LaTeX source."; strip code fences from the reply; write `case_study.tex`; compile: `execFileP(TECTONIC, ["case_study.tex"], { cwd: dir, timeout: 120_000 })`; on nonzero (catch), write stderr+stdout to `compile.log`, retry ONCE with `stage: "case_study_retry"` and the log appended to the user message ("The previous source failed to compile with this log; return corrected complete LaTeX source only."); recompile; still failing = stage failed with "LaTeX compile failed twice; see compile.log". Success requires `case_study.pdf` existing.
   - `conceptCards`: if cache available and `db.getCachedConceptCards(chapterId)` returns length > 0: write them (wrapped as `{cards, skipped_concepts: []}`) to `concept_cards.json`, status "cached". Else: user message = primary.md + supporting files + LO list extracted from primary.md + the problem; `parseModelJson(ConceptCardsPayload, reply)`; on failure retry once with the validation error appended; on success write file, then if cache available `db.storeConceptCards` (wrap in try/catch: a `DbUnavailableError` or insert error degrades to `cacheOffline = true`, never fails the stage); status "done".
   - `practiceDeck`: mirror of conceptCards with `PracticeDeck`, `db.getCachedPracticeDeck` / `db.storePracticeDeck(chapterId, deck, deck.problem)`.
5. Set `done = true`; `failed = true` only if `stage1` or `critic` failed or ALL THREE fan-out stages failed; individual fan-out failures leave the run done with per-stage failed status (the UI shows what exists).
State writes: every transition immediately persists via `writeState` (read-modify-write; single process, no locking needed).

- [ ] **Step 3: API routes**

`webapp/app/api/runs/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { startRun } from "@/lib/pipeline";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.problem || typeof body.problem !== "string" || body.problem.trim().length < 10) {
    return NextResponse.json({ error: "problem text is required (10+ chars)" }, { status: 400 });
  }
  const id = await startRun({ problem: body.problem.trim(), preferredContext: body.preferredContext?.trim() || undefined });
  return NextResponse.json({ id });
}
```

`webapp/app/api/runs/[id]/route.ts`: GET returns `readState(id)` or 404 (`runExists` first).

`webapp/app/api/runs/[id]/artifacts/[name]/route.ts`: allowlist `["case_study.pdf", "case_study.tex", "concept_cards.json", "practice_deck.json", "compile.log"]`; read from `runDir(id)`, 404 when missing; content types: pdf `application/pdf`, tex/log `text/plain`, json `application/json`. Return `new NextResponse(buffer, { headers: { "Content-Type": ct } })`.

- [ ] **Step 4: Force Node runtime**

Each route file: `export const runtime = "nodejs";` (child_process + fs need it).

- [ ] **Step 5: Tests**

`webapp/tests/pipeline.e2e.test.ts` (all with `MOCK_LLM=1` and `RUNS_DIR` pointed at a temp dir via env before importing modules; use `vi.stubEnv`):
- unit: `parsePrimarySection(JSON.parse(read("stage1/lo_mapping.json")))` returns the fixture's actual bookTag/section (fill in the literal expected values after reading the fixture once).
- e2e happy path: call `startRun({problem: "A tank fills at r(t)=6t liters per hour starting from 40 liters; will it exceed 5000 liters in 12 hours?"})`, poll `readState` until `done` (cap 60s; mock compile is real tectonic on the fixture tex, allow time). Assert: stage1/critic done; case_study done and `case_study.pdf` exists and starts with bytes `%PDF`; concept_cards + practice_deck status "done" or "cached"; `concept_cards.json` parses through the zod schema.
- cache path (only when db available): run a second `startRun`, assert concept_cards status is "cached" and the mock call log (add a tiny in-memory counter export to llm.ts, `export const mockCalls: string[]`, pushed on every mock hit) contains no "concept_cards" entry for the second run.
- critic failure path: temporarily point the mock at the failure fixture (in llm.ts mock branch, allow `MOCK_STAGE_OVERRIDES` env: `MOCK_STAGE_OVERRIDES=critic=critic_fail`), assert run failed, `stages.critic.message` contains the calibration line, and NO case_study/flashcard artifacts exist.
- artifact route allowlist: request `../../CLAUDE.md` as name -> 404 (call the route handler directly with params).

- [ ] **Step 6: Run everything, commit**

```bash
cd webapp && npm test && npm run build && cd ..
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the pipeline runner with caching, tectonic compile, mock mode, and the runs API"
```

---

### Task 10: Frontend, home page + run progress page

**Files:**
- Create: `webapp/app/page.tsx`, `webapp/app/page.module.css`, `webapp/app/runs/[id]/page.tsx`, `webapp/app/runs/[id]/RunProgress.tsx`, `webapp/app/runs/[id]/run.module.css`
- Modify: delete the create-next-app boilerplate (`webapp/app/favicon.ico` stays, default page content replaced)

**Interfaces:**
- Consumes: POST /api/runs, GET /api/runs/:id (Task 9 shapes), `.panel`/`.btn`/`.eyebrow` classes (Task 5).
- Produces: navigation to `/runs/<id>/results` when `state.done && !state.failed` (Task 11's page).

- [ ] **Step 1: Home page**

`app/page.tsx` (client component): centered `.panel` (max-width 760px, margin auto, padding 40px): eyebrow "MathGPT Pipeline", h1 "Generate a Case Study", muted intro line; form: textarea (name "problem", 6 rows, placeholder "Paste a textbook problem, e.g. Water flows into a tank at r(t) = 20 + 5t liters per hour...", monospace font like the reference textarea styling), text input "Theme (optional)" plus suggestion chips rendered as small buttons (Soccer, Architecture, Music, Cooking, Space, Fitness) that fill the input on click; primary button "Run Pipeline". On submit: POST `/api/runs`, on 200 `router.push(`/runs/${id}`)`, on error show the message inline in a `.callout.warning`-styled div. Disable the button while submitting.

- [ ] **Step 2: Run progress page**

`app/runs/[id]/page.tsx` (server component) renders `<RunProgress id={id} />`. `RunProgress.tsx` (client): poll `GET /api/runs/${id}` every 1500ms (setInterval in useEffect, cleared on unmount and when done). Layout: one `.panel` with the progress-track bar (width = completed stages / 5), then a stage list; per stage a row: status icon (pending: dim dot; running: pulsing accent dot via CSS animation; done: green check; cached: green check with label "from cache"; failed: warning-colored !), stage label (Understand the problem / Verify the math / Case study worksheet / Concept flashcards / Practice deck), and the failure message in muted red text when present. `cacheOffline` true shows one muted line "Flashcard cache offline, generating fresh." When `done && !failed`: `router.replace(`/runs/${id}/results`)`. When `failed`: show the failed stages' messages in a `.callout warning` block titled "This run could not be completed honestly" and a "Try another problem" link home. 404 from the API: show "Run not found" with a home link.

- [ ] **Step 3: Verify in the browser (mock mode)**

```bash
cd webapp && MOCK_LLM=1 npm run dev
```
Visit http://localhost:3000, submit the sample problem, watch stages complete, land on /results (404 for now, Task 11). Screenshot-check the home and progress pages against the design system (panels, accents, no stray white backgrounds).

- [ ] **Step 4: Build + commit**

```bash
cd webapp && npm run build && cd ..
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the home form and live run progress pages"
```

---

### Task 11: Results page, three tabs

**Files:**
- Create: `webapp/app/runs/[id]/results/page.tsx`, `webapp/app/runs/[id]/results/Results.tsx`, `webapp/app/runs/[id]/results/results.module.css`, `webapp/components/ConceptCardGrid.tsx`, `webapp/components/PracticeDeckPlayer.tsx`, `webapp/components/conceptCards.module.css`, `webapp/components/practiceDeck.module.css`
- Reference: `chain-rule-nested-power-animation.html` (stage/sidebar/reference markup and classes; the CSS is already ported in Task 5)

**Interfaces:**
- Consumes: `GET /api/runs/:id` state, artifact routes, `TConceptCard[]`, `TPracticeDeck` types, `MathBlock`/`Prose` components (Task 5), globals classes.

- [ ] **Step 1: Results shell with tabs**

`Results.tsx` (client): fetch state once; fetch `concept_cards.json` and `practice_deck.json` artifacts (tolerate 404: a failed stage renders an inline honest notice instead of its tab body, tab still listed with a "failed" badge). Header panel: eyebrow "Results", the run's problem text (truncated to 2 lines with expand), theme chip when present. Tab bar (buttons styled like `.btn`, active = `.btn-primary`): "Case Study", "Concept Cards", "Practice Deck". Tabs render below; no route change per tab (state only). Each stage that failed shows its message inside a `.callout warning`. Download links under each tab (PDF / .tex / JSON).

- [ ] **Step 2: Case Study tab**

`<object data={`/api/runs/${id}/artifacts/case_study.pdf`} type="application/pdf">` at width 100%, height ~85vh (one page target), with a fallback link "Open the PDF" when the browser cannot embed. Buttons: Download PDF, Download .tex.

- [ ] **Step 3: Concept Cards tab (flip cards)**

`ConceptCardGrid.tsx`: props `{ cards: TConceptCard[] }`. Grid `repeat(auto-fill, minmax(340px, 1fr))`, gap 16px. Each card: a button-wrapped 4:3-min container with 3D flip on click (`transform: rotateY(180deg)` on a `.inner` with `transform-style: preserve-3d; transition: transform .5s`, faces `backface-visibility: hidden; position: absolute; inset: 0`; container `position: relative; min-height: 380px`).
- Front face: background #011E4F, text #FAF8F4, two nested rounded borders via `border: 2px solid #FAF8F4; border-radius: 14px` on the face and `box-shadow: inset 0 0 0 6px #011E4F, inset 0 0 0 7px #FAF8F4`; content column: title (bold, clamp 1.2-1.5rem), subtitle (italic, #82A4F5), thin #82A4F5 divider, central `MathBlock` (or prose), variable key lines (small, #82A4F5, `MathBlock inline` for symbols), description_main, description_support (smaller, both centered), footer "Flip for a worked example" (#82A4F5, small).
- Back face: background #FAF8F4, text #011E4F, navy borders same technique; "Worked Example" heading, question (`Prose`, color #176CF8), divider, steps list (each step: optional `MathBlock` + optional prose line, left-aligned), final answer (`MathBlock`, bold via `\mathbf{...}` wrapping is WRONG for arbitrary latex; instead style the container `font-weight: 700` and add a subtle top border), footer (#176CF8, small).
- Card height grows with content (min-height, not fixed height; no internal scrolling).

- [ ] **Step 4: Practice Deck tab (the slideshow)**

`PracticeDeckPlayer.tsx`: props `{ deck: TPracticeDeck }`. Recreate the reference page structure inside the tab using the ported globals classes:
- Grid `minmax(0,1fr) 320px` (single column under 900px).
- Stage shell: topbar (deck title + subtitle left, "Step N of M" right), progress bar, stage area rendering the current step exactly like the reference render(): eyebrow "Step N", step title, caption, equation rows (label + `MathBlock`, style class `rule|primary|final|secondary`), cards grid (label + `MathBlock`, tone class), callout (icon map: goal ◎, tip ✦, memory ↺, check ✓, warning !, success ✓).
- Controls bar: THREE buttons only: "← Previous" (disabled at step 0), "Next →" (primary, disabled at last), "Final Slide ⇥" (jumps to last, disabled at last). No play, no reset, no speed.
- Keyboard: ArrowLeft/ArrowRight/End handlers on window (skip when target is input/textarea/select), removed on unmount.
- Sidebar (sticky top on desktop): "Current problem" card with `MathBlock` of `deck.problem.latex`; slides-overview list of ALL step titles (index badge + title, click to jump, active highlighted) with NO max-height and NO overflow (page scrolls instead).
- Below the grid, full-width panel "Key Equations & Formulas": every `deck.reference.equations` item as a reference row (title, `MathBlock`, text, "View step" button jumping to its stepId). Open list, no accordion.
- Re-typeset on step change: the `MathBlock` components handle it via their useEffect on latex change.

- [ ] **Step 5: Verify in the browser (mock mode), both tabs plus keyboard**

Dev server with MOCK_LLM=1: complete a run; on results check: PDF embeds; cards flip and math renders on BOTH faces; slideshow prev/next/final work, keyboard works, overview jumps, reference "View step" jumps and scrolls to the stage; only allowed scrollbars: the page itself (and equation-row horizontal overflow only when the window is very narrow). Fix visual defects found.

- [ ] **Step 6: Build + commit**

```bash
cd webapp && npm run build && cd ..
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards' && git commit -m "Add the results page with case study, flip card, and practice slideshow tabs"
```

---

### Task 12: Final cleanup, README, CLAUDE.md (orchestrator-executed)

This task is executed by the ORCHESTRATOR session (it rewrites project memory; subagents must not).

**Files:**
- Delete: `phase1_runs/` (git rm -r), `chain-rule-nested-power-animation.html`, `derivative-animation-renderer.html` (untracked: plain rm), `tools/render_flashcards.py`, `tools/import_concept_flashcards.py`, `tools/test_import_concept_flashcards.py`, `tools/flashcard_lo_mapping.csv`, `tools/verify_flashcard_import.sql`, `tools/check_blob_round_trip.py` (git rm)
- Create: `webapp/README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Confirm nothing still references the doomed files** (`grep -rn "render_flashcards\|import_concept_flashcards\|phase1_runs" webapp/ prompts/ plan/webapp_pipeline_design.md` should only hit historical notes in the spec/plan; webapp fixtures were COPIES, verify `webapp/fixtures/stage1/primary.md` exists), then delete.

- [ ] **Step 2: webapp/README.md**: setup (npm install; `.env.local` keys: ANTHROPIC_API_KEY, ANTHROPIC_MODEL, MYSQL_* creds matching flashcards_db compose, MOCK_LLM); start MySQL (`docker compose up -d` in flashcards_db/); run dev (`npm run dev`), tests (`npm test`); mock mode explanation; live-key switch instructions (unset MOCK_LLM, set the key); pipeline flow diagram in prose; artifact locations (`runs/<id>/`).

- [ ] **Step 3: CLAUDE.md rewrite** per the maintaining-project-memory skill: sec 2 (Peter directives updated: animation format = browser JSON, settled), sec 5 (new prompt lineage entries for the three production prompts; mark superseded ones), sec 9 (decision blocks: team-prompt adoption + repo cleanup; DB emptied reversal; webapp architecture; the animation-format decision), sec 12 (caveats: prompts untested live, mock-only verification, no API key yet), sec 13 backlog (prune items tied to deleted paths; add: live-key smoke test, Drive archiving still open, history rewrite for the 52MB PDF still open), sec 14 (active task = webapp built, next = live key + Peter demo), sec 15 (file map rewritten).

- [ ] **Step 4: Full verification sweep**

```bash
cd webapp && npm test && npm run build && cd ..
git status --short   # expect: clean except untracked PPTX folder
```

- [ ] **Step 5: Commit and push**

```bash
git add -A -- ':!OpenStax_Calculus_Volume_1_Concept_Only_Flashcards'
git commit -m "Finish the webapp migration cleanup and update the project memory"
git push origin main
```

---

## Self-Review Notes

- Spec 2a/2b/2c -> Tasks 2/3/4. Spec 3 -> Tasks 8/9. Spec 4 -> Tasks 1 (emptying) + 7. Spec 5 -> Tasks 5/10/11. Spec 6 -> Tasks 1 + 12. Spec 7 -> Tasks 6/7/9 tests. Spec 8 respected (no auth/deploy/GIF/graphs).
- Type names consistent: ConceptCardsPayload/PracticeDeck/TConceptCard/TPracticeDeck defined Task 6, consumed Tasks 7/9/11; StageName defined Task 8, used Task 9; paths.ts exports defined Task 5, used 7/8/9.
- Known judgment points left to implementers ON PURPOSE: exact column names (read 01_schema.sql), lo_mapping primary-section shape (read the fixture), CSS detail beyond the listed tokens (read the reference HTML). Each has an explicit read-first step.
