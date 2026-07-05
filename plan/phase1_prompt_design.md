# Phase 1 Prompt Design (spec)
### Status: awaiting Hitaansh sign-off  ·  July 5, 2026
### Decisions behind this spec: CLAUDE.md sec 2 (two-phase directive), sec 9 (July 5 phase 1 architecture entry), sec 14

Phase 1 takes ONE source problem (problem.txt) and generates the five files Peter's IMathAS pipeline required humans to hand-supply, which are exactly the input contract of our phase 2 prompts (plan/phase2_prompt_design.md sec 1). It runs as TWO agentic prompts in sequence, in a harness with file tools (Claude Code or equivalent), searching a local corpus in references/. Reference example throughout: /phase1example (the simplex problem and Peter's five files for it).

Settled decisions (Hitaansh, July 5, 2026):
1. Corpus access: local textbook copies in a references/ directory in this repo. The prompts search files; no web access is assumed at run time.
2. Two prompts: a GENERATOR (solve, search, extract, map) and a CRITIC (independent re-solve, adversarial audit). Mirrors the mapper/critic split visible inside Peter's lo_mapping.json.
3. Schema: lo_mapping.json clones Peter's example schema field for field; inapplicable fields carry documented empty values (sec 4).
4. verified_answer.txt trust: the critic re-solves the problem from scratch BEFORE reading any draft file; a mismatch halts phase 1. This is phase 1's twin of phase 2's calibration gate.
5. First corpus and first tests: Calc 1 / OpenStax only. Other books come later; the /phase1example golden diff is deferred until the linear algebra books are added.

---

## 1. Interfaces

### Run inputs (both prompts)
- `problem_path`: path to problem.txt, one source problem, possibly multi-part. A human pins scope by choosing this problem (the fence reversal, CLAUDE.md sec 9).
- `references_path`: path to the references/ corpus root.
- `output_path`: directory where the five files are written. The critic additionally reads the generator's drafts from this directory.

### The references/ corpus contract
One subdirectory per book: `references/<book_key>/` containing:
- `book_map.json`: book metadata (title, author(s), license, attribution-required line, source URL or URL pattern, course_level, and a short book tag, e.g. "openstax_calc1", used in extract anchors and lo_mapping's `corpus` field) plus a section index: for each section its number, title, learning objectives, topic keywords, and content filename. This is the search surface; it deliberately mirrors the master book map Peter's Kuttler extract references (`books/first_course_linear_algebra_kuttler.json`).
- `sections/<file>.md` (or .txt): the full content of each section.

Search discipline: the prompts read every book_map.json first (that set defines `books_searched`), shortlist candidate sections from the index, and only then Read/Grep the shortlisted section files. They never cite a section whose file they have not opened.

First corpus to build: `references/openstax_calculus_v1/` (prep is its own task; source is the OpenStax Calculus Volume 1 PDF already in the repo or the OpenStax web version; enough chapters that section choice is a real decision, target the core Calc 1 chapters 1 through 6). WARNING carried from CLAUDE.md sec 2 and backlog 8: confirm OpenStax license terms, and decide whether references/ is committed or gitignored before pushing textbook copies to the public remote.

### Output contract (the five files, names fixed by phase 2's input contract)
- `primary.md`: extract of the single best-matching section (house extract format, sec 2 step 4).
- `supporting_01.md`, `supporting_02.md`, ...: SUPPORTING section extracts, same format. Default 2; 1 to 3 allowed when the corpus genuinely offers fewer or more useful sections (phase 2 accepts a varying count).
- `lo_mapping.json`: Peter's schema (sec 4). Generator writes the mapper half; critic fills the critique fields.
- `verified_answer.txt`: fully worked answer to the source problem, compact prose, every reported quantity explicit. It later serves phase 2 as calibration ground truth AND method exemplar, so granularity matters: show the operator-bearing steps, not just results (match the example's density).
- On failure: `phase1_error.txt` instead (sec 6), and the package must not be fed to phase 2.

Students never see these files (phase 2 spec, settled answer 6); no method concealment applies anywhere in phase 1. Naming techniques is expected.

---

## 2. Prompt 1: phase1_generator_prompt_v1.md

Mandated steps, in order:

1. **Read problem.txt. Write the problem LO(s).** The singular `learning_objective` is one imperative statement covering every part of the problem (what a student must be able to DO). The `learning_objectives` array gets one entry per problem part (part_id matching the problem's own labels, e.g. "i".."iv") with a per-part LO, `mapped_section_keys` (format `<book_key>:<section_number>`), a 0-1 confidence, and a one-line rationale; a problem without parts gets a single entry mirroring the singular field.
2. **Solve the problem fully.** Show all work internally, run a substitute-back / consistency check on the final answer (verify the claimed solution against the original constraints), and write verified_answer.txt. A generator that cannot produce a self-consistent solution must fail honestly (sec 6), not ship its best guess.
3. **Search the corpus.** Read every book_map.json (this set = `books_searched`). Score each candidate section on the four rubric dimensions (sec 4, rubric anchors in the prompt). Select exactly one PRIMARY (the section a student would actually learn the tested skill from) and the SUPPORTING sections. Selection honesty: when nothing teaches the skill, say so via `no_primary_available` / `fallback_sections` / `no_coverage_reasoning` rather than promoting a weak match with an inflated score. The example's own PRIMARY justification (which openly lists what the section does NOT cover) is the model for justification style.
4. **Write the extracts** in the house extract format:
   - Header: `# <Book short name> §<number>: <title>`, then `**OER:**` (title, author, license), `**Source:**` URL, `**License:**` line, `**Attribution required:**` line, all built from book_map.json, never from memory.
   - `## Section Outcomes / Learning Objectives` and `## Section Topics` lists from the book map.
   - `## Content`: a condensed, cleanly restated version of the section. Definitions, theorems, algorithms, and worked examples carry stable anchors `{#<book_tag>-<section>-<kind>-<n>}` with kind in {def, thm, ex, proc} (the Kuttler style from the example; phase 2 flashcards cite these anchors, so they must be unique and stable). Include the worked examples a student would imitate for this problem. Restate math in clean standard LaTeX; NEVER copy crawl artifacts or nonstandard macros from the source files. ASCII only.
   - Condensation guide: roughly 1 to 3 pages of markdown per extract; everything the justification cites must actually appear in the extract.
5. **Write lo_mapping.json, mapper half.** All schema fields (sec 4); rubric scores with honest anchors; justifications that name what the section covers AND what it does not; a first draft of `missing_concepts` (every concept the problem needs that no cited section teaches, stated as self-contained one-line facts usable as phase 2 reference data). Critic-owned fields get sentinel values: `critique_status: "pending"`, `critique_score: null`, `critique_findings: []`, `primary_assessment: ""`, `supporting_assessment: ""`, `recommended_changes: []`, `multipart_assessment: ""`, `search_reasonable: null`.

## 3. Prompt 2: phase1_critic_prompt_v1.md

Fresh session, no generator context. Mandated steps, in order:

1. **Independence-preserving calibration gate.** Read problem.txt FIRST and re-solve it completely from scratch, before opening verified_answer.txt or any other draft (the prompt states this ordering explicitly; opening drafts first voids the audit). Then compare every reported quantity against verified_answer.txt. Any mismatch: write phase1_error.txt (sec 6) and STOP; a critique of an uncalibrated package is worthless. Match: proceed.
2. **Adversarial mapping audit**, against the actual files:
   - Re-run the search independently over the book maps; explicitly name any better candidate section the mapper missed, or state that none exists (a non-findings entry, per the recon's audit pattern; the example's critique caught exactly this: Contemporary Math §5.11 was searched but never cited).
   - Verify every cited anchor exists in the extracts and every extract claim exists in the source section files (no invented content).
   - Verify `books_searched` equals the set of book_map.json files present; verify attribution lines match the book maps; verify rubric scores are defensible against the anchors.
   - Assess whether the sections let a student solve EVERY part of the problem; anything uncovered belongs in missing_concepts.
3. **Fill the critique fields only**: `critique_score`, `critique_findings` (specific, evidence-backed, brutal where warranted), `primary_assessment`, `supporting_assessment`, `recommended_changes`, `multipart_assessment`, `search_reasonable`, `critique_status: "completed"`. Verify and extend `missing_concepts` (the field phase 2 leans on hardest gets double coverage: generator drafts, critic audits). The critic is REPORT-ONLY: it never rewrites the mapper's sections, scores, justifications, or the extracts. Weak mappings ship with honest critique attached, exactly like the example (LOW confidence, needs_change, shipped anyway); phase 2's warning banner handles the rest.

## 4. lo_mapping.json schema (cloned from /phase1example)

Every field in the example file appears, same names, same nesting. Fill rules for fields that do not apply to our runs:
- `state`: "FOUND" when a package ships (only value observed in the example; error runs produce phase1_error.txt instead of a package).
- `template_id`: "" (our problems do not come from Peter's template bank).
- `page_uuid`, `openstax_url` (per section): "" unless the book map supplies a real value; `artifact_ids`: []; `also_in_books`: [] unless the index shows the section in multiple books.
- `source`: "dynamic"; `confidence_rubric_version`: 1.
- `corpus`: the book's short tag from its book_map.json (e.g. "openstax_calc1").
- `source_course_level`: the input problem's course level as judged by the generator, using the corpus's course_level vocabulary (e.g. "calculus_1").
- `fallback_sections`, `no_coverage_reasoning`, `error_type`, `error_message`: "" / [] unless triggered.

Rubric (generator-owned): the example's four dimensions, each scored 0 to 1 in steps of 0.05 against written anchors in the prompt:
- `topic_keyword_match`: overlap between the problem's topic vocabulary and the section's topic keywords.
- `lo_explicit_match`: does a section LO explicitly state the tested skill (not merely a prerequisite of it)?
- `exercise_pattern_match`: does the section contain worked examples of the same task shape the student could imitate?
- `course_level_match`: does the section's course level match the problem's?
`confidence_score` = median of the four (this reproduces the example: median(0.45, 0.35, 0.40, 0.55) = 0.425; flagged as our inference of Peter's rule, sec 8). `mapping_confidence` bands, assumed and flagged: LOW < 0.5, MEDIUM 0.5 to 0.75, HIGH > 0.75. Phase 2 already reads these fields defensively, so a band correction from Peter is cheap.
`multipart_assessment` vocabulary, assumed and flagged: "single_part" | "complete" | "multipart_missing_parts" (only the last is observed; phase 2 triggers on missing-parts-like values defensively).

## 5. Shared rules (both prompts)

Ground-truth hierarchy for phase 1:
1. The section files in references/ beat model memory: never cite, quote, or extract content not present in the files.
2. book_map.json beats section files for metadata (titles, licenses, attribution, URLs).
3. problem.txt alone defines the tested skills; sections cannot add or subtract skills.
4. On answer disagreement between critic and generator, neither is trusted: halt (sec 6).

Format rules: ASCII throughout; valid JSON (no trailing commas, no comments); markdown extracts must not contain raw crawl macros; every extract carries its license and attribution lines. Prompt style follows the phase 2 prompts: countable rules over vibes, defensive behavior on malformed input, honest failure over confident fabrication.

## 6. Failure behavior

- Generator cannot solve the problem to a self-consistent answer, or problem.txt is ambiguous/unreadable: write `phase1_error.txt` containing one line, `ERROR: <category>: <specific reason>. No phase 1 package generated.` and produce no other files.
- Critic calibration mismatch: write `phase1_error.txt` containing one line, `ERROR: calibration failed: independent re-derivation disagrees with verified_answer.txt (first disagreement: <quantity>: critic <x> vs generator <y>). Package not certified; do not feed to phase 2.` and leave every draft file untouched (evidence for debugging).
- Corpus has no plausible grounding: NOT an error. Ship the package with `no_primary_available: true` (or a weak PRIMARY plus honest scores), `no_coverage_reasoning` filled, and rich `missing_concepts`. The example IS this case; phase 2's banner and P8 reference data exist for it.

## 7. Test plan (Calc 1 only, per settled decision 5)

Prep: build `references/openstax_calculus_v1/` (book_map.json + section files). Then, fresh sessions throughout:
1. **Happy path**: one Calc 1 source problem (written fresh, not copied from the corpus; taco-truck-adjacent difficulty). Run generator, then critic. Static checks: five files present; lo_mapping.json parses and carries every schema field; every cited anchor resolves into the extracts; extract claims spot-check against the corpus source; attribution lines match the book map; verified_answer.txt hand-verified by us; critique fields populated with at least one non-empty finding or an explicit non-finding.
2. **Negative control A (calibration)**: corrupt one number in the generator's verified_answer.txt, run the critic; it must emit the specified error line and no critique. A gate that never fires is decoration.
3. **Negative control B (coverage)**: run /phase1example/problem.txt (simplex) against the calc-only corpus; must produce an honest no-coverage/LOW result with real missing_concepts, not confident fake citations. We get this control for free.
4. **End-to-end**: feed the happy-path package to prompts/phase2_case_study_prompt_v1.md; the calibration gate must pass and the warning banner must fire iff the mapping was weak.
5. **Deferred**: golden diff against Peter's /phase1example files once the linear algebra books are added to references/.

Log the standard caveats: harness agents are semi-fresh (CLAUDE.md loads), one model family, single runs.

## 8. Open items (accepted, not blockers)
- `confidence_score` = median-of-rubric is inferred from one example; the LOW/MEDIUM/HIGH bands, the `state` vocabulary beyond "FOUND", and the `multipart_assessment` vocabulary are documented assumptions. Confirm with Peter when convenient; phase 2 reads all of them defensively, so corrections are cheap.
- Corpus prep method (PDF extraction vs crawling the OpenStax web version) is decided at implementation time; the contract only fixes book_map.json + sections/.
- Whether references/ is committed or gitignored is undecided; it inherits backlog 8's licensing exposure question (OpenStax NC caution) and must be settled before pushing textbook copies.
- Supporting-section count is generator judgment (1 to 3); no rule forces exactly 2.
