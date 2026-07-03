# PIPELINE_RECON.md — v3.26.9 IMathAS/MyOpenMath Template Pipeline

Read-only static reconnaissance. No pipeline was run, no code executed, no network calls made. Secrets are redacted as `[REDACTED]` (none were found; only env-var *names* and one model name appear).

---

## 1. What this pipeline does

This pipeline turns **one human-vetted STEM source problem** into a **statically validated IMathAS/MyOpenMath assessment-template package** (an online math homework "question" with graded answer boxes, a worked solution, and metadata). It is not a conventional code service: it is a **prompt repository plus a suite of Python static validators**, driven by an LLM "operator agent" (the manual specifies GPT‑5.5 Pro) that runs seven phases in strict order, one chat message per phase, stopping at a gate each time. The phases freeze the source, solve the math canonically, design an assessment contract with only *semantic* answer identifiers, compile the design into IMathAS template syntax, adversarially audit it, repair routed findings, and package the result. Every gate is backed by machine-checkable evidence (JSON Schemas, SHA-256 artifact hashes, and ~27 Python linters), and the terminal success status is deliberately **not** "production ready" but `READY_FOR_HUMAN_REVIEW_STATIC_VERIFIED` — a human must still render the four output files in a real portal before deployment. The whole design is an evidence-gated "generate → verify → gate" loop where static verification is explicitly declared *insufficient* on its own.

---

## 2. Stage map

```
[human source inputs]              (problem.txt, primary.md, supporting_*.md,
   │                                lo_mapping.json, verified_answer.txt)
   ▼
Phase 0  Config + render-capability preflight ──► run_configuration.json, phase_0_gate.json
   │  gate: GO / BLOCKED_*
   ▼
Phase 1  Clean intake + canonical math solution ─► source_freeze_manifest, canonical_math_solution.*
   │  gate: GO / BLOCKED_SOURCE_*
   ▼
Phase 2  Assessment + student-flow CONTRACTS ───► phase2_assessment_contract, answer_object_contract,
   │  (2A contract, 2B blueprint, 2C draft,        worked_solution_blueprint, student_facing_draft, ...
   │   2D pedagogy audit)  — SEMANTIC ids only     validated by tools/validate_phase2_contracts.py
   │  gate: GO / BLOCKED_TRANSFORMATION_* / BLOCKED_STATIC_TARGET_DIALECT_FAILURE
   ▼
Phase 3  First-try IMathAS generation ───────────► 01_generated_template_first_try.txt (+ mapping, lint)
   │  (semantic id → concrete $answer[N]/$answerbox[N] happens ONLY here)
   │  gate: GO / BLOCKED_STATIC_TARGET_DIALECT_FAILURE
   ▼
Phase 4  Adversarial audit (4A–4F) ─────────────► 02_audit/*.json, defect_inventory_and_score, concern_ledger
   │  Build FULL defect inventory BEFORE scoring
   │  gate: GO_NO_FIXES_REQUIRED / REPAIR_NOW / BLOCKED_*
   ▼
Phase 5  Fix plan + fixed candidate ────────────► fix_plan.json, format_fix_plan.json, 03_fixed_template_candidate.txt
   │  every finding → routing_class; only POSTPROCESSOR_SAFE → format_fix_plan
   │  gate: GO / BLOCKED_FIX_REQUIRES_SOURCE_POLICY_DECISION
   ▼
Phase 6  ONE postprocessor run + regression + split + package
   │  ► 03_fixed_template.txt (only if PASS), final_imathas_files/{common_control,question,explanation,description}.txt,
   │    package_validation_report.json, run_lifecycle_manifest.json, final ZIP
   │  gate: READY_FOR_HUMAN_REVIEW_STATIC_VERIFIED / BLOCKED_*
   ▼
Human gate  Render 4 files in real IMathAS/MyOpenMath portal, grade with right+wrong answers
      status: HUMAN_REVIEW_APPROVED_FOR_DEPLOYMENT / REQUESTS_CHANGES / REPAIR_REQUIRED_AFTER_HUMAN_RENDER_REVIEW
```

**Per-stage description.**

- **Phase 0 — Config/preflight.** Picks a run configuration (`MINIMAL`, `TEXT_FOCUSED`, `AUDIT_FOCUSED`, `FULL_ADVERSARIAL`, `TARGETED_DEBUG`), records whether a render backend exists and whether the template needs render-only features (`render_required_by_feature`). Also preflights the GOLDEN rule files (hash/count/integrity). Rendering is treated as *capability metadata, not a default blocker*.
- **Phase 1 — Clean intake.** Freezes the source (hash manifest), inventories every "source deliverable" the student must produce, and writes a canonical math solution (`.md` + `.json`) plus a source-method/randomization policy and a dynamicity decision. Hardcoding is forbidden unless a fixed-instance exception is approved.
- **Phase 2 — Contracts.** Designs the assessment using **only semantic identifiers** (`semantic_part_id`, `display_part_label`, `logical_answer_order`, `semantic_answer_object`) — no concrete IMathAS indices yet. Four subphases: 2A assessment/answer contract, 2B worked-solution blueprint, 2C student-facing draft, 2D pre-code pedagogy audit. Answer-type feasibility is decided here: anything that would compile to `essay` must be transformed to a target-safe type or the phase blocks.
- **Phase 3 — Generation.** Acts as a "target-syntax compiler": compiles the Phase 2 draft into backtick-AsciiMath / IMathAS template text and *only here* binds semantic parts to concrete `$answer[N]`/`$answerbox[N]`. Runs target-syntax and Common-Control runtime lints before freezing the first-try file.
- **Phase 4 — Adversarial audit.** Six sub-audits (4A semantic flow, 4B portal control / answerbox setup, 4C math enumeration, 4D pedagogy + derivation sufficiency, 4E render/format diagnostic, 4F defect inventory + score). Rule: build the *complete* defect inventory before scoring; every prose concern must land in `concern_ledger.json`.
- **Phase 5 — Fix.** Routes each finding to a `routing_class`; only `POSTPROCESSOR_SAFE` findings may go into `format_fix_plan.json`. Produces a *candidate* (not final) fixed template. Does not run the postprocessor.
- **Phase 6 — Package.** Runs the postprocessor exactly once, then a forbidden-change scan, regression controls, final static validation, splits into the four portal files, and packages. Emits `READY_FOR_HUMAN_REVIEW_STATIC_VERIFIED` only if all static gates pass and `render_required_by_feature=false`.
- **Human gate.** Human imports the four files, renders, and grades. A visible render failure forces `REPAIR_REQUIRED_AFTER_HUMAN_RENDER_REVIEW` — static status cannot override it.

---

## 3. Inventory

**Stack.** Python ≥ 3.8 (developed on CPython 3.12.3), **standard library only** except one dependency: `jsonschema >= 4.18` (`requirements.txt` pins `>=4.0`). No web framework, no DB, no queue, no cloud SDK. "Runtime" targets are IMathAS/MyOpenMath (PHP) but PHP is optional and only for *local* rendering (`IMATHAS_PATH`). The pipeline itself is prompt-Markdown + Python linters.

**Entry points / how it's invoked.**
- **The pipeline "run"** is driven by a human+LLM in a chat: attach the ZIP + source files, send the Phase 0 message from `OPERATOR_MANUAL_v3.26.9.md`, wait for the gate, send "GO PHASE 1", etc. There is no orchestrator process.
- **The validators** are CLI tools run from inside the intact tree, e.g. `python3 tools/validate_package.py .`, `python3 tools/package_gate_evaluator.py <run_state.json>`. Each resolves the package root via `Path(__file__).resolve().parents[N]` and imports siblings — they break if moved out of the tree.

**Directory tree (2–3 levels, caches/artifacts elided).**
```
audit_v3.26.9.production/
├── OPERATOR_MANUAL_v3.26.9.md      # AUTHORITATIVE run book (phase messages, rules)
├── README.md  QUICK_START.md  ENVIRONMENT.md  requirements.txt
├── ACTIVE_AUDIT_PROFILE.json  PRODUCTION_MANIFEST.json  file_manifest.json  audit_index.json
├── PACKAGE_VALIDATION_REPORT.json  CHANGELOG_v3.26.0..9.md
├── pipeline/                       # the PROMPTS = the pipeline logic
│   ├── phase_0_render_backend_preflight/prompt.md
│   ├── phase_1_clean_intake/prompt.md
│   ├── phase_2_student_solution/{prompt, 2A,2B,2C,2D}.md
│   ├── phase_3_first_try_generation/prompt.md
│   ├── phase_4_adversarial_audit/{prompt,4A,4B,4C,4D,4E,4F}.md
│   ├── phase_5_fix_candidate/prompt.md
│   ├── phase_6_regression_package/prompt.md
│   └── human_gate/prompt.md
├── schemas/                        # 62 JSON Schemas (one per artifact/gate)
├── tools/                          # 27 Python validators/linters (see §6)
│   ├── anti_regression/  golden_rules/  render_format_engine/  semantic_gates/
├── references/                     # policy docs + GOLDEN rule files (format=86, flow=54 rules)
│   ├── golden_rules/{format_audit_rules.md, flow_audit_rules.md}
│   └── legacy/  *.md/*.json policies
├── fixtures/                       # good/bad test cases + expected_results.json per validator
│   ├── answerbox_setup/ golden_format_flow/ package_gate/ lifecycle_schema/ ...
├── records/                        # empty "clean_room_empty" run-record dir
└── .understand-anything/           # knowledge-graph tool CACHE (not pipeline code; ignore)
```

---

## 4. Orchestration and state

**Orchestration.** Homemade, human-in-the-loop, chat-message-per-phase. There is **no** Airflow/Prefect/Temporal/Celery, no queue, no scheduler. The "orchestrator" is the operator manual: a strict linear state machine `0→1→2→3→4→5→6→human`, one message per phase, mandatory stop at each gate, no phase-combining unless the message says so. The LLM agent is the executor; the Python tools are the gate checks the agent (and a human) run.

**State between stages = files on disk, isolated per run.** Each run gets one **run-specific artifact root** and a `run_lifecycle_manifest.json`. `tools/run_lifecycle_validator.py` enforces: `pipeline_version == 'v3.26.9'`, presence of `run_id`/`run_root`, and that **every** phase-artifact path lives inside `run_root` (`PHASE_ARTIFACT_ROOT_OUTSIDE_RUN_ROOT`). Phase N may consume an artifact only if its `pipeline_version`, `run_id`, and dependency hashes match — stale v3.26.5 artifacts or anything outside the run root **block**. Phase completion is proven by SHA-256 hashes in a `phase_artifact_manifest` / `phase_completion_matrix`.

**Schemas / formats.** 62 JSON Schemas in `schemas/` define every artifact and gate (e.g. `run_configuration_schema.json`, `phase2_assessment_contract_schema.json`, `answerbox_setup_contract_schema.json`, `derivation_sufficiency_audit_schema.json`, `package_validation_report_schema.json`, `status_registry.json`, `check_registry.json`). The template files themselves use an IMathAS DSL with `<<<BLOCK>>>` sentinels (`<<<COMMON_CONTROL>>>`, `<<<QUESTION>>>`, `<<<EXPLANATION>>>`, `<<<DESCRIPTION>>>`) and backtick-delimited AsciiMath for student-facing math.

**Configuration & environments.** Config is data-driven: `ACTIVE_AUDIT_PROFILE.json` (profile, retired statuses, target-runtime policy), `PRODUCTION_MANIFEST.json` (authoritative active-file list + hashes), `run_configuration.json` (per-run mode). Environments differ by **run configuration mode** (MINIMAL … FULL_ADVERSARIAL) and by render capability, not by dev/prod deploy targets. Env vars: `IMATHAS_PATH` (optional, local render only), `PYTHONDONTWRITEBYTECODE` (set by the validator). No `.env`, no secrets.

---

## 5. LLM layer

**Provider/model.** The only model reference in the repo is in `OPERATOR_MANUAL_v3.26.9.md:37`:
```text
GPT-5.5 Pro with extended/deep reasoning enabled
```
There is **no** LLM SDK, API client, API key, base URL, temperature, token-tracking, caching, or retry code anywhere in the Python. The LLM is invoked *manually by a human operator pasting phase messages into a chat*. All "retry/fallback" logic is procedural (re-send the phase message after fixing the blocker). So sampling settings, structured-output parsing, cost tracking, and caching are **out of band** (whatever the chat UI provides). Structured output is obtained by *instructing* the model to emit named JSON artifacts, which are then validated against JSON Schema by `validate_phase2_contracts.py` / `validate_package.py` — schema validation is the parsing/enforcement layer, and if `jsonschema` is missing it reports `schema_validation = SKIPPED_NO_JSONSCHEMA` (an explicitly-flagged hole).

**Prompt templates.** The "prompts" are the phase messages in the operator manual plus the `pipeline/**/prompt.md` files. Three of the most important, with paths:

Phase 0 launch message — `OPERATOR_MANUAL_v3.26.9.md` (Phase 0 "Message to send"):
```text
You are an expert IMathAS/MyOpenMath template-generation agent. I've attached the
v3.26.9 pipeline ZIP and the source inputs. Treat the ZIP as the authoritative prompt
repository: read PRODUCTION_MANIFEST, ACTIVE_AUDIT_PROFILE, the pipeline phase prompts,
schemas, references, tools, GOLDEN format/flow rules, and fixtures before any work.

Run Phase 0 ONLY: run configuration + render-capability preflight. Mode: MINIMAL unless I say otherwise.

Produce: run_configuration.json, phase_0_render_backend_preflight.json,
golden_rule_file_validation_report.json, golden_rules_index.json, phase_0_gate.json.

Do not start Phase 1, solve the math, generate, audit, fix, or run the postprocessor.
If a required input is missing, stop with a BLOCKED status and list the exact missing
items. End after the Phase 0 gate; wait for "GO PHASE 1".
```

Phase 3 generation prompt — `pipeline/phase_3_first_try_generation/prompt.md` (excerpt, ~40 of 118 lines):
```text
# Phase 3 — First-try IMathAS generation
Generate `01_generated_template_first_try.txt` from Phase 1 and Phase 2 contracts.
No audit, no diagnostic, no fix, no postprocessor, no scoring.
...
Map semantic_part_id/logical_answer_order to concrete `$answer[N]` and `$answerbox[N]` only here.

## v3.26.9 Target math-markup contract
- Use explicit multiplication for generated coefficient-variable products, e.g. `$coef*x`, `2*$a`.
- Do not emit dynamic interpolation adjacency such as `2 $a`, `$a 2`, `$coef x`
  (R13_DYNAMIC_INTERPOLATION_ADJACENCY).

Forbidden in student-facing text unless live render evidence certifies an exception:
  \[  \]  \(  \)  $$  \begin{...} \end{...}  \lambda \det \quad \bigl \bigr \left \right \\

Phase 3 must run target-syntax lint and produce phase_3/target_math_syntax_lint.json.
Required pass condition:
{ "target_dialect": "backtick_asciimath", "raw_latex_marker_count": 0, "status": "PASS" }

## Common Control runtime dialect hotfix — BLOCKERS:
- `$anstypes` contains `essay` for this target workflow.
- Common Control calls `mult(` for matrix multiplication. Use `matrixprod(`.
- `$showanswer[i] = "`$answer[i]`"` raw array-element interpolation. Use scalar display vars.
- A prompt compiled to `choices` still asks the student to enter/justify an open response.
Macro validation hierarchy: target render behavior > official IMathAS source > local GOLDEN table > model inference.

## HTML-source-safety: reject raw `<`,`>`,`<=`,`>=` in backtick spans (use lt/gt/le/ge).
```

Phase 4 adversarial-audit message — `OPERATOR_MANUAL_v3.26.9.md` (Phase 4 "Message to send", excerpt):
```text
GO PHASE 4. Run Phase 4 only: adversarial audit of 01_generated_template_first_try.txt.
Produce all Phase 4 sub-artifacts: 02_audit/4A_semantic_flow.json ... 4F_defect_inventory_and_score.json,
plus golden_rule_audit_report.json, asciimath_span_safety_phase4.json, target_math_syntax_lint_phase4.json,
render_format_diagnostic_phase4.json, audit.json, audit_report.md, non_findings_checked.json,
adversarial_inputs_tested.json, self_report_flags.json, and phase_4_gate.json.

Build the FULL defect inventory before scoring. Walk the active v3.26.9 GOLDEN format and flow rules.
Every non-finding must have evidence. Check known regression classes, including unsafe internal
identifiers in backtick math spans, duplicate visible peer labels, explanation math-to-prose glue,
tall inline vector/matrix layout, empty DESCRIPTION, source/flow drift, target-forbidden `essay`
answer types, unsupported `mult(`, raw `$answer[i]` showanswer interpolation, and choices/open-response
prompt mismatches. Do not fix, postprocess, or package.
```

---

## 6. Quality and verification

This is the pipeline's center of gravity. Verification is layered and **redundant by design** (defense-in-depth): the same runtime rules are enforced in the phase prompts, in a dedicated linter, *and* re-derived in the final gate.

**Static validators (`tools/`, 27 Python files, stdlib + jsonschema).**
- `validate_package.py` — whole-package read-only validator. Exit 0 PASS / 2 FAIL. Hard-fails `JSONSCHEMA_DEPENDENCY_MISSING` if `jsonschema` absent. Checks: no debug artifacts (`__pycache__`, `.DS_Store`, `.pyc`, `__MACOSX`), JSON parses, `PRODUCTION_MANIFEST` active-file list+count, canonical operator-manual identity, `file_manifest.json` SHA-256s, then **imports and runs many fixture suites** (render-diagnostic, package-gate, phase2, answerbox, derivation, lifecycle-schema, source-math-normalization, run-lifecycle, golden-rule integrity [format=86, flow=54], version-filename, postprocessor) plus anti-regression/change-control checks. Self-validates its own report against a schema. Read-only by contract, works in a temp dir.
- `package_gate_evaluator.py` — master final-gate. Rejects phase-gate statuses used as final, generic ready statuses, and `PRODUCTION_READY`. When "ready" it demands: complete phase-completion matrix (2A–2D, 4A–4F), SHA-256 artifact proofs, non-empty `final_imathas_files` incl. DESCRIPTION, and PASS on `target_math_syntax_lint`, `render_format_diagnostic`, `golden_format_flow_audit`, `common_control_runtime_policy_lint`, answerbox contract, derivation audit, lifecycle schema. Independently **re-derives runtime-policy issues** (`_runtime_policy_issues`).
- `common_control_runtime_policy_lint.py` — target-runtime linter. Parses `$anstypes` in array *and* comma-string forms. BLOCKERs: `TARGET_FORBIDDEN_ESSAY_ANTYPE`, `UNSUPPORTED_MATRIX_MULT_MACRO` (`mult(`), `RAW_ARRAY_ELEMENT_SHOWANSWER_INTERPOLATION`, and for choices/multans: missing `$questions[i]`, out-of-range/absent `$answer[i]`, missing/untied `$showanswer[i]`, `CHOICES_PROMPT_ACTION_MISMATCH`. Encodes rules learned from a real failure (`lay6e_s10_5_e42`).
- `math_markup_lint.py` — AsciiMath/HTML-source safety. Flags raw LaTeX, snake_case/internal identifiers in backtick spans, prose-in-math, AsciiMath reserved-token collisions (`prod` in `products`), `R13_DYNAMIC_INTERPOLATION_ADJACENCY`, and raw relational operators (`<`,`>`,`<=`,`>=` → BLOCKER, since `<` can start an HTML tag).
- `answerbox_setup_audit.py` — proves the full chain semantic_part_id → answer index → key → type → prompt line → answerbox line → placement → leakage-absent, with **line-level evidence** per part; rejects vague summary flags (13 required fields, five booleans must be exactly `True`, answerbox line must come after prompt line).
- `semantic_gates/derivation_presence.py` — worked-solution sufficiency: a computational answer must show an operator-bearing derivation, not just state the value. Codes: `DERIVATION_ABSENT_ANSWER_ONLY`, `SOLVE_STEP_STATES_ANSWER_WITHOUT_WORK`, plus a Gram-Schmidt-specific check.
- `render_format_engine/v3269_render_format_diagnostic.py` — read-only render-format diagnostic (glue, split sentences, non-unique labels, tall inline matrices, loop-closure, unbalanced backticks, precision contradictions); filters `RETIRED_CODES`.
- `render_format_engine/v3269_format_postprocessor.py` — the single Phase-6 mutator. Refuses unless `plan.semantic_safety_verified is True`; applies only 4 authorized change classes; then runs an **8-field forbidden-change scan** (answer keys, anstypes, randomization, graded-part count, source deliverables, math formulas, flow semantics, explanation logic). Any forbidden change → FAIL, nothing written.
- Others: `validate_phase2_contracts.py`, `run_lifecycle_validator.py`, `asciimath_span_safety.py`, `source_math_normalization_lint.py`, `version_filename_consistency_audit.py`, `create_external_render_handoff.py`, golden-rule integrity/index tools, anti_regression crossref/deprecation gates.

**LLM-as-judge / adversarial eval.** Phase 4 *is* an LLM-as-judge adversarial audit (4A–4F), required to build a full defect inventory and log every concern into `concern_ledger.json` before scoring, and to record `non_findings_checked.json` + `adversarial_inputs_tested.json` (evidence that negatives were actually tested, not assumed).

**On failure.** Findings get a `routing_class` in Phase 5 (`POSTPROCESSOR_SAFE`, `SEMANTIC_FIX_REQUIRED`, `PORTAL_CONTROL_FIX_REQUIRED`, `MATH_FIX_REQUIRED`, `NOTATION_PEDAGOGY_REVIEW`, `HUMAN_REVIEW_REQUIRED`, `NON_FINDING_FALSE_POSITIVE`). Auto-fixable defects still count against the first-try score. `BLOCKED_*` statuses halt the run with an exact blocker to fix and re-send. Source-deliverable transformations cannot be self-approved by the model — they require explicit policy proof or a human.

**Tests.** No pytest/unit-test suite per se; instead **fixture-driven golden tests**: each validator has `fixtures/<suite>/{good,bad_*}/…` inputs plus an `expected_results.json` mapping case→PASS/FAIL (e.g. `fixtures/package_gate/expected_results.json` has ~20 cases like `generic_ready_retired: FAIL`, `score_scale_100_without_20: FAIL`). `validate_package.py` runs these suites as its regression harness, plus explicit **negative controls** that must keep failing.

**Logging/observability.** File-based: every phase emits gate JSON + artifacts; `run_lifecycle_manifest.json` is the per-run ledger; `concern_ledger.json` tracks every raised concern to resolution; validators emit structured JSON reports with `input_sha256`. `records/` is an intentionally empty "clean_room_empty" record dir. No dashboards/metrics service.

---

## 7. Operations

- **Deploy / packaging.** No Docker/serverless/VM. "Deployment" of the pipeline = distribute the ZIP; a "run" = attach ZIP + inputs to a chat. The *product* output is a package ZIP whose four `final_imathas_files/*.txt` a human pastes into an IMathAS/MyOpenMath portal.
- **CI/CD.** None in-repo. The self-contained regression harness (`validate_package.py` + fixtures + `PACKAGE_VALIDATION_REPORT.json`) is what a CI job would call, but no workflow files exist.
- **Scheduling.** None (human-triggered, one problem per run).
- **Secrets management.** N/A — no secrets, keys, or `.env`. Only env-var names: `IMATHAS_PATH` (optional local render path), `PYTHONDONTWRITEBYTECODE`. `[REDACTED]` not needed anywhere.
- **Scaling / concurrency.** Per-run isolation via unique `run_root`/`run_id` and hash-matched artifacts prevents cross-run contamination; there's no parallel execution engine. Rate limits are whatever the chat/model layer imposes (out of scope for the code).
- **Rendering handoff.** Real rendering is external: `create_external_render_handoff.py` produces a handoff for a live portal; the legacy in-package render engine was intentionally removed and kept out of the verification path.

---

## 8. Top 10 ideas worth stealing (ranked)

1. **Semantic-before-concrete two-stage generation.** Design the assessment with abstract IDs (`semantic_part_id`) in Phase 2 and only bind concrete engine indices (`$answer[N]`) in Phase 3 — this cleanly separates "what to ask" from "how to encode it," exactly the split a worksheet generator needs between content and LaTeX.
2. **Defense-in-depth: the same rule enforced in prompt + linter + final gate.** Critical failure modes (e.g. forbidden answer types) are checked redundantly in three independent places, so a miss in one layer is caught by another — invaluable when an LLM is a fallible stage.
3. **Verification is not approval; terminal status is `READY_FOR_HUMAN_REVIEW`, never auto-`PRODUCTION_READY`.** Institutionalizing "static-verified ≠ deployable" prevents a green pipeline from being mistaken for a correct artifact.
4. **Evidence-gated completion (schema + SHA-256 + line-level proof), not "absence of errors."** A stage passes only by *producing* the evidence artifact; a validator that finds nothing is not the same as a validator that proved the property — directly applicable to "every number verified."
5. **Read-only validators that may report but never mutate**, with the single mutation (postprocessor) quarantined to one controlled run guarded by a forbidden-change scan — clean separation of checking from changing.
6. **Per-run artifact isolation with version+run_id+hash matching.** Stale or out-of-root artifacts hard-block, eliminating a whole class of "picked up yesterday's file" bugs in a multi-artifact pipeline.
7. **Adversarial audit that must log every concern and every *non*-finding with evidence** (`concern_ledger.json`, `non_findings_checked.json`) — forces the judge to prove it looked, not just to report what it happened to find.
8. **Golden-rule corpus with fixture-driven good/bad cases + negative controls that must keep failing.** A regression harness where each rule ships with its counterexample is how you keep a grading/verification layer honest as it grows (86+54 rules here).
9. **Explicit source hierarchy for ground truth** ("target render behavior > official engine source > local table > model inference") — a written precedence order for resolving conflicts stops the LLM from "inferring" facts it should verify; map this to "math engine > LLM" in a numeric pipeline.
10. **Sufficiency checks on the *reasoning*, not just the answer** (`derivation_presence.py`: reject "the solution is X" without operator-bearing work) — a worksheet generator wants the same gate: the shown steps must actually derive the verified number.

---

## 9. Gotchas and tech debt observed

- **Silent schema-validation skip.** If `jsonschema` is missing, Phase 2/package validation reports `SKIPPED_NO_JSONSCHEMA` and a malformed contract can pass undetected (documented in `ENVIRONMENT.md`, and the final gate treats missing jsonschema as fail — but the intermediate skip is a real footgun).
- **Fragile path coupling.** Every tool resolves the package root via `Path(__file__).resolve().parents[N]` and `sys.path.insert`; moving a single tool or running from a partial copy silently breaks baseline/registry/schema/import resolution. The whole tree must stay intact.
- **Hard-coded rule counts.** GOLDEN counts (format=86, flow=54) are asserted as constants; editing the rule files without updating the counts fails integrity checks (intentional, but brittle and easy to trip).
- **Rule/policy sprawl.** ~62 schemas, ~27 tools, dozens of `references/*_v3.26.9.md` policies, many with near-duplicate "patch-finalization / finalization hardening" sections repeated across Phase 3 prompt, operator manual, and 2A/2C — the same essay/`mult(`/showanswer rules are restated many times, which is robust but a maintenance burden and drift risk.
- **Scar-tissue checks tied to specific past failures** (`lay6e_s10_5_e42`, `lay6e_s6_2_e22`, retired codes like `R13_NUMBER_SPACE_VARIABLE`) — effective but implies each was a painful production miss; the retired-checks registry must be kept in sync or negative controls break.
- **No automated LLM layer.** Retry/timeout/cost/caching for the model are entirely manual (human re-sends phase messages). Reproducibility of the *generation* step depends on out-of-band chat state, not on anything in the repo.
- **`.understand-anything/` cache in the tree** (incl. a `.trash-*` dir) is analysis-tool residue, not pipeline code — noise that could confuse an integrity/manifest check if not excluded.

---

## 10. Open questions (not determinable statically)

- **Actual model behavior / settings.** Temperature, token limits, streaming, cost, and whether GPT‑5.5 Pro (or a substitute) actually obeys the "one artifact per name, valid JSON" contract cannot be known from static files.
- **How JSON artifacts physically flow between chat and disk.** The tools assume artifacts exist on disk in a run root, but nothing in-repo shows the mechanism that writes the LLM's emitted JSON to files or invokes the validators during a live run — presumably a human or an unshown harness.
- **Whether the 86/54 GOLDEN rules are individually correct.** I inventoried counts and categories, not each rule's soundness.
- **Real render fidelity.** Everything terminates at *static* verification; whether `final_imathas_files` actually render/grade correctly in a live IMathAS/MyOpenMath portal is explicitly deferred to the human gate and unobservable here.
- **Runtime of the validators on a real package.** Read-only inspection only; I did not execute any tool, so pass/fail behavior and performance on an actual run are unverified.
- **Provenance of `PACKAGE_VALIDATION_REPORT.json`.** It's present and presumably a prior run's output, but whether it matches the current tree's hashes was not recomputed.
```
