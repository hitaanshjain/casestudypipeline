# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: struggling community college students (Calculus 1 first; Linear Algebra and Intro Finance planned). A student pastes a textbook problem they are working on into the webapp and studies the generated artifacts directly: the case study worksheet, the concept flashcards, and the step-by-step practice deck. MathGPT.ai runs 3-5 student group rooms, so the worksheet's group-discussion element is used with peers as well as solo.

Near-term evaluator audience: Peter (Hitaansh's contact at MathGPT.ai) and the MathGPT.ai team, who judge the pipeline through this webapp before any platform integration.

## Product Purpose

An AI pipeline that turns one textbook problem into three verified study artifacts: a one-page business-school-style case study PDF (one real decision, interlocking questions, a planted misconception trap, verified answer key), a set of concept flashcards, and a multi-step practice slideshow. The webapp fronts the whole pipeline: problem plus optional scenario theme in, three artifacts out, with MySQL caching flashcards by textbook section.

Success, confirmed July 30, 2026: win the pitch. Convince Peter the pipeline works end to end; the durable product is the content engine, and MathGPT.ai's platform is expected to absorb the outputs later. The webapp demonstrates the student experience rather than aiming to become the standalone production tool.

## Positioning

Content that is verified by construction, not reviewed after the fact: a critic independently re-solves the source problem before anything generates, mismatches fail the run honestly with no artifacts, and every shipped number is re-derivable. Combined with misconception-trap pedagogy (the wrong answer is computed and shown beside the right one) and method concealment (student-facing text never names the technique, matching MathGPT.ai's Socratic, cheat-proof tutor). Neighboring generators produce plausible content; this one refuses to produce unverified content.

## Operating Context

A student pastes a textbook problem, optionally picks a scenario theme (soccer, architecture, music, ...), and watches the run progress through named stages. Results are consumed in-browser (embedded PDF, flip-card grid, manual Previous/Next/Final Slide slideshow) and as a printable grayscale worksheet PDF for classroom use. Stage 1 maps the problem against a local OpenStax corpus; generation is grounded in the cited textbook sections. Mock mode (`MOCK_LLM=1`) runs the entire pipeline from fixtures with no API key, which is how the demo runs today.

## Capabilities and Constraints

- Corpus: OpenStax Calculus Volume 1, chapters 1-6, 45 sections, local files in references/. Adding books is planned (linear algebra next).
- Case PDFs compile via a local tectonic engine; hard one-page student sheet.
- In-browser math is MathJax v4 from a CDN; results pages need network.
- Flashcard cache scope is the textbook SECTION, not the problem; two problems mapping to the same section share cards. Cache provenance is never shown to students.
- No auth on any route; local demo only. Deployment explicitly out of scope (July 30, 2026); when it revives, the recorded analysis picks Render over Vercel.
- NO live model run has ever happened; all three generation prompts are unmeasured against a real model until Peter supplies an API key.
- Undecided: which web math renderer MathGPT.ai's platform uses (integration question); OpenStax commercial/AI license terms need confirmation before shipping.

## Brand Commitments

- Client: MathGPT.ai (instructor-led learning platform; Socratic, cheat-proof AI tutor). This pipeline is a content engine feeding it.
- The webapp's visual world is the Worksheet direction, chosen by Hitaansh on July 30, 2026 from three served drafts (direction-approved.md; the built system is recorded in DESIGN.md): the deck-brand navy-ink-on-ivory print world. Keep UI and formatting consistent across pages. (Supersedes the earlier dark UI ported from the animation renderer page.)
- Flashcards keep the deck brand two-tone: navy #011E4F fronts, ivory #FAF8F4 backs, with periwinkle #82A4F5 and blue #176CF8 accents (from the team's source decks).
- Student surfaces: no scrollables (wrap or shrink instead), no cache/provenance labels, no childish wording, and technique names never appear in student-facing text (the topic-in-title prefix is the single sanctioned exception).
- Printed worksheets are grayscale print-safe with visible OER attribution when metadata exists.

## Evidence on Hand

- cases/ holds the case library including Peter's taco-truck benchmark (the difficulty calibration signal) and hand-verified demo cases.
- webapp/fixtures/ holds a complete verified fixture set: the Frost Night case study (compiles exit 0), two hand-verified concept cards, and the chain-rule practice deck.
- references/openstax_calculus_v1/ is the corpus; flashcards_db/ is the shareable MySQL package (schema + hierarchy seed, starts empty of cards).
- Absent, must not be fabricated: live-model output quality, student testimonials, usage numbers, timing validation of the 15-20 minute claim, and any claim that MathGPT.ai has adopted the pipeline.

## Product Principles

1. Verification before presentation: a wrong or unverifiable number is a failed run, never a shipped artifact.
2. Scaffold, don't dilute: struggling students get optional structure at full concept strength, not easier math.
3. Hide the method, not the answer: recognizing which tool applies is part of the task.
4. One decision, interlocking parts: cases are a cohesive decision arc, never a multi-part word problem with unrelated parts.
5. Data structure stays separate from UI: artifacts are JSON/LaTeX contracts any presentation layer can consume, because the intended final home is MathGPT.ai's platform, not this webapp.

## Accessibility & Inclusion

Audience is struggling students: plain-language scaffolding and honest verdicts are product requirements, not tone choices. Worksheets must stay legible in grayscale print. Known deferred webapp ARIA gaps are recorded in plan/webapp_deferred_minors.md; no formal standard has been mandated.
