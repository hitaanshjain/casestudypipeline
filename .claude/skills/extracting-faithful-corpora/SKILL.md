---
name: extracting-faithful-corpora
description: Use when building or extending a references/ corpus from a textbook PDF or crawl (book_map.json plus per-section content files), including adding the linear algebra books
---

# Extracting Faithful Corpora

## Overview

A corpus is only useful if every line traces to the source. The two failure modes are memory substitution (writing the well-known version instead of the printed one) and silent deviation. Both are defeated by rendering pages and disclosing in-file.

## Decomposition

1. Index first: build book_map.json from the source's OWN front matter and TOC, never memory. Transcribe title, authors, and license verbatim (leave license_url empty if the source prints no URL). Record per-section number, title, book page, target filename; verify the PDF-page offset at three or more spread-out points.
2. Extract by RENDERING: pdftotext DROPS inline math in this project's PDFs. Use PyMuPDF to rasterize pages to PNG and read them visually. Render EVERY page of a section before declaring content absent, extra, or invented (a fabrication claim here was retracted because the reviewer skipped the next page).
3. Write the house format: verbatim Learning Objectives; 5-10 lowercase single-concept topic keywords (no comma-packed or and-joined strings); every key definition, theorem, and rule in full; 2-3 worked examples with complete solutions, more only when the LO spread genuinely requires it; ASCII and standard LaTeX only; no figures, checkpoints, exercises, or chapter-review material.
4. Disclose every deviation IN THE FILE, one line, at the point of deviation: rounding differences (give both values), skipped book examples, content restated from a cross-referenced section, line-count or example-count overruns. Report-only disclosure is not enough; the file is what ships.
5. Validate mechanically: files exist for every index entry, LOs filled, non-ASCII scan clean, JSON valid, only the intended entries touched.
6. Spot-check fidelity per batch: re-render source pages for at least two sections (prefer ones nobody emphasized) and confirm LOs verbatim, one rule statement, and one worked example's numbers.
7. Count exactly: line counts and example counts in reports must match the files. Off-by-ones in self-reports are real defects in this workflow's history.

## Judgment Rubric

PASS: spot-checked LOs are character-identical to the rendered page; example numbers match the book; all deviations disclosed in-file; zero non-ASCII; report counts reproduce.
FAIL: content that is plausibly-from-memory (a standard example not on the cited page); silent omission or silent correction of the book; a report claim not true of the committed files.

## Pushback Rules

Stop and challenge when: the source's license does not permit the intended use (surface it, do not proceed on vibes); only text-layer extraction is available for math-bearing sections (refuse to transcribe garbage; get rendering working first); asked to fix the book's own errors (reproduce faithfully and disclose instead); asked to skip the fidelity spot-check to save time.

## Self-Check

- Did every fact come from a page I actually rendered and read?
- Is each deviation disclosed where a reader of the FILE will see it?
- Do my reported counts match a fresh recount?
- Would a hostile reviewer with the PDF find any line I cannot point to on a page?
