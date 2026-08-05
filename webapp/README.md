# MathGPT Pipeline Web App

Next.js app that runs the full pipeline: paste a textbook problem, pick a scenario
theme, and get back a one-page case-study PDF, concept flashcards, and a
step-by-step practice deck. Flashcards are cached in MySQL by textbook section:
a topic that already has cards serves them instead of regenerating.

## Setup

```bash
cd webapp
npm install
```

Create `webapp/.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...        # required for live runs; omit in mock mode
ANTHROPIC_MODEL=claude-sonnet-5     # optional, this is the default
MOCK_LLM=1                          # optional: run the whole pipeline off fixtures, no key needed
MYSQL_HOST=127.0.0.1                # defaults match flashcards_db/docker-compose.yml
MYSQL_PORT=3306
MYSQL_USER=flashcards_user
MYSQL_PASSWORD=change_me_user
MYSQL_DATABASE=flashcards
```

Start the flashcard cache (optional; without it the app generates fresh every run
and shows a "cache offline" note):

```bash
cd ../flashcards_db
docker compose up -d
```

The DB initializes with the OpenStax Calc 1 hierarchy (45 sections, 195 learning
objectives) and zero cards; the pipeline inserts cards as it generates them.

## Run

```bash
npm run dev     # http://localhost:3000
npm test        # vitest: contracts, corpus tools, LLM mock, DB integration, mock e2e
npm run build
```

Note: the DB integration tests write rows; if a second `npm test` fails with
ER_DUP_ENTRY, reset the volume (`docker compose down -v && docker compose up -d`
in flashcards_db/).

## Mock mode vs live

With `MOCK_LLM=1` every model call returns a recorded fixture from
`webapp/fixtures/mock/`, so the complete flow (Stage 1 -> critic -> case-study
LaTeX -> real tectonic compile -> flashcard JSON -> DB insert -> results page)
runs without an API key. The e2e test suite runs this way.

To go live: remove `MOCK_LLM`, set `ANTHROPIC_API_KEY`, restart the dev server.
Before the first live run, read the "live-key work" notes in CLAUDE.md
(sec 13 backlog): the non-mock critic pass/fail contract needs one reconciliation
pass, and no live run has ever been made.

## Textbook lookup

Instead of pasting a problem, a student can type a reference like `3.41` or
`Chapter 3, Problem 41` (OpenStax Calculus Vol 1, chapter 3 only for now).
`GET /api/problems/resolve?ref=<ref>` resolves it against the exercise bank at
`references/openstax_calculus_v1/exercises/` (391 exercises, 94% servable; the
rest need a printed graph or figure we don't show yet) and returns the exercise
text, citation, and attribution for a preview before the student submits.
`webapp/tests/exerciseBank.test.ts` validates the committed bank (contiguous
numbering, ASCII text, schema, and figure coverage) as part of the test suite.

## Pipeline flow

1. `POST /api/runs` with `{problem, preferredContext, source}` returns a run
   id (`source` is optional: `{book_key, chapter, section, number}`, set when
   the problem came from the textbook lookup rather than a paste);
   `/runs/<id>` polls `GET /api/runs/<id>`.
2. Stage 1: the phase-1 generator prompt, with read-only corpus tools over
   `references/`, writes the 5-file package to `runs/<id>/`.
3. Critic: the phase-1 critic re-solves the problem; a calibration mismatch fails
   the run honestly with no artifacts.
4. Topic resolution: lo_mapping's PRIMARY section maps to a `chapter` row; the
   cache is checked per section.
5. Fan-out, in parallel: case study (LaTeX -> `tools/tectonic.exe` -> PDF, one
   retry on compile failure), concept cards (cache hit or generate + validate +
   insert), practice deck (same).
6. `/runs/<id>/results` renders three tabs: embedded PDF, flip cards, and the
   Previous/Next/Final Slide practice slideshow.

Artifacts land in `runs/<id>/` (gitignored): the Stage 1 files, `case_study.tex`,
`case_study.pdf`, `concept_cards.json`, `practice_deck.json`, `compile.log`,
`state.json`.

## Prompts

The app loads prompts from the repo's `prompts/` directory at call time:
`phase1_generator_prompt_v1.md`, `phase1_critic_prompt_v1.md`,
`case_study_master_prompt.md`, `concept_flashcards_prompt.md`,
`practice_deck_prompt.md`. Editing those files changes the pipeline's behavior;
no rebuild needed.
