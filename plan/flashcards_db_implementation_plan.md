# Flashcard Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execution choice for this run: INLINE (user pre-approved "build the db completely" in-session).

**Goal:** A self-contained flashcards_db/ folder (Docker + MySQL 8.4 + schema + generated seed) that any teammate can run with only Docker Desktop, verified with count checks and two negative controls.

**Architecture:** Six normalized tables (subject > textbook > chapter > learning_objective > concept > flashcard) plus a flashcard_full view; seed data generated from references/openstax_calculus_v1/book_map.json by a repo-side Python tool emitting deterministic INSERT statements with hex blob literals; MySQL official image auto-applies init/*.sql on first boot.

**Tech Stack:** MySQL 8.4 (official Docker image), docker compose, Python 3.11+ stdlib only (json, pathlib), PowerShell for verification commands.

## Global Constraints

- Spec of record: plan/flashcards_db_design.md. Any deviation gets logged there and in CLAUDE.md.
- The shipped folder flashcards_db/ must never depend on this repo, Python, or VS Code (spec sec 2).
- Card content stored as LONGBLOB with a format tag column; sample cards are 'latex' both sides (spec sec 3-4).
- Scope: concept_example cards only are populated; problem_solution stays in the ENUM unpopulated (spec sec 1).
- 02_seed.sql regeneration from unchanged book_map.json must be byte-identical: no timestamps or randomness in the generator (spec sec 5).
- Sample card math must be hand-verified before insertion (verifying-case-math discipline).
- Commit after every task, one-line commit messages, no trailers (CLAUDE.md operating rule 2).
- No em dashes in any file content (CLAUDE.md sec 11).
- tools/ is gitignored: the generator needs `git add -f`.

---

### Task 1: Package skeleton (compose + schema + README)

**Files:**
- Create: `flashcards_db/docker-compose.yml`
- Create: `flashcards_db/init/01_schema.sql`
- Create: `flashcards_db/README.md`

**Interfaces:**
- Produces: database `flashcards` with tables subject, textbook, chapter, learning_objective, concept, flashcard and view flashcard_full; container name `flashcards-db`; root password `change_me_root`. Task 2's generator emits INSERTs against exactly these table/column names. Tasks 3-4 run queries via `docker exec flashcards-db`.

- [ ] **Step 1: Write `flashcards_db/docker-compose.yml`**

```yaml
services:
  flashcards-db:
    image: mysql:8.4
    container_name: flashcards-db
    environment:
      MYSQL_ROOT_PASSWORD: change_me_root
      MYSQL_DATABASE: flashcards
      MYSQL_USER: flashcards_user
      MYSQL_PASSWORD: change_me_user
    ports:
      - "3306:3306"
    volumes:
      - flashcards_data:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-pchange_me_root"]
      interval: 5s
      timeout: 3s
      retries: 30
volumes:
  flashcards_data:
```

- [ ] **Step 2: Write `flashcards_db/init/01_schema.sql`**

```sql
-- Flashcard database schema. Spec: plan/flashcards_db_design.md (approach B).
-- Auto-applied by the official MySQL image on first boot (empty data volume).
USE flashcards;
SET NAMES utf8mb4;

CREATE TABLE subject (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_subject_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE textbook (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  book_key VARCHAR(100) NULL,
  authors VARCHAR(500) NULL,
  license VARCHAR(255) NULL,
  attribution VARCHAR(255) NULL,
  source_url VARCHAR(500) NULL,
  UNIQUE KEY uq_textbook_book_key (book_key),
  UNIQUE KEY uq_textbook_subject_title (subject_id, title),
  CONSTRAINT fk_textbook_subject FOREIGN KEY (subject_id)
    REFERENCES subject (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chapter (
  -- One row per textbook SECTION (e.g. 1.1); chapter_number is the rollup.
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  textbook_id BIGINT UNSIGNED NOT NULL,
  chapter_number TINYINT UNSIGNED NOT NULL,
  section_number VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_chapter_textbook_section (textbook_id, section_number),
  CONSTRAINT fk_chapter_textbook FOREIGN KEY (textbook_id)
    REFERENCES textbook (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE learning_objective (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  chapter_id BIGINT UNSIGNED NOT NULL,
  lo_text VARCHAR(500) NOT NULL,
  ordinal SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_lo_chapter_text (chapter_id, lo_text),
  CONSTRAINT fk_lo_chapter FOREIGN KEY (chapter_id)
    REFERENCES chapter (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE concept (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lo_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  ordinal SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_concept_lo_name (lo_id, name),
  CONSTRAINT fk_concept_lo FOREIGN KEY (lo_id)
    REFERENCES learning_objective (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE flashcard (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  concept_id BIGINT UNSIGNED NOT NULL,
  card_type ENUM('concept_example','problem_solution') NOT NULL,
  front_content LONGBLOB NOT NULL,
  front_format VARCHAR(20) NOT NULL DEFAULT 'latex',
  back_content LONGBLOB NOT NULL,
  back_format VARCHAR(20) NOT NULL DEFAULT 'latex',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_flashcard_concept_type (concept_id, card_type),
  CONSTRAINT fk_flashcard_concept FOREIGN KEY (concept_id)
    REFERENCES concept (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW flashcard_full AS
SELECT f.id AS flashcard_id,
       s.name AS subject,
       t.title AS textbook,
       c.chapter_number,
       c.section_number,
       c.name AS section_name,
       lo.lo_text AS learning_objective,
       co.name AS concept,
       f.card_type,
       f.front_format,
       f.back_format,
       f.created_at
FROM flashcard f
JOIN concept co ON f.concept_id = co.id
JOIN learning_objective lo ON co.lo_id = lo.id
JOIN chapter c ON lo.chapter_id = c.id
JOIN textbook t ON c.textbook_id = t.id
JOIN subject s ON t.subject_id = s.id;
```

- [ ] **Step 3: Write `flashcards_db/README.md`**

```markdown
# Flashcard Database (MySQL)

Self-contained local flashcard database. Needs ONLY Docker Desktop; no repo, no Python.

## Run it

1. Install Docker Desktop and start it.
2. Open a terminal in this folder.
3. `docker compose up -d`

First boot creates database `flashcards`, applies `init/01_schema.sql` (six tables + the
`flashcard_full` view), then `init/02_seed.sql` (OpenStax Calculus Volume 1 hierarchy and
3 sample concept cards). Takes about a minute the first time.

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
`front_format`/`back_format` tags (`latex` today; `gif` or `json` later without any
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
- To apply to another MySQL server (e.g. production later): run `init/01_schema.sql`
  then `init/02_seed.sql` against it in that order.
```

- [ ] **Step 4: Validate compose file**

Run: `docker compose -f flashcards_db/docker-compose.yml config -q`
Expected: exit 0, no output. (Schema SQL is validated for real when MySQL applies it in Task 3.)

- [ ] **Step 5: Commit**

```powershell
git add flashcards_db/docker-compose.yml flashcards_db/init/01_schema.sql flashcards_db/README.md
git commit -m "Add flashcards_db package skeleton: compose, six-table schema, README"
```

---

### Task 2: Seed generator and 02_seed.sql

**Files:**
- Create: `tools/generate_flashcards_seed.py` (gitignored dir: use `git add -f`)
- Create (generated): `flashcards_db/init/02_seed.sql`

**Interfaces:**
- Consumes: `references/openstax_calculus_v1/book_map.json` (fields: title, authors, license, attribution_required, source_url, book_key, sections[].number/title/learning_objectives). Table/column names from Task 1's schema exactly.
- Produces: `flashcards_db/init/02_seed.sql` with explicit-id INSERTs; prints `chapters=45 los=<N>` to stdout; the `<N>` is used by Task 3's count verification. Sample cards: concept ids 1-3, flashcard ids 1-3, all card_type 'concept_example', blob literals as 0x hex.

- [ ] **Step 1: Write `tools/generate_flashcards_seed.py`**

```python
"""Generate flashcards_db/init/02_seed.sql from the OpenStax corpus index.

Deterministic: same book_map.json in, byte-identical SQL out (no timestamps).
Run from repo root:  python tools/generate_flashcards_seed.py
"""
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BOOK_MAP = REPO / "references" / "openstax_calculus_v1" / "book_map.json"
OUT = REPO / "flashcards_db" / "init" / "02_seed.sql"

SUBJECT_NAME = "Calculus"

# Sample concept/example cards (spec sec 4). Math hand-verified:
#   f(x)=3x^2+2x-1 -> f(2)=3*4+4-1=15;  sqrt(x-3) needs x>=3;  x^2 range [0,inf).
# Keyed by (section_number, exact LO text) -> list of (concept_name, front, back).
SAMPLE_CARDS = {
    ("1.1", "Use functional notation to evaluate a function."): [
        (
            "Evaluating a function at a value",
            r"\textbf{Evaluating a function.} For a function $f(x)$, the value $f(a)$ "
            r"is found by substituting $x=a$ everywhere $x$ appears in the rule, then "
            r"simplifying.",
            r"\textbf{Worked example.} Let $f(x)=3x^2+2x-1$. Then "
            r"$f(2)=3(2)^2+2(2)-1=12+4-1=15$.",
        ),
    ],
    ("1.1", "Determine the domain and range of a function."): [
        (
            "Domain of a function",
            r"\textbf{Domain.} The domain of a function is the set of all inputs $x$ "
            r"for which the rule produces a real output. Common restrictions: no "
            r"division by zero, no square root of a negative number.",
            r"\textbf{Worked example.} Let $f(x)=\sqrt{x-3}$. We need $x-3\ge 0$, "
            r"so $x\ge 3$: the domain is $[3,\infty)$.",
        ),
        (
            "Range of a function",
            r"\textbf{Range.} The range of a function is the set of all output values "
            r"it actually produces as $x$ runs over the whole domain.",
            r"\textbf{Worked example.} Let $f(x)=x^2$ on domain $(-\infty,\infty)$. "
            r"Squares are never negative, and every $y\ge 0$ is reached (take "
            r"$x=\sqrt{y}$), so the range is $[0,\infty)$.",
        ),
    ],
}


def sql_str(s):
    """Escape a Python string as a single-quoted MySQL literal."""
    return "'" + s.replace("\\", "\\\\").replace("'", "''") + "'"


def sql_blob(s):
    """UTF-8 text as a MySQL hex blob literal (no escaping pitfalls)."""
    return "0x" + s.encode("utf-8").hex()


def main():
    book = json.loads(BOOK_MAP.read_text(encoding="utf-8"))
    lines = [
        "-- GENERATED by tools/generate_flashcards_seed.py. Do not edit by hand.",
        "-- Source: references/openstax_calculus_v1/book_map.json",
        "USE flashcards;",
        "SET NAMES utf8mb4;",
        "",
        f"INSERT INTO subject (id, name) VALUES (1, {sql_str(SUBJECT_NAME)});",
        "",
        "INSERT INTO textbook (id, subject_id, title, book_key, authors, license,"
        " attribution, source_url) VALUES",
        "  (1, 1, {t}, {k}, {a}, {l}, {at}, {u});".format(
            t=sql_str(book["title"]),
            k=sql_str(book["book_key"]),
            a=sql_str("; ".join(book["authors"])),
            l=sql_str(book["license"]),
            at=sql_str(book["attribution_required"]),
            u=sql_str(book["source_url"]),
        ),
        "",
    ]

    chapter_rows, lo_rows = [], []
    lo_id_by_key = {}
    lo_id = 0
    for ch_id, sec in enumerate(book["sections"], start=1):
        chap_num = int(sec["number"].split(".")[0])
        chapter_rows.append(
            f"  ({ch_id}, 1, {chap_num}, {sql_str(sec['number'])},"
            f" {sql_str(sec['title'])})"
        )
        for ordinal, lo in enumerate(sec["learning_objectives"], start=1):
            lo_id += 1
            lo_id_by_key[(sec["number"], lo)] = lo_id
            lo_rows.append(f"  ({lo_id}, {ch_id}, {sql_str(lo)}, {ordinal})")

    lines.append(
        "INSERT INTO chapter (id, textbook_id, chapter_number, section_number, name)"
        " VALUES\n" + ",\n".join(chapter_rows) + ";"
    )
    lines.append("")
    lines.append(
        "INSERT INTO learning_objective (id, chapter_id, lo_text, ordinal) VALUES\n"
        + ",\n".join(lo_rows) + ";"
    )
    lines.append("")

    concept_rows, card_rows = [], []
    cid = 0
    for (sec_num, lo_text), cards in SAMPLE_CARDS.items():
        parent_lo = lo_id_by_key[(sec_num, lo_text)]  # KeyError = LO text drifted
        for ordinal, (name, front, back) in enumerate(cards, start=1):
            cid += 1
            concept_rows.append(
                f"  ({cid}, {parent_lo}, {sql_str(name)}, {ordinal})"
            )
            card_rows.append(
                f"  ({cid}, {cid}, 'concept_example', {sql_blob(front)}, 'latex',"
                f" {sql_blob(back)}, 'latex')"
            )

    lines.append(
        "INSERT INTO concept (id, lo_id, name, ordinal) VALUES\n"
        + ",\n".join(concept_rows) + ";"
    )
    lines.append("")
    lines.append(
        "INSERT INTO flashcard (id, concept_id, card_type, front_content,"
        " front_format, back_content, back_format) VALUES\n"
        + ",\n".join(card_rows) + ";"
    )
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"chapters={len(chapter_rows)} los={lo_id} concepts={cid} cards={cid}")
    assert len(chapter_rows) == 45, "corpus changed: update spec expectations"


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the generator, record the LO count**

Run: `python tools/generate_flashcards_seed.py`
Expected: prints `chapters=45 los=<N> concepts=3 cards=3` with N around 280, exit 0, and `flashcards_db/init/02_seed.sql` exists. Record N for Task 3.

- [ ] **Step 3: Determinism check**

Run: `python tools/generate_flashcards_seed.py` again, then `git status --short flashcards_db/init/02_seed.sql` after an initial `git add`; or hash twice:
`Get-FileHash flashcards_db/init/02_seed.sql` before and after the second run.
Expected: identical hash both times.

- [ ] **Step 4: Spot-check the SQL**

Open `flashcards_db/init/02_seed.sql` and confirm: `USE flashcards;` at top, one subject, one textbook with the real OpenStax license text, 45-row chapter INSERT, LO INSERT, 3 concepts, 3 flashcards with `0x...` hex blobs, no non-deterministic content.

- [ ] **Step 5: Commit**

```powershell
git add -f tools/generate_flashcards_seed.py
git add flashcards_db/init/02_seed.sql
git commit -m "Add seed generator and generated 02_seed.sql (corpus hierarchy + 3 verified sample cards)"
```

---

### Task 3: Boot MySQL and verify counts

**Files:**
- None created; runs the package.

**Interfaces:**
- Consumes: container `flashcards-db`, root password `change_me_root`, LO count N from Task 2.
- Produces: a running, seeded database for Task 4.

- [ ] **Step 1: Ensure Docker engine is running**

Run: `docker info` (short timeout). If it errors, start Docker Desktop:
`Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"` and poll `docker info` until exit 0 (up to ~90s).

- [ ] **Step 2: Boot**

Run (from `flashcards_db/`): `docker compose up -d`
Expected: image pulls (first time), container `flashcards-db` starts. Wait for health:
`docker inspect --format "{{.State.Health.Status}}" flashcards-db` polls to `healthy`.

- [ ] **Step 3: Verify init applied cleanly**

Run: `docker logs flashcards-db` and check both init files are mentioned
(`/docker-entrypoint-initdb.d/01_schema.sql`, `02_seed.sql`) with no ERROR lines.

- [ ] **Step 4: Count checks**

```powershell
docker exec flashcards-db mysql -uroot -pchange_me_root flashcards -N -e "SELECT COUNT(*) FROM chapter; SELECT COUNT(*) FROM learning_objective; SELECT COUNT(*) FROM concept; SELECT COUNT(*) FROM flashcard; SELECT COUNT(*) FROM flashcard_full;"
```
Expected: 45, N (from Task 2), 3, 3, 3. Any mismatch = stop and debug (systematic-debugging), do not proceed.

- [ ] **Step 5: Round-trip a card**

```powershell
docker exec flashcards-db mysql -uroot -pchange_me_root flashcards -e "SELECT CONVERT(front_content USING utf8mb4) AS front, CONVERT(back_content USING utf8mb4) AS back FROM flashcard WHERE id=1\G"
```
Expected: readable LaTeX, backslashes intact (e.g. `\textbf{Evaluating a function.}` and `f(2)=3(2)^2+2(2)-1=12+4-1=15`).

---

### Task 4: Negative controls and demo queries

**Files:**
- Create: `flashcards_db/demo_queries.sql`

**Interfaces:**
- Consumes: running seeded container from Task 3.
- Produces: demo_queries.sql shipped in the package; verified rejection behavior for the fixture suite record.

- [ ] **Step 1: Negative control 1 (UNIQUE: duplicate card type per concept)**

```powershell
docker exec flashcards-db mysql -uroot -pchange_me_root flashcards -e "INSERT INTO flashcard (concept_id, card_type, front_content, back_content) VALUES (1,'concept_example',0x41,0x42);"
```
Expected: FAILS with `ERROR 1062 ... Duplicate entry` on `uq_flashcard_concept_type`. If it succeeds, the schema is wrong: stop and fix.

- [ ] **Step 2: Negative control 2 (FK: nonexistent concept)**

```powershell
docker exec flashcards-db mysql -uroot -pchange_me_root flashcards -e "INSERT INTO flashcard (concept_id, card_type, front_content, back_content) VALUES (999999,'problem_solution',0x41,0x42);"
```
Expected: FAILS with `ERROR 1452 ... foreign key constraint fails`.

- [ ] **Step 3: Confirm the table is unchanged**

```powershell
docker exec flashcards-db mysql -uroot -pchange_me_root flashcards -N -e "SELECT COUNT(*) FROM flashcard;"
```
Expected: still 3.

- [ ] **Step 4: Write `flashcards_db/demo_queries.sql`**

```sql
-- Showcase queries for the flashcard database. Run any of these in a MySQL client.

-- 1. Every card with its full tag path (subject, textbook, section, LO, concept).
SELECT * FROM flashcard_full;

-- 2. Read one card's actual content (blobs decoded to text).
SELECT CONVERT(front_content USING utf8mb4) AS front,
       CONVERT(back_content USING utf8mb4) AS back
FROM flashcard WHERE id = 1;

-- 3. Coverage gaps: learning objectives with no flashcards yet.
SELECT c.section_number, lo.lo_text
FROM learning_objective lo
JOIN chapter c ON lo.chapter_id = c.id
LEFT JOIN concept co ON co.lo_id = lo.id
LEFT JOIN flashcard f ON f.concept_id = co.id
WHERE f.id IS NULL
ORDER BY c.id, lo.ordinal;

-- 4. Card counts rolled up by real chapter (1-6).
SELECT c.chapter_number, COUNT(f.id) AS cards
FROM chapter c
LEFT JOIN learning_objective lo ON lo.chapter_id = c.id
LEFT JOIN concept co ON co.lo_id = lo.id
LEFT JOIN flashcard f ON f.concept_id = co.id
GROUP BY c.chapter_number
ORDER BY c.chapter_number;

-- 5. The attribution line a UI is obligated to show (CC BY-NC-SA).
SELECT title, license, attribution, source_url FROM textbook;
```

- [ ] **Step 5: Run every demo query, confirm each returns sensibly**

```powershell
Get-Content flashcards_db/demo_queries.sql -Raw | docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards
```
Expected: exit 0; query 1 returns 3 rows, query 3 returns N-2 LO rows (two seeded LOs have cards), query 4 shows chapter 1 = 3 and chapters 2-6 = 0, query 5 shows the OpenStax credit.

- [ ] **Step 6: Commit**

```powershell
git add flashcards_db/demo_queries.sql
git commit -m "Add demo queries; negative controls verified (UNIQUE 1062, FK 1452)"
```

---

### Task 5: Project memory update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Sections to touch (maintaining-project-memory skill): sec 2 (correct the July 20 backend directive entry: it is a FLASHCARD database, team vision changed, repo flashcard work superseded for this path), sec 9 (decision entries: approach B with reasons, repo-independent package, concept-cards-only scope; reversal note on my corpus-DB interpretation), sec 12 (caveats: naming vs production unknown, concept inventory does not exist yet, animation format open), sec 13 (backlog 14 rewritten as done + follow-ups), sec 15 (file map: flashcards_db/, tools/generate_flashcards_seed.py, both plan docs).

- [ ] **Step 2: Commit**

```powershell
git add CLAUDE.md
git commit -m "Log flashcard DB build: corrected directive, approach B decisions, file map"
```

---

## Self-review notes (run after writing, fixed inline)

- Spec coverage: sec 2 package -> Tasks 1, 2, 4; sec 3 schema -> Task 1; sec 4 seed -> Task 2; sec 5 verification -> Tasks 2 (determinism), 3 (counts, round-trip), 4 (negative controls, demo); sec 6/7 -> Task 5 memory. No gaps.
- Placeholders: none; all file contents are complete.
- Type consistency: table/column names identical across Task 1 DDL, Task 2 generator, Task 4 queries (checked: concept_id, card_type, front_content/front_format, uq_flashcard_concept_type).
- Windows note: docker exec quoting kept to double-quoted -e strings without $ or backticks, safe in PowerShell 5.1.
