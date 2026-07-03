# Phase 2 Prompt Design (spec)
### Status: awaiting Hitaansh sign-off  ·  July 2, 2026
### Decisions behind this spec: CLAUDE.md sec 2 (two-phase directive), sec 9 (fence reversal, fresh numbers), sec 14 (settled answers 1-7)

Phase 2 consumes the 5 files phase 1 produces for one source problem and emits two independent artifacts via two separate LLM calls: a case study worksheet (same product as our v5 cases) and a flashcard sheet. This spec defines both prompts precisely enough that they can be written, and later tested, without the chat history that produced it. Reference example throughout: /phase1example (simplex pivot problem mapped to Kuttler/Austin linear algebra sections).

---

## 1. The input contract (shared by both prompts)

Phase 1 emits, per source problem:

| File | Content | Phase 2 uses it as |
|---|---|---|
| problem.txt | the source problem (also phase 1's input) | the skills the artifact must exercise; the topic |
| primary.md | PRIMARY OER section extract: license/attribution metadata, section LOs, topics, condensed content with stable anchors | evidence of what students are assumed to have been taught; vocabulary and notation conventions |
| supporting_01.md, supporting_02.md, ... (count may vary) | SUPPORTING section extracts, same format | same, secondary |
| lo_mapping.json | problem LO, section citations with roles and justifications, confidence rubric, critique_findings, missing_concepts, primary/supporting assessments, recommended_changes | the fence's negative space: what must be printed on the worksheet because no section teaches it; the honesty layer |
| verified_answer.txt | fully worked, verified answer to the SOURCE problem | calibration gate ground truth; method exemplar for key granularity |

Students see NONE of these files (settled answer 6). Artifacts must be fully self-contained.

Both prompts receive the files pasted into tagged blocks:
`<problem>`, `<primary_section>`, `<supporting_sections>` (all supporting files in one block, their headers kept), `<lo_mapping>`, `<verified_answer>`.

### Ground-truth hierarchy for file conflicts (both prompts)
1. verified_answer.txt beats the model's own solution of the source problem.
2. lo_mapping.critique_findings beat the mapper's section justifications.
3. Section content beats model memory for definitions, notation, and vocabulary.
4. problem.txt defines which skills are taught; nothing else adds skills.

### LaTeX safety (both prompts)
Never copy LaTeX from the section files into output. The extracts carry crawl artifacts (macros like \gray, nonstandard array styles) that are not defined in the house preamble and would break the compile guarantee. Restate all content in house style. Student-facing math adopts the PRIMARY section's notation conventions unless the scenario dictates otherwise.

### Attribution (both prompts, settled answer 7)
Every section file's metadata block contains an "Attribution required" line. The prompt builds one credit line per distinct book actually drawn on, e.g. "Adapted from 'A First Course in Linear Algebra' by Ken Kuttler, used under CC BY 4.0." Placement: case study = instructor page footer area plus % comments; flashcards = one small gray line at the bottom of the sheet (that artifact is student-facing).

---

## 2. Prompt A: phase2_case_study_prompt_v1.md

One complete, compilable LaTeX document, identical in product shape to v5 output. Everything in v5 carries over unless this section changes it: the 12 invariants, title rules, LaTeX output contract and fixed preamble, instructor material, silent preflight, revision rules, difficulty anchor.

### Inputs
The 5 file blocks, plus: `<audience>` (default: struggling but motivated intro-level college students), `<domain>` (optional override; default: draw from the problem's own context or pick fresh), `<case_number>` (optional), `<key_placement>` (instructor_pages default | same_page), `<playbook>` (optional vetted playbook; library and harvest mechanism unchanged from v5).

### Step 0: calibration gate (new, replaces nothing)
Before any authoring, silently solve problem.txt in full and compare every reported quantity against verified_answer.txt.
- Match: proceed. The comparison is against supplied ground truth, not self-grading.
- Any mismatch: output ONLY the line
  `% ERROR: calibration failed: my solution of the source problem disagrees with verified_answer.txt (first disagreement: <quantity>: mine <x> vs verified <y>). No case generated.`
  and nothing else. A model that cannot reproduce the verified answer must not author a case on the topic.

### Scope fence (replaces v5's subtopic; reversal logged in CLAUDE.md sec 9)
A student must be able to solve the whole case using only (a) concepts the cited sections teach and (b) facts printed on the worksheet. Operationally:
- Every entry in lo_mapping.missing_concepts appears in the student data block as given reference data, framed per invariant P8 (a consultant's procedure sheet, a regulator's standard, a lender's disclosure), never naming the technique.
- Concepts in neither the sections nor the printed reference data are banned (for the example: two-phase simplex, duality, degeneracy, artificial variables).
- The case exercises the same skills problem.txt tests; it may not add new ones.

### Fresh numbers (settled answer 1, decisions log)
The case is a NEW instance: new protagonist, scenario-native quantities, a new data set engineered backward (invariant 5) for clean arithmetic and a pre-chosen verdict (invariant 10, verdict-first). "Clean" is subject-relative and stated during derivation (for simplex: small-denominator fractions are acceptable, engineered pivots that keep entries simple). The case's numbers are verified by the prompt's own VERIFICATION block now and SymPy later; phase 1's verified answer never doubles as the case's key.

### Derivation re-grounding
P1-P8 remain, derived from the files instead of a subject string:
- P1 fence: from problem LO + section LOs; name the adjacent banned concepts explicitly.
- P2 grain: from the problem's part structure (the example's four parts map to compute, interpret, decide, justify).
- P3 full strength: the problem's actual task is the benchmark; no degenerate shrinkage.
- P4 clean numbers: subject-relative convention, stated concretely.
- P5 trap: the topic's real misconceptions with decision stakes (example candidates: pivot row by smallest RHS instead of the ratio test; declaring optimality with a negative still in the bottom row; reading the basic feasible solution backwards). Trap gap must flip or nearly flip the verdict; both numbers clean.
- P6 users: from the problem's own context or fresh authentic roles.
- P7 interpretation: every computation restated in scenario terms.
- P8 reference data: largely transcribed from missing_concepts, plus anything else students cannot derive.
If `<playbook>` is supplied it constrains style (P3-P7 wisdom) but the fence still comes from the files. Derived playbooks are appended as comments for harvest, unchanged.

### Weak-mapping warning (settled answer 5)
Trigger, phrased defensively because phase 1's value vocabulary is Peter's and not fully known to us: any of mapping_confidence not HIGH-like (e.g. "LOW"), no_primary_available true, primary_assessment or supporting_assessment carrying a non-clean value (e.g. "needs_change", "incomplete"), or multipart_assessment indicating missing parts. When in doubt, warn; the banner is cheap and instructor-facing.
Behavior: proceed with the case anyway. Emit a warning banner as % comments at the very top of the .tex source, above \documentclass, naming the trigger and the uncovered concepts, and repeat the note inside the instructor material (alignment block). The student page never shows it. Prompt A explicitly amends the inherited v5 rule "the first characters of your output are \documentclass": when the banner fires, the % WARNING block precedes \documentclass (comments before \documentclass compile fine); the calibration-gate % ERROR line is the only other permitted non-\documentclass opening. (Interpretation of Hitaansh's "print a warning at the top" answer; flagged for his review.)

### Alignment block (upgraded)
Cites the actual PRIMARY and SUPPORTING sections with their roles from lo_mapping (book, section number, title), the problem LO plus the 2-3 section LOs actually exercised, one line on what makes the case distinct, the inert distractors, the corpus-gap note when the warning triggered, and the attribution lines. Instructor-facing only; in same_page mode it stays in comments per v5.

### Preflight additions (on top of v5's list)
- Calibration gate passed against verified_answer.txt.
- Every missing_concept is present in the student data block, technique unnamed.
- No concept used that is outside sections + printed reference data.
- Warning banner present if and only if a trigger fired.
- Attribution lines present.
- No section LaTeX copied verbatim.

---

## 3. Prompt B: phase2_flashcards_prompt_v1.md

An independent artifact (settled answer 2): no references to any case study, scenario, or protagonist. Method concealment does NOT apply; naming and defining techniques is the point of flashcards.

### Inputs
The 5 file blocks, plus `<flashcard_count>` (default 5) and `<audience>` (same default as prompt A; affects wording level only).

### Card sourcing and mix
Every card is grounded in the files:
- Definition/vocabulary cards from PRIMARY and SUPPORTING section LOs and definitions (example: pivot position; basic vs free variables; why row operations preserve solutions).
- Procedure cards from lo_mapping.missing_concepts (example: the entering-variable rule; the minimum-ratio test; the optimality criterion).
- Interpretation cards (example: why the ratio test keeps the plan feasible; what a bottom-row entry means).
Mix rule: roughly 40% definition, 40% procedure, 20% interpretation; with count >= 3 at least one card of each kind. At the default 5: 2 definition, 2 procedure, 1 interpretation.
Traceability: each card carries a % comment citing its source, either a section anchor (e.g. #kuttler-1.3-def-5) or `lo_mapping:missing_concepts[n]`. A card whose answer cannot be tied to a specific file passage may not exist.

### Output contract
One complete, compilable LaTeX document under the SAME fixed house preamble and hard rules as v5 (pdflatex first pass, ASCII only, grayscale, no code fences, allowed packages only). Layout:
- Title line: topic-derived, plus course name prettified from lo_mapping.source_course_level.
- Page 1 "Quiz yourself": numbered card fronts (the prompt/question only).
- Page 2 "Answers": the same numbers with the backs. Numbering must match exactly.
- Bottom of page 2: the small attribution line(s).
- No NAME line, no answer-writing space; this is a study sheet.
- After the body: a % SOURCES comment block listing each card's citation (the per-card comments may live here instead of inline; either way every card is cited exactly once).

### Preflight (its own, short)
Compiles under the house preamble; ASCII; exactly `<flashcard_count>` cards; front/back numbering matches; mix rule honored; every card cited; no case-study references; attribution present.

---

## 4. File plan and testing

New files when implemented:
- prompts/phase2_case_study_prompt_v1.md
- prompts/phase2_flashcards_prompt_v1.md
(v5 remains the manual subject/subtopic mode; the three-prompts-sharing-invariants drift risk is accepted and logged.)

First test (fresh sessions, no project context), both prompts against /phase1example verbatim:
- Case: compiles first pass; calibration gate passes silently; fence holds (no simplex concept beyond the printed procedure sheet); trap present with both numbers and a verdict-flipping gap; warning banner PRESENT (this example's mapping is LOW/needs_change, so it must fire); alignment block cites Kuttler 1.3 PRIMARY, Austin 1.4 and Kuttler 1.2 SUPPORTING; attribution lines present.
- Flashcards: compiles; exactly 5 cards, 2/2/1 mix; every card cited to a real anchor or missing_concepts index; no scenario references.
Negative control to harvest for the future fixture suite: corrupt one number in verified_answer.txt and re-run prompt A; the calibration gate must refuse with the specified % ERROR line. (A gate that never fires is decoration.)

## 5. Open items (accepted, not blockers)
- `<playbook>` as an optional input is our recommendation, never explicitly confirmed by Peter; cheap to keep, remove later if he objects.
- Flashcard decks circulating before a case session can leak the case's concealed method; treated as out of scope per Hitaansh (decks are independent); Peter decides distribution timing.
- The warning-banner placement interprets "top of the case study" as source-top comments plus instructor note, not student-visible text; Hitaansh to confirm when reviewing output.
