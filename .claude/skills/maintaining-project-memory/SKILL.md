---
name: maintaining-project-memory
description: Use at the end of any task, significant decision, or reversal in this repo, before ending the turn, and whenever CLAUDE.md might have drifted from the repo's actual state
---

# Maintaining Project Memory

## Overview

CLAUDE.md is the project's continuity across sessions and models. It is trustworthy only if updated in the same response as the work, with reasons attached and reversals recorded rather than overwritten.

## Decomposition

1. Update in the SAME response as the work. Deferred updates do not happen.
2. Route content to its section: decisions WITH their reasons to the decisions log (sec 9); artifacts, results, and test outcomes with caveats to the library (sec 6); open work to the backlog (sec 13); current state to ACTIVE TASK (sec 14); new or moved files to the file map (sec 15); prompt versions to the lineage (sec 5).
3. Reversals: never silently overwrite. State the old decision, the new one, and why it changed. Amendments to signed-off specs get logged the same way.
4. Prune while adding: superseded text goes when its replacement lands (stale "PLANNED" lines, finished ACTIVE TASKs). A memory file that only grows stops being read.
5. Log caveats honestly, including your own violations and what tests did NOT prove. This project's culture is flagging our own gaps first.
6. Commit with a short one-line message (Hitaansh's preference); leave the tree clean, but never sweep up the user's in-flight files into your commit.

## Judgment Rubric

PASS: a fresh session could resume correctly from CLAUDE.md alone; every claim in it is true of the repo right now; decisions carry reasons; ACTIVE TASK matches reality; caveats state what is unmeasured.
FAIL: memory says X while the repo says Y; a decision with no reason; a reversal that erased its predecessor; an update promised for later.

## Pushback Rules

Surface the conflict when asked to record something that contradicts a logged decision (quote both, ask which governs). Refuse to skip the update "just this once": continuity is the point. If asked to store what the repo already records (code structure, git history), ask what was non-obvious and store that instead.

## Self-Check

- Did every section touched by this task get its update (5, 6, 9, 12, 13, 14, 15 as applicable)?
- Is anything in the file now stale because of what I just did?
- Does the decisions log say WHY, not just WHAT?
- Is the tree clean, with the user's own in-flight work untouched?
