# Claude Code Prompt: Pipeline Reconnaissance (Run 1 of 2)

Paste everything below into Claude Code, launched from the root of the example pipeline repository (or tell it the path in your first message).

---

You are doing read-only reconnaissance of this repository. It is an example of a production pipeline that my team was given to learn from. We are designing our own pipeline (an LLM-based generator that produces math case-study worksheets, verifies every number with a math engine, compiles LaTeX to PDF, and gates quality before delivery). Your job is to map how THIS pipeline works and write a single report that an architect can use to steal its best ideas.

## Ground rules
- READ ONLY. Do not run the pipeline, do not install dependencies, do not execute arbitrary project code, do not make network calls or hit any APIs. Static inspection only (reading files, listing directories, grep). Do not modify or delete anything except creating the one report file.
- REDACT every secret. Any API key, token, password, connection string, or .env value appears in the report only as [REDACTED]. Report the NAMES of env vars, never values.
- If the repo is huge, prioritize: entry points, orchestration, LLM calls, prompts, validation, config. Skip vendored dependencies, lockfiles, and generated artifacts.
- If something cannot be determined from the code, say so in the Open Questions section instead of guessing.

## What to investigate

**A. Inventory.** Directory tree (2 to 3 levels, skip node_modules/venv/build artifacts), languages and frameworks, package manifests, README and docs, how the pipeline is invoked (CLI, API server, cron, queue worker).

**B. Architecture.** The stages of the pipeline in order, as a simple diagram (text arrows are fine). What triggers a run, what the input looks like, what the final output is, and every intermediate artifact. How stages are orchestrated: a framework (Airflow, Prefect, Temporal, Celery), a queue, plain scripts, or something homemade. Where state lives between stages (DB, files, object storage) and what the schemas or file formats are. How configuration works (files, env vars, flags) and how environments (dev/prod) differ.

**C. LLM specifics.** Which providers and models are called, and where in the code. Where prompt templates live; paste the 2 or 3 most important prompt templates into the report (truncate anything over ~150 lines). How structured output is obtained and parsed (JSON mode, regex, retry-on-parse-failure). Retry, fallback, and timeout strategy. Any caching of LLM responses. Anything tracking tokens or cost. Temperature and other sampling settings.

**D. Quality and verification.** Any validation of LLM output: schema checks, content checks, mathematical or factual verification, eval harnesses, LLM-as-judge steps. What happens on failure: regenerate, human review queue, dead-letter. Tests (unit/integration) and what they cover. Logging and observability: what gets logged per run, any dashboards or metrics.

**E. Operations.** How it deploys (Docker, serverless, VM), CI/CD, scheduling, how secrets are managed (names of the mechanism only), anything about scaling or concurrency limits, rate-limit handling.

## Report format

Write exactly one file, `PIPELINE_RECON.md`, in the repo root, with these sections in this order:

1. **What this pipeline does** (5 sentences max, plain language)
2. **Stage map** (the text diagram plus one paragraph per stage)
3. **Inventory** (tree, stack, entry points)
4. **Orchestration and state** (B findings)
5. **LLM layer** (C findings, including the pasted prompt templates in fenced blocks with file paths)
6. **Quality and verification** (D findings)
7. **Operations** (E findings)
8. **Top 10 ideas worth stealing** (ranked, one sentence each on why it matters for a generate-verify-compile-gate pipeline)
9. **Gotchas and tech debt observed** (anything fragile, hacky, or that clearly caused pain)
10. **Open questions** (what could not be determined statically)

Keep the whole report under about 800 lines so it can be pasted into another chat. Prefer short excerpts with file paths over long dumps. When you finish, print the report's section 1 and section 8 to the console as a summary.
