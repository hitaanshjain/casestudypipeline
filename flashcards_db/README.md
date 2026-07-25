# Flashcard Database (MySQL)

Self-contained local flashcard database. Needs ONLY Docker Desktop; no repo, no Python.

## Run it

1. Install Docker Desktop and start it.
2. Open a terminal in this folder.
3. `docker compose up -d`

First boot creates database `flashcards`, applies `init/01_schema.sql` (six tables plus
the `flashcard_full` view), then `init/02_seed.sql` (OpenStax Calculus Volume 1 hierarchy:
45 sections, 195 learning objectives), then `init/03_concept_cards.sql` (75 concept
cards). Takes about a minute the first time.

## Connect

Any MySQL client works. Host `localhost`, port `3306`, database `flashcards`.

- User: `flashcards_user` / password `change_me_user` (or root: `change_me_root`).
- CLI without installing anything: `docker exec -it flashcards-db mysql -uflashcards_user -pchange_me_user flashcards`
- GUI: MySQL Workbench with the same credentials.

Try: `SELECT * FROM flashcard_full;` or the queries in `demo_queries.sql`.

## Schema in one line

subject > textbook > chapter (one row per textbook SECTION, e.g. "1.1") >
learning_objective > concept > flashcard. A flashcard has a `card_type`
(`concept_example` or `problem_solution`), and front/back content as blobs with
`front_format`/`back_format` tags (`json` today; `gif` or `json` later without any
schema change). At most one card of each type per concept (enforced by the DB).
Currently only concept_example cards are populated.

## Reset / remove

- Reset to a fresh seeded state: `docker compose down -v` then `docker compose up -d`
  (`-v` deletes the data volume; init scripts only run on an empty volume).
- Stop without losing data: `docker compose down`

## Notes

- Passwords here are local-dev defaults. CHANGE THEM before hosting this anywhere shared.
- Content licensing: OpenStax Calculus Volume 1, CC BY-NC-SA 4.0. The required credit
  ("Access for free at openstax.org.") is stored on the textbook row; any UI that shows
  card content must display it.
- To apply to another MySQL server (e.g. production later): run `init/01_schema.sql`,
  then `init/02_seed.sql`, then `init/03_concept_cards.sql` against it in that order.
