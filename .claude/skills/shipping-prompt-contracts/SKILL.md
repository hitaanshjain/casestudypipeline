---
name: shipping-prompt-contracts
description: Use when writing or revising an LLM prompt whose output other prompts, validators, or pipeline stages consume, or when a prompt must run cold in a fresh session
---

# Shipping Prompt Contracts

## Overview

A prompt that feeds a pipeline is an interface, not prose. Its load-bearing strings are contracts; its rules must be countable; its failure paths must be tested by making them fire.

## Decomposition

1. Spec first: write a design spec (interfaces, inputs, ground-truth hierarchy, failure behavior, test plan) and get sign-off BEFORE drafting. This project's exemplars: plan/phase1_prompt_design.md, plan/phase2_prompt_design.md.
2. Draft with countable rules: budgets (word counts, item counts), closed vocabularies, exact formats. Convert every "should" on a load-bearing rule into something a validator or grep can check. Unmeasurable rules get enforcement in the pipeline, not more prose.
3. Write contract strings ONCE, byte-exact, and reuse them verbatim everywhere they appear (prompt, spec, validator, tests): error lines, sentinel values, JSON templates, anchor formats, band boundaries.
4. Define defensive behavior explicitly: exact one-line error formats for every failure trigger, and honest-gap paths that are NOT errors (no-coverage ships with honest flags, never inflated scores).
5. Static checks before any run: required-string scan and non-ASCII scan over the prompt file; both must pass clean.
6. Test round, fresh sessions: one happy path; one negative control PER GATE (a gate that never fires is decoration); one end-to-end into the real consumer. Mechanical validation (exit 0/2) beats eyeballing.
7. Log what the tests do not prove: semi-fresh agents, single runs, one model family. Claim exactly what was measured.

## Judgment Rubric

PASS: every mechanical check the consumer runs traces to an explicit prompt rule; every gate has a fired negative control; contract strings byte-identical across prompt, spec, and validator; failure paths leave a defined artifact and nothing else.
FAIL: self-graded checks with no external gate; "prefer/should" on anything load-bearing; a failure path that has never executed; spec and prompt that disagree.

## Pushback Rules

Challenge the request when: asked to add an unmeasurable rule (offer the countable version or pipeline enforcement instead); the spec and the prompt have drifted (stop, reconcile both, log the amendment); a test would be contaminated by shared context (run it anyway if that is all you have, but label it semi-fresh, never clean-room); asked to skip the negative control to save time.

## Self-Check

- Could a capable agent with zero project context execute this prompt without asking questions?
- Did I make each gate fire at least once on purpose?
- Are the sentinels, error lines, and templates byte-identical everywhere?
- Did I log deviations from the signed-off spec in the project memory?
- Does my claim of "tested" state exactly which paths ran, on what model, how many times?
