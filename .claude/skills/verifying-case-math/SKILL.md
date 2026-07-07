---
name: verifying-case-math
description: Use when authoring, reviewing, or shipping any artifact that contains computed quantities: case studies, answer keys, verified_answer files, corpus worked examples, or test expectations
---

# Verifying Case Math

## Overview

No number ships unverified. The author's arithmetic (human or model) is never the source of truth; re-derivation is. This project's culture: flag your own violations before anyone else finds them.

## Decomposition

1. Inventory every reported quantity in the artifact (boxed answers, intermediate values, trap numbers, thresholds, margins).
2. Re-derive each one by hand from the source data, writing operator-bearing steps, not just results.
3. Cross-check each headline number by an INDEPENDENT second path: substitute back into original constraints, split the integral at an interior point, check the vertex/endpoint alternative, or verify units and domain (is the rate nonnegative on the window? does the time lie inside the interval?).
4. For decision artifacts, run the verdict-first check: identify the chosen verdict, the honest number, the trap number, and the threshold. Confirm the honest and trap numbers land on OPPOSITE sides of the threshold (or state explicitly that the case intends a near-flip).
5. Check clean-number conventions for the subject (integers or small fractions where the subject's playbook demands them; engineered backward from the answers).
6. Record the verification visibly: a % VERIFICATION block, a review note, or the message to the user, with the actual arithmetic shown.

## Judgment Rubric

PASS requires all of: every quantity re-derived; at least one independent cross-check per headline number; trap straddles the threshold; domain and units sane; any rounding stated with the exact value alongside.
FAIL if any of: a number trusted because "the model showed its work"; a trap gap that does not change the decision; silent rounding; a quantity you could not reproduce but shipped anyway.

## Pushback Rules

Stop and challenge the request when: you are asked to present numbers you failed to re-derive (say so plainly instead); the scenario cannot produce clean numbers without changing the story (renegotiate the data, never fudge the math); the planted trap would require a mathematically false claim; the source data contradicts itself.

## Self-Check

- Did I write out the derivation, or only nod at it?
- Does each headline number have a second, independent confirmation?
- Would the wrong (trap) route actually flip the verdict?
- Did I state every deviation (rounding, book errors reproduced faithfully)?
- If a reviewer re-derives everything tomorrow, is there anything they could catch that I did not?

| Excuse | Reality |
|---|---|
| "The generator showed full work" | Shown work is a claim, not a check. Re-derive. |
| "A reviewer already verified it" | Checks compose. Cite both, or it did not happen. |
| "Deadline" | A wrong shipped number costs more than the 10 minutes this takes. |
