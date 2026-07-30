# Webapp deferred minors

Compact record of the minor findings and process notes logged during the 12-task
webapp build (.superpowers/sdd/webapp_implementation_plan/progress.md), plus the
findings added by the final whole-branch review. The final review ran July 30,
2026 and returned verdict SHIP; every item below was triaged DEFER at that
review, except the six marked FIXED, which were pulled into the same July 30
fix wave instead of staying deferred. Nothing here blocks shipping.

## Pipeline

- extractLOs silently returns empty text and misattributes the first LO on a shape mismatch (Task 9, F4).
- An ENOENT on a missing file burns a retry LLM call instead of failing fast (Task 9, F5).
- compile.log is overwritten on every attempt, so a stale log can survive a later success (Task 9, F6).
- The end-to-end test timeout is under twice the worst-case compile time (Task 9, F7).
- A run-id collision is silent, with no uniqueness check or error (Task 9, F8).
- FIXED (fix 8, this wave): failed runs left downstream fan-out stages stuck at "pending"; the UI now renders an honest not-run notice instead of attempting artifact rendering (Task 9, F9).
- Reply parsers are fragile against CRLF line endings outside mock mode (Task 9, F10).
- A cache read error other than DbUnavailableError fails the whole stage instead of degrading, e.g. a corrupt blob (Task 9, F11).
- A partially poisoned cache row can be served as a full cache hit; practice-deck concept attachment is nondeterministic (Task 9, F12).
- Five rows of the stage failure matrix are untested because the relevant helpers are unexported (Task 9, F13).
- Inconsistent FILE label conventions and undocumented practice-deck inputs (Task 9, F14).
- resolveChapter's book_tag to book_key bridge is hardcoded to one textbook; a second book needs a second entry (Task 7).
- concept.ordinal uses MAX+1, which is not race-safe under concurrent writers (Task 7).
- The critic's non-mock pass/fail contract greps for an ERROR line, but the critic prompt expects to write phase1_error.txt; unreconciled until live bring-up (Task 9 live-key note; tracked in CLAUDE.md backlog item 2 alongside the missing corpus tool fence).
- No auth on any API route; acceptable only because this is a local demo (Task 9 live-key note).

## UI

- Status dots carry no screen-reader text (Task 10).
- A minLength/trim mismatch on the home form input is masked because the server already handles it (Task 10).
- Failure states reuse the --warning token; there is no dedicated --error token (Task 10).
- problem.prompt is a schema field with no UI consumer anywhere, pre-existing since Task 4 (Task 11).
- Tab ARIA wiring is only partially complete (Task 11).
- The artifact-fetch cancelled guard has a gap that is a no-op under React 19, not a live bug (Task 11).
- Switching tabs loses flip-card and slideshow-step state; this is deliberate, not a defect (Task 11).
- Math typesets twice on first load, an artifact of the brief's own design (Task 5).
- No fallback if the MathJax CDN fails to load; a known project caveat (Task 5).
- Unused default SVGs remain in webapp/public (Task 5).
- FIXED (fix 6, this wave): the results page gave no signal when the flashcard cache was offline for a run; a muted note now names it (final review addition).
- Cached tab content is section-scoped, not problem-scoped, and the UI copy does not say so yet (Task 9 live-key note).
- The eyes-on browser pass (home form, progress states, PDF embed, flip cards, slideshow, responsive widths) is still owed; everything else is test- and HTTP-verified only (Task 10; tracked in CLAUDE.md backlog item 3).

## Prompts

- FIXED (fix 2, this wave, correcting a Task 1 finding): the BOM finding originally named both case_study_master_prompt.md and practice_deck_prompt.md; only case_study_master_prompt.md actually carries one, verified byte for byte. Still deferred as harmless to the API; strip on next edit.
- Single-vs-double blank line inconsistency inside the preferred_context override block, case_study_master_prompt.md lines 345/349/353 (Task 2).
- The workflow step and quality_check sections of case_study_master_prompt.md do not name preferred_context by name (Task 2).
- concept_flashcards_prompt.md line 156 says bare "prose" where it means back.steps[].prose; line 89 double-phrases the variable_key rule (Task 3).
- FIXED (fix 7, this wave): the variable_key rule in concept_flashcards_prompt.md licensed unbounded entries; the zod contract caps at 8. The prompt now states the same cap (final review addition).
- practice_deck_prompt.md's "typically 4 to 7" step-count language is soft; question.txt/verified_answer.txt are not marked "(required)" (Task 4).
- The chain-rule HTML fixture seed (Task 6) has 9 steps, a mid-deck style:final, and a method-naming problem.prompt; the validator tolerates all of it even though the prompt is intentionally stricter (Task 4).

## Tests

- Fixture card 2 exceeds its own subtitle and description_main word caps (5 words vs cap 4; 18 words vs cap 14) (Task 6).
- parseModelJson's brace-slicing is fragile against stray braces inside prose fields; a brief-inherent limitation (Task 6).
- fixtures/stage1 ships with no problem.txt; Stage 2 user messages must inject the user's problem text as question.txt content instead (Task 6).
- No test simulates a mid-write connection drop or a non-JSON database row; verified mechanically only (Task 7).
- The db integration suite is not idempotent without a volume reset between runs (Task 8).
- One no-explicit-any lint hit matches the brief's own specified type signature (Task 8).
- A ContentBlockParam cast is documented inline at one site rather than eliminated (Task 8).
- The e2e cache test's beforeAll shares textbook chapter 5.4 with the db.integration suite; green today on roughly a 20x timing margin, not structurally isolated (Task 9).

## Process

- FIXED (fix 5, this wave): tools/generate_flashcards_seed.py's docstrings referenced import_concept_flashcards.py and its test file, both deleted; rewritten to describe the generator as it exists now.
- FIXED this wave: a dead webapp/fixtures/critic_ok.json fixture, written for a JSON critic contract the pipeline never adopted, had no code or test reference; removed.
- FIXED this wave: a stray tracked root file named `feedback` (the July 6 review verdict, historical) was removed from the tree; recoverable from git history.
- task-1-report's own Step 3 and Step 4 contradict each other about what the v4 prompt removal covered; cosmetic, the actual removal is correct (Task 1).
- The two root HTML renderer files were swept into git by an `add -A` before Task 12's cleanup; Task 12 had to `git rm` rather than `rm` (Task 1, historical; the later accidental-deck-commit incident of the same shape is logged separately in CLAUDE.md section 9).
- Runtime pin: Next.js 16.2.12 / React 19.2.4 with Turbopack always on; webapp/AGENTS.md and webapp/CLAUDE.md were deleted deliberately, not lost (Task 5, informational).
