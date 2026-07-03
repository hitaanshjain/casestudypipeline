# Claude Code Prompt: Targeted Extraction (Run 2 of 2)

Paste into Claude Code from the same repository root as the earlier reconnaissance. Same ground rules as before: read-only, no execution, no network, redact any secret as [REDACTED].

---

You previously produced PIPELINE_RECON.md for this repository. We are now building our own, smaller pipeline (LLM authors a JSON case spec, SymPy verifies every answer with evidence, a renderer produces LaTeX that a lint must prove numerically identical to the spec, an LLM judge fills a checklist ledger, fixtures with negative controls act as CI). We want to copy five specific implementation patterns from this repo as reference code, not descriptions.

Create one file, `REFERENCE_EXTRACTS.md`, containing the following, each as a fenced code block with its source file path and a 3-to-5 line note on how to adapt it to our pipeline:

1. **Validator skeleton.** From `tools/validate_package.py`: the overall structure only, argument handling, read-only contract, exit-code convention (0 pass, 2 fail), how it assembles and self-validates its JSON report, and how it discovers and runs fixture suites. Trim rule-specific bodies; keep the skeleton and one representative check end to end.
2. **Fixture suite pattern.** One complete small suite from `fixtures/` (a good case, one bad case, and the `expected_results.json`), plus the code in whichever tool loads `expected_results.json` and diffs actual versus expected. Pick the smallest suite that shows the full pattern.
3. **Forbidden-change scan.** From `render_format_engine/v3269_format_postprocessor.py`: the section that takes before and after artifacts, extracts the protected fields (answer keys, types, formulas, counts), compares them, and fails on any difference. Include the list of protected fields and the refusal-unless-safety-verified guard.
4. **Line-level evidence pattern.** From `answerbox_setup_audit.py`: the report row structure that ties each claim to concrete line evidence (the required fields, the booleans that must be exactly True, the rejection of vague summary flags). We will mirror this for per-answer SymPy evidence rows.
5. **Gate evaluator pattern.** From `package_gate_evaluator.py`: how it rejects phase statuses and generic ready statuses at the terminal gate, the completeness matrix check, and how it independently re-derives one class of issues instead of trusting an earlier report.

Also include, at the end, a short section **"Schema examples"** with two complete schemas from `schemas/`: the smallest gate schema and one mid-sized artifact schema, so we can copy the conventions (naming, required fields, status enums).

Keep the whole file under about 700 lines by trimming aggressively inside the blocks (mark trims with `# ... trimmed ...`). Accuracy of what remains matters more than completeness. When finished, print the list of extracted sources and their line counts to the console.
