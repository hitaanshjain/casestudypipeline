---
name: triaging-reviews-with-evidence
description: Use when receiving review findings on prompts, docs, or code, when adjudicating contradictory claims between two agents or runs, or before applying any reviewer-suggested fix
---

# Triaging Reviews With Evidence

## Overview

Reviews are claims, not verdicts. Every finding gets verified against ground truth before it changes anything; every rejection gets a logged reason. This project retracted a confident "fabrication" finding because the reviewer had not rendered the next page of the source: verify before you act, in both directions.

## Decomposition

1. Classify each finding: correctness (wrong behavior or content), enforceability (an unmeasurable rule that could become countable), or style.
2. Verify the claim against ground truth BEFORE acting: open the file at the cited line, render the source page, run the command. If the reviewer quotes text that is not in the artifact, suspect version skew and say so.
3. Accept, by default, edits that convert unmeasurable prompt rules into countable or mechanical ones (this project's review-triage principle, decisions log July 2).
4. Defend deliberate redundancy: checklist repetition is defense in depth, not bloat. Reject trims of it WITH the reason logged.
5. Route checks a model would self-grade (strip tests, arithmetic) to pipeline enforcement, not to more prompt prose.
6. On agent-vs-agent contradiction: demand page-and-line evidence from both sides, re-derive the disputed fact yourself, and have the wrong party retract explicitly. Being loudly wrong then corrected beats being quietly unresolved.
7. Record the triage: accepted (with what changed), rejected (with why), and non-findings. Silence is not a disposition.

## Judgment Rubric

PASS: every accepted finding carries evidence you checked; every rejection has a one-line reason in the log; disputed facts were re-derived, not voted on; severity labels were re-judged, not inherited.
FAIL: wholesale acceptance of a review; a finding dismissed because "the plan mandated it" (that is the human's call, surface it); a fix applied on assertion alone; a dropped finding nobody triaged.

## Pushback Rules

Push back on the reviewer when: their quoted text does not exist in the artifact (version skew, name it); a strong claim (fabrication, missing content) rests on incomplete evidence (check the adjacent page or file before believing it); a proposed fix contradicts a signed-off spec (present both texts to the human, do not pick silently). Push back on yourself when you feel like accepting everything to end the loop: that is fatigue, not judgment.

## Self-Check

- Can I point to the evidence for each finding I acted on?
- Did any rejection go unlogged?
- Did I re-verify the fix afterward (re-review, not trust)?
- If two sources still disagree about a fact, is that disagreement resolved with evidence or just paused?
- Did deliberate redundancy survive, and is the reason on record?
