# Case Study Generation Pipeline: Build Plan (v1)
### Target: working end-to-end pipeline by end of August  ·  Team of 3

This plan adapts the verified ideas from the recon of the IMathAS template pipeline (recon/PIPELINE_RECON.md) to our product: LLM-generated, machine-verified, LaTeX-rendered case study worksheets for MathGPT.ai. Where their pipeline is human-in-the-loop chat orchestration for one vetted problem at a time, ours is an automated API-driven pipeline meant to produce many cases; where they have 62 schemas and 27 validators grown over years, we start with 6 artifacts and 6 checks and grow the rule corpus one caught failure at a time, exactly the way theirs grew.

---

## 1. Core design decisions (and where each comes from)

1. **Semantic before concrete** (recon idea #1). The LLM authors a structured JSON `case_spec`, not LaTeX. Math lives as SymPy-parseable expressions with expected answers. Verification runs on the spec; LaTeX is rendered only from a verified spec. Content and presentation never mix.
2. **Ground-truth hierarchy** (recon #9): SymPy result > LLM claim; pdflatex result > LLM claim about compiling; approved playbook > model inference. Written down, enforced in code.
3. **Evidence-gated stages** (recon #4). A stage passes by producing its evidence artifact (per-answer recomputation report, compile log, judge ledger), never by "no errors found."
4. **Read-only validators, quarantined mutation** (recon #5). Validators report, they never edit. The only things that write case content are the author stage and the regeneration loop. Any format-only fix pass is guarded by a forbidden-change scan: boxed answers, expressions, trap numbers, verdict, and question count must be byte-identical before and after.
5. **Defense in depth** (recon #2). The highest-stakes rules live in three places: the prompt (v5 invariants), a linter, and the final gate. Examples: scope fence (banned concepts), answer-number consistency, trap materiality.
6. **Verification is not approval** (recon #3). Terminal machine status is `READY_FOR_INSTRUCTOR_REVIEW`. Only a human sets `APPROVED_FOR_MATHGPT`. Early on, that human is Peter calibrating difficulty against the taco-truck benchmark.
7. **Per-run isolation** (recon #6, lightweight). Every run gets `runs/<run_id>/` holding all artifacts plus a `run_manifest.json` with input hashes and stage statuses. No artifact is ever read from outside the run folder.
8. **Fixtures with negative controls** (recon #8). A `fixtures/` corpus of good and bad case specs; the bad ones must keep failing. CI is just "run the validators over fixtures and diff against expected_results.json."
9. **Adversarial judge with a ledger** (recon #7). The LLM-as-judge stage must log every check it ran, including non-findings with evidence, into a ledger. A judge that only reports what it stumbled on is not a judge.
10. **Reasoning sufficiency, not just answers** (recon #10). The key must show operator-bearing steps deriving each boxed value. A lint rejects "the answer is X" with no work.

**Deliberately not copied:** chat-message orchestration (we call APIs), their schema/tool count (right-sized), their render-portal handoff (our render target is pdflatex plus, later, MathGPT's web math renderer), policy-text sprawl (each rule has one authoritative statement; prompt and linter reference it).

---

## 2. Pipeline stages

```
request.json
   |
   v
S0 INTAKE            -> runs/<run_id>/run_config.json          gate: GO / BLOCKED_BAD_INPUT
   |
   v
S1 PLAYBOOK          -> playbook.json (from cache or derived)  gate: GO / NEEDS_PLAYBOOK_APPROVAL
   |
   v
S2 AUTHOR (LLM)      -> case_spec.json (schema-validated)      gate: GO / BLOCKED_SCHEMA
   |
   v
S3 VERIFY (SymPy)    -> verification_report.json               gate: GO / REGENERATE (max 3) / BLOCKED_MATH
   |
   v
S4 RENDER (LLM/tpl)  -> case.tex + render_lint.json            gate: GO / RERENDER (max 2)
   |
   v
S5 COMPILE           -> case.pdf + compile_report.json         gate: GO / RERENDER
   |
   v
S6 JUDGE (LLM)       -> judge_report.json + check_ledger.json  gate: GO / REGENERATE / ADVISORY_FLAGS
   |
   v
S7 PACKAGE           -> package.zip + run_manifest.json        status: READY_FOR_INSTRUCTOR_REVIEW
   |
   v
HUMAN GATE (Peter / instructor)                                 status: APPROVED_FOR_MATHGPT /
                                                                        CHANGES_REQUESTED(route to S2 or S4)
```

**S0 Intake.** Validate the request (subject, subtopic required; domain, case_number, key_placement, count optional). Create `runs/<run_id>/`, hash inputs into `run_manifest.json`.

**S1 Playbook.** Look up `playbooks/<subject>__<subtopic-slug>.json`. Cache hit with `approved: true` proceeds. Miss: one LLM call derives the playbook (P1 to P8 from prompt v5), saved with `approved: false`, run pauses at `NEEDS_PLAYBOOK_APPROVAL`; a human skims, edits, flips the flag once, and every future run for that subject reuses it. This is the harvest loop as a pipeline stage, with the consistency and cost benefits of deriving once.

**S2 Author.** One LLM call with: v5 invariants (adapted to emit JSON, see section 5), the approved playbook, and the request. Output is `case_spec.json`, validated against `case_spec.schema.json`. Schema failure retries once with the validator errors appended, then blocks.

**S3 Verify.** Deterministic, read-only, no LLM. For every part, map `math.kind` to a SymPy routine, recompute the expected answers from the expressions, and emit per-answer evidence: `{part, quantity, expected, recomputed, match, method}`. Also checks: trap wrong-number recomputed from the stated wrong method; trap materiality (the wrong and right numbers land on opposite sides of the decision threshold, or differ by a configured minimum); clean-number policy from the playbook (integers or stated rounding); scope fence (expression feature scan: e.g., a calc1-no-integrals run must contain no `Integral` nodes; banned function forms per playbook). Any mismatch routes back to S2 with the findings attached to the prompt (max 3 regenerations, then `BLOCKED_MATH` for human eyes).

**S4 Render.** Convert the verified spec to `case.tex` with the house preamble. Two acceptable implementations, choose during build: (a) Jinja2 template filled from the spec, with an LLM only polishing prose fields, most deterministic; or (b) one LLM call given the spec plus the LaTeX contract, simplest to build first. Either way `render_lint.py` then checks: ASCII only, escaped percents, allowed packages, NAME line, mini-titles present, hints present, skill labels present, boxed values in the key **string-match the verified expected values exactly** (this is our forbidden-change scan: the renderer may not touch a number), derivation sufficiency (each boxed value preceded by at least one operator-bearing step), and concept-name concealment on the student pages (scan student-facing text for the playbook's concept terms).

**S5 Compile.** `pdflatex` (or `tectonic` for a single-binary deploy), first pass must exit 0. Record page count (informational only, per our page-count decision). Compile failure routes back to S4 with the log excerpt (max 2), then blocks.

**S6 Judge.** One LLM call, different model or at least different prompt persona than the author, given the PDF text plus the spec, with a fixed checklist it must fill as a ledger: cohesion (recommendation needs all parts), strip test, trap framed as discussion with checkable resolution, verdict honesty, difficulty versus the taco-truck anchor, audience fit. Every check gets PASS/FAIL/CONCERN with quoted evidence; non-findings must state what was examined. Hard failures route to S2; soft concerns attach as `ADVISORY_FLAGS` for the human gate rather than blocking (judges are noisier than linters; do not give the noisy layer a hard veto on subjective calls).

**S7 Package.** Zip: pdf, tex, case_spec, all reports, ledger, run_manifest with SHA-256 of each artifact. Status `READY_FOR_INSTRUCTOR_REVIEW`, never anything that sounds like done.

**Human gate.** Approve, or request changes routed to S2 (content) or S4 (format). Format-only fixes re-run the forbidden-change number scan.

---

## 3. Artifacts and schemas (all JSON Schema validated)

1. `run_config.json`: request echo, run_id, versions, hashes.
2. `playbook.json`: P1..P7 fields, subject, subtopic, approved flag, approver, version.
3. `case_spec.json`: the heart. Sketch:
```json
{
  "meta": {"subject": "calc1", "subtopic": "...", "playbook_id": "...", "title": "...", "case_number": 3},
  "scenario": {"protagonist": "...", "decision": "...", "prose": "..."},
  "data_items": [{"id": "d1", "text": "...", "role": "needed|inert"}],
  "parts": [{
    "id": "q1", "mini_title": "...", "prompt": "...", "hint": "...",
    "math": {
      "kind": "optimize|accumulate|solve|evaluate|matrix_op|finance",
      "symbols": {"t": "real"},
      "expressions": {"C": "120*t - 30*t**2"},
      "task": {"op": "maximize", "target": "C", "var": "t", "domain": [0, 4]},
      "expected": {"t_star": "2", "C_star": "120"}
    },
    "interpretation": "...", "skill_label": "..."
  }],
  "trap": {"claim": "...", "wrong_method_expr": "300 + 80*12", "wrong_value": "1260",
            "right_part": "q2", "right_value": "972"},
  "verdict": {"decision": "...", "thresholds": [{"name": "...", "value": "600", "compare_to": "972"}]},
  "alignment": {"sections": ["..."], "objectives": ["..."], "inert_items": ["d3"]}
}
```
4. `verification_report.json`: per-answer evidence rows, trap materiality result, scope-fence result, overall PASS/FAIL with routed findings.
5. `render_lint.json`, `compile_report.json`, `judge_report.json` + `check_ledger.json`.
6. `run_manifest.json`: stage statuses, artifact hashes, retry counts, timings, model ids, token counts and cost per LLM call (we automate the layer their pipeline left manual, so we also get the cost telemetry they could not).

Six schemas total to start. Grow only when a real failure demands it.

---

## 4. Fixtures and negative controls (`fixtures/`)

- `good/`: 3 hand-checked specs (taco truck, food bank, recycling) that must pass S3 and render.
- `bad/wrong_answer/`: taco truck spec with C_star of 130; S3 must FAIL.
- `bad/immaterial_trap/`: trap wrong and right on the same side of the threshold; S3 must FAIL.
- `bad/scope_breach/`: calc1 no-integrals request whose spec contains an Integral; S3 must FAIL.
- `bad/mutated_render/`: a .tex whose boxed value differs from the spec; render lint must FAIL.
- `bad/answer_only_key/`: key states values with no derivation steps; render lint must FAIL.
- `expected_results.json` maps each case to PASS/FAIL; `run_fixtures.py` is the CI command. Negative controls must keep failing forever; a bad fixture that starts passing is a regression in the checker.

New fixtures harvested from the v4 review (each with a bad case that must keep failing): a hint that names the technique; a missing reference value; an immaterial trap gap; a fenced output; a unicode-contaminated source.

---

## 5. Prompt migration (what happens to the single-shot prompt)

v5 (which superseded v4 after the July 2 external review) stays as the single-shot manual prompt (useful for quick experiments and for Peter). The pipeline splits it into three derived prompts, all sharing v5's invariants and playbooks as the single source of truth:
- **author.md**: invariants + playbook + request, output contract changed from LaTeX to `case_spec.json` per the schema. Expressions must be SymPy-parseable Python syntax (`**` not `^`), a rule stated in the prompt AND enforced by the schema AND rejected by the verifier (defense in depth).
- **render.md**: verified spec in, LaTeX contract (the v5 preamble and rules) out. It is told, and lint enforces, that it may not alter any number.
- **judge.md**: the checklist ledger prompt built from v5's preflight items, reworded adversarially ("find the way this case fails the strip test; if you cannot, state what you examined").

---

## 6. Tech stack

Python 3.11+, `anthropic` SDK (plus optional `openai` for provider comparison through the same interface), `sympy`, `jsonschema`, `jinja2` (if template rendering), `pdflatex` via TeX Live in a Docker image or `tectonic` binary. CLI first: `python run.py --subject calc1 --subtopic "..." --count 5`. Linear script with gates; no orchestrator framework (a queue or Prefect is a post-August upgrade if MathGPT needs throughput). Stretch: a thin FastAPI wrapper exposing `POST /generate` and `GET /runs/<id>` for MathGPT integration, returning the package and the advisory flags.

---

## 7. Work split and timeline (3 people, ~8 weeks, assume 2 of 3 active any given week)

**Person A: prompts and LLM stages** (author, playbook derivation, judge; owns v4 and its derived prompts; runs provider comparisons).
**Person B: verification core** (case_spec schema, SymPy verifier with evidence rows, scope-fence scanner, fixtures and negative controls).
**Person C: render and infrastructure** (render stage and lint, compile stage, run isolation, manifest, CLI, packaging; stretch API).

- **Weeks 1 to 2 (early to mid July).** Freeze `case_spec.schema.json` FIRST, everything hangs off it (the recon shows how painful late artifact changes are). Person B builds the verifier against the three good fixtures by hand-writing specs. Person A adapts v4 into author.md and gets first schema-valid specs from the API. Person C stands up run folders, compile stage, and the preamble template.
- **Weeks 3 to 4.** End-to-end happy path for calc1: request to PDF with verification. Negative controls in CI. Playbook cache with approval flag. First 10 cases sent to Peter; his feedback becomes new golden rules and fixtures.
- **Weeks 5 to 6.** Judge stage with ledger. Regeneration routing with findings-in-prompt. Add linear_algebra and intro_finance verify routines (matrix ops and finance formulas in SymPy are straightforward). Render lint completeness (concealment scan, derivation sufficiency).
- **Weeks 7 to 8.** Hardening: run 100-case batch, measure failure rates per gate, cost per accepted case, tune retries. Package the demo: pipeline run live plus a folder of approved cases. Buffer for the deadline.

**Definition of done for August:** a CLI that takes subject and subtopic and emits `READY_FOR_INSTRUCTOR_REVIEW` packages for all three subjects, with every number machine-verified with evidence, negative controls green in CI, and a measured acceptance rate and cost per case.

---

## 8. Metrics to log from day one (their pipeline could not; ours can)

Per run: tokens and dollars per LLM call, retries per gate, wall time per stage, which gate rejected. Weekly: first-try pass rate at S3 (the single best measure of prompt quality), judge concern rate, human change-request rate and reasons. These numbers are what tell you whether to spend effort on the prompt, the verifier, or the renderer, and they are the slide Peter will actually care about.
