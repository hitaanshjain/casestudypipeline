# Flashcard Database Design Spec

Date: July 20, 2026. Approved by Hitaansh in-session after brainstorming.
Source of requirements: Peter's meeting notes (relayed by Hitaansh, who was not in the meeting) plus Hitaansh's clarifications in-session.

## 1. Goal

A MySQL database that stores flashcards tagged by subject, textbook, chapter, and learning objective, per Peter's directive. It is the data foundation the UI team plugs into later. Key principle from the meeting notes: data structure stays separate from UI; the schema must support any presentation layer.

Scope now: CONCEPT/EXAMPLE cards only. Problem/solution cards (with animated backs, GIF vs browser-rendered JSON still an open team decision) are supported by the schema but not populated.

IMPORTANT context: the team's flashcard vision CHANGED while Hitaansh was on vacation. The repo's existing flashcard work (prompts/phase2_flashcards_prompt_v1.md, the 5-card LaTeX sheet format, the 2/2/1 definition/procedure/interpretation mix) is IGNORED by this design. The new model: a textbook section has N concepts; each concept ideally gets one concept/example card (concept on front, worked example on back) and, later, one problem/solution card (problem on front, animated solution on back).

## 2. Deliverable: a repo-independent package

The team shares files via Google Drive, not this repo. The deliverable is one self-contained folder that works when zipped and dropped anywhere:

```
flashcards_db/
  README.md               setup for a teammate who has never seen this repo
  docker-compose.yml      official mysql:8.4 container, DB "flashcards"
  demo_queries.sql        showcase queries (coverage gaps, flashcard_full, cards by chapter)
  init/
    01_schema.sql         six tables + one view, auto-applied on first boot
    02_seed.sql           GENERATED data dump: full corpus hierarchy + 3 sample cards
```

A teammate needs only Docker Desktop: `docker compose up -d` boots MySQL and auto-applies both init files (the MySQL image runs /docker-entrypoint-initdb.d/*.sql on first boot with an empty data volume; reset = `docker compose down -v`). No Python, no this-repo, no VS Code.

Integration path (unknown today): a .sql dump is the universal MySQL transfer format. When Peter's production MySQL becomes reachable, apply 01_schema.sql then 02_seed.sql to it directly; Docker is only the local runtime.

The generator that produces 02_seed.sql is a build tool that STAYS in this repo (tools/generate_flashcards_seed.py): it reads references/openstax_calculus_v1/book_map.json and emits the INSERT statements. Rerun it when the corpus grows (linear algebra books). The shipped folder never depends on it.

## 3. Schema (approach B, approved)

MySQL 8.4, InnoDB, utf8mb4 for text, LONGBLOB for card content. A chain of foreign keys with ON DELETE RESTRICT:

- subject(id, name UNIQUE)
- textbook(id, subject_id FK, title, book_key UNIQUE, authors, license, attribution, source_url; UNIQUE(subject_id, title))
- chapter(id, textbook_id FK, chapter_number TINYINT, section_number VARCHAR, name; UNIQUE(textbook_id, section_number))
- learning_objective(id, chapter_id FK, lo_text, ordinal; UNIQUE(chapter_id, lo_text))
- concept(id, lo_id FK, name, ordinal; UNIQUE(lo_id, name))
- flashcard(id, concept_id FK, card_type ENUM('concept_example','problem_solution'), front_content LONGBLOB, front_format VARCHAR(20), back_content LONGBLOB, back_format VARCHAR(20), created_at, updated_at; UNIQUE(concept_id, card_type))
- flashcard_full: VIEW joining all six tables into the flat human-readable row (formats included, blobs excluded)

Design decisions inside the schema, all approved in-session:

1. concept is a first-class table (approach B over the notes-literal five tables). Reason: the requirement "one concept card and one problem card PER CONCEPT" makes the concept a real entity two cards must share; a text column would pair them by string matching, which drifts. UNIQUE(concept_id, card_type) makes the DB itself enforce at most one card of each type per concept. The notes' one-to-many "multiple flashcards per LO" holds transitively through concept.
2. chapter rows are OpenStax SECTIONS ("1.1 Review of Functions"), with chapter_number (1-6) as a rollup column. Reason: learning objectives live at section level in both the book and our corpus; whole-chapter rows would destroy that granularity. Peter's "chapter name" tag still works.
3. front/back format columns ('latex' now; 'gif', 'json', or anything later) keep the open animation decision out of the schema: whichever way the team decides becomes a stored value, never a migration.
4. License metadata (license, attribution, source_url) lives on the textbook row. Reason: OpenStax CC BY-NC-SA obligates attribution wherever content surfaces; any UI can join one table for the credit line it must display.

## 4. Seed data

From book_map.json: 1 subject (Calculus), 1 textbook (OpenStax Calculus Volume 1 with its real license metadata), 45 chapter rows (sections, chapters 1-6), all learning objectives (count computed from the JSON at generation time, asserted in verification).

Sample cards: 3 concept/example cards under section 1.1 learning objectives, front = LaTeX statement of the concept, back = LaTeX worked example, both format 'latex', stored as UTF-8 bytes. Card math is hand-verified before insertion (verifying-case-math discipline). Planned cards: evaluating a function at a value (f(x)=3x^2+2x-1, f(2)=15), domain of a function (f(x)=sqrt(x-3), domain x>=3), range of a function (f(x)=x^2, range y>=0).

## 5. Verification

- Count checks: chapter count = 45 and learning_objective count = the number computed directly from book_map.json; run as SQL after boot, mismatch = failure.
- Negative control 1: second concept_example insert for an existing concept must be REJECTED (UNIQUE violation, error 1062).
- Negative control 2: flashcard insert with a nonexistent concept_id must be REJECTED (FK violation, error 1452).
- flashcard_full returns exactly 3 rows; the coverage-gap query (LOs with zero cards) returns total LOs minus the seeded ones' LOs.
- Seed idempotency: 02_seed.sql is a full deterministic dump applied only on first boot, so re-boot without -v does not duplicate; regeneration from an unchanged book_map.json is byte-identical.
- These controls join the future fixture suite (CLAUDE.md backlog 6/12 culture).

## 6. Out of scope

No API layer, no UI, no problem/solution card content, no changes to the phase 2 flashcards prompt (the team vision change makes its future a separate decision), no connection to production MySQL, no auth hardening (local dev passwords in docker-compose.yml, README says to change them for anything shared).

## 7. Known caveats

- Column naming is our guess at Peter's production conventions; expect a rename pass at integration time. Structure is the part meant to survive.
- The "concepts per section" inventory does not exist anywhere yet: the corpus has sections and LOs but nobody has enumerated concepts. The 3 sample concepts are hand-chosen illustrations; producing the real concept inventory (and cards at scale) is future work, likely a new generation prompt.
- BLOB columns mean card content is not SQL-searchable by text; fine for the stated use (tags are the query surface), noted for the record.
