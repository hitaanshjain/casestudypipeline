# Concept Flashcard Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load the 75 PowerPoint concept flashcard decks into the existing flashcards MySQL database as JSON card content, mapped to OpenStax learning objectives, with verification.

**Architecture:** A new deterministic build tool reads each 2-slide `.pptx` with the standard library, serializes each slide to a JSON document of ordered text and math-SVG blocks, joins each deck to a learning objective through a reviewable CSV mapping, and emits `flashcards_db/init/03_concept_cards.sql`. The existing schema is untouched; the existing seed generator loses its three placeholder cards and gains a shared learning-objective index so both generators assign identical ids.

**Tech Stack:** Python 3.11+ standard library only (`zipfile`, `xml.etree.ElementTree`, `json`, `csv`, `pathlib`, `hashlib`), pytest for tests, MySQL 8.4 in Docker.

Spec: `plan/concept_flashcard_import_design.md`. Read it before starting.

## Global Constraints

- **Runtime dependencies: standard library only.** `pytest` is permitted for tests only; no imports of third-party packages inside `tools/import_concept_flashcards.py`.
- **Determinism:** same decks plus same mapping in, byte-identical SQL out. No timestamps, no `dict` iteration that depends on insertion of unsorted input, no `Path.glob` without `sorted()`.
- **Content format:** `front_format` and `back_format` are the literal string `json`. `card_type` is `concept_example`.
- **Encoding:** all files read and written as UTF-8. SQL files written with `newline="\n"`, matching `tools/generate_flashcards_seed.py:135`.
- **Blobs are hex literals:** `0x...` from `bytes.hex()`, never quoted strings. Avoids all escaping pitfalls.
- **Windows console:** prefix any command whose output contains non-ASCII with `PYTHONIOENCODING=utf-8`, or the cp1252 console raises `UnicodeEncodeError`.
- **`tools/` is gitignored.** Every new file under `tools/` must be staged with `git add -f`.
- **Commits:** one line, a single clear sentence, no body, no trailers (CLAUDE.md operating rule 2). Commit at the end of every task; never leave the tree dirty.
- **No em dashes** in any file written for this project.
- **Run all commands from the repo root** `c:\Users\hitaa\Downloads\MathGPT`.
- Expected corpus totals, assert them rather than trusting them: 45 chapters (sections), 195 learning objectives, 75 concepts, 75 cards.

---

### Task 1: Deck extraction to JSON

Parse one `.pptx` side into a `{"title", "blocks"}` document. Shapes are ordered by their vertical offset; text shapes become `text` blocks; picture shapes resolve to the real SVG through the `svgBlip` extension and become `math_svg` blocks.

**Files:**
- Create: `tools/import_concept_flashcards.py`
- Test: `tools/test_import_concept_flashcards.py`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `DECKS: Path`, the deck folder root.
  - `deck_paths() -> list[Path]`, all 75 deck paths, sorted by filename.
  - `extract_side(zf: zipfile.ZipFile, slide: str) -> dict` where `slide` is `"slide1"` or `"slide2"`; returns `{"title": str, "blocks": list[dict]}` and each block is `{"type": "text"|"math_svg", "value": str}`.
  - `count_content_shapes(zf: zipfile.ZipFile, slide: str) -> int`, the number of text-bearing shapes plus picture shapes in the source slide.

- [ ] **Step 1: Write the failing test**

Create `tools/test_import_concept_flashcards.py`:

```python
"""Tests for tools/import_concept_flashcards.py. Run: python -m pytest tools/ -v"""
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import import_concept_flashcards as imp

DECK_MATH = imp.DECKS / "01_Functions_and_Graphs" / "002_Domain_And_Range.pptx"
DECK_TEXT = imp.DECKS / "01_Functions_and_Graphs" / "001_Functions.pptx"


def test_front_side_is_title_plus_ordered_text():
    with zipfile.ZipFile(DECK_MATH) as zf:
        side = imp.extract_side(zf, "slide1")
    assert side["title"] == "Domain And Range"
    assert [b["type"] for b in side["blocks"]] == ["text"] * 5
    assert [b["value"] for b in side["blocks"]] == [
        "Allowed Values",
        "Domain = allowed inputs; range = possible outputs.",
        "Domain controls where a function is defined.",
        "Range describes what outputs the function can actually produce.",
        "Flip for a worked example",
    ]


def test_back_side_interleaves_math_svg_in_slide_order():
    with zipfile.ZipFile(DECK_MATH) as zf:
        side = imp.extract_side(zf, "slide2")
    assert side["title"] == "Worked Example"
    assert [b["type"] for b in side["blocks"]] == [
        "text", "math_svg", "math_svg", "math_svg", "math_svg", "math_svg", "text",
    ]
    assert side["blocks"][0]["value"] == "Find domain and range of f(x)=\u221a(x\u22122)."
    assert side["blocks"][-1]["value"] == "Radicals require nonnegative radicands."


def test_math_blocks_hold_real_svg_not_the_mislabelled_png():
    with zipfile.ZipFile(DECK_MATH) as zf:
        side = imp.extract_side(zf, "slide2")
    svg = [b["value"] for b in side["blocks"] if b["type"] == "math_svg"]
    assert len(svg) == 5
    for s in svg:
        assert s.startswith("<svg")
        assert "MJX" in s  # MathJax glyph ids


def test_text_only_deck_yields_no_math_blocks():
    with zipfile.ZipFile(DECK_TEXT) as zf:
        side = imp.extract_side(zf, "slide2")
    assert side["title"] == "Worked Example"
    assert all(b["type"] == "text" for b in side["blocks"])
    assert len(side["blocks"]) == 7


def test_content_shape_count_matches_emitted_blocks():
    with zipfile.ZipFile(DECK_MATH) as zf:
        for slide in ("slide1", "slide2"):
            side = imp.extract_side(zf, slide)
            n = imp.count_content_shapes(zf, slide)
            assert n == len(side["blocks"]) + 1


def test_deck_paths_finds_all_seventy_five_sorted():
    paths = imp.deck_paths()
    assert len(paths) == 75
    assert paths[0].name == "001_Functions.pptx"
    assert paths[-1].name == "075_Center_Of_Mass.pptx"
    assert [p.name for p in paths] == sorted(p.name for p in paths)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: collection error, `ModuleNotFoundError: No module named 'import_concept_flashcards'`.

- [ ] **Step 3: Write the implementation**

Create `tools/import_concept_flashcards.py`:

```python
"""Import the 75 concept flashcard decks into flashcards_db seed SQL.

Deterministic: same decks + same mapping in, byte-identical SQL out.
Spec: plan/concept_flashcard_import_design.md
Run from repo root:  python tools/import_concept_flashcards.py
"""
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DECKS = REPO / "OpenStax_Calculus_Volume_1_Concept_Only_Flashcards"

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "asvg": "http://schemas.microsoft.com/office/drawing/2016/SVG/main",
}
R_EMBED = "{%s}embed" % NS["r"]
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def deck_paths():
    """All deck paths, sorted by filename (the 001_ prefix gives book order)."""
    return sorted(DECKS.glob("*/*.pptx"), key=lambda p: p.name)


def _shape_y(el):
    """Vertical offset in EMU. Every text-bearing shape in these decks has one."""
    off = el.find("./p:spPr/a:xfrm/a:off", NS)
    return int(off.get("y")) if off is not None else 0


def _shape_text(el):
    """Runs concatenated within a paragraph, paragraphs joined by newline.

    Runs must not be separated: PowerPoint splits "f(x)=..." across runs.
    """
    paras = []
    for p in el.findall("./p:txBody/a:p", NS):
        runs = "".join(t.text or "" for t in p.findall("./a:r/a:t", NS))
        if runs.strip():
            paras.append(runs)
    return "\n".join(paras)


def _pic_rel_id(el):
    """Prefer the svgBlip relationship: the primary .png is SVG bytes misnamed."""
    blip = el.find("./p:blipFill/a:blip", NS)
    if blip is None:
        return None
    svg = blip.find("./a:extLst/a:ext/asvg:svgBlip", NS)
    return (svg if svg is not None else blip).get(R_EMBED)


def _rels(zf, slide):
    root = ET.fromstring(zf.read("ppt/slides/_rels/%s.xml.rels" % slide))
    return {r.get("Id"): r.get("Target") for r in root.findall(REL_NS + "Relationship")}


def _shape_tree(zf, slide):
    root = ET.fromstring(zf.read("ppt/slides/%s.xml" % slide))
    return root.find("./p:cSld/p:spTree", NS)


def extract_side(zf, slide):
    """One slide as {"title": str, "blocks": [{"type","value"}, ...]}.

    The first text block in vertical order becomes the title.
    """
    rels = _rels(zf, slide)
    items = []
    for el in _shape_tree(zf, slide):
        tag = el.tag.split("}")[1]
        if tag == "sp":
            text = _shape_text(el)
            if text:
                items.append((_shape_y(el), {"type": "text", "value": text}))
        elif tag == "pic":
            target = rels[_pic_rel_id(el)].replace("../", "ppt/")
            svg = zf.read(target).decode("utf-8")
            items.append((_shape_y(el), {"type": "math_svg", "value": svg}))
    items.sort(key=lambda item: item[0])  # stable: ties keep document order
    blocks = [block for _, block in items]
    title = ""
    if blocks and blocks[0]["type"] == "text":
        title = blocks.pop(0)["value"]
    return {"title": title, "blocks": blocks}


def count_content_shapes(zf, slide):
    """Source-side count for the completeness guard: text shapes plus pictures."""
    n = 0
    for el in _shape_tree(zf, slide):
        tag = el.tag.split("}")[1]
        if tag == "sp" and _shape_text(el):
            n += 1
        elif tag == "pic":
            n += 1
    return n
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -f tools/import_concept_flashcards.py tools/test_import_concept_flashcards.py
git commit -m "Add pptx concept flashcard extraction: ordered text and math-SVG blocks per slide"
```

---

### Task 2: Whole-corpus extraction guards

Task 1 proves two decks. This proves all 75, and installs the structural assumptions as tests so a future deck that breaks them fails loudly instead of silently losing content.

**Files:**
- Modify: `tools/test_import_concept_flashcards.py` (append)
- Modify: `tools/import_concept_flashcards.py` (append `extract_deck`)

**Interfaces:**
- Consumes: `deck_paths`, `extract_side`, `count_content_shapes` from Task 1.
- Produces: `extract_deck(path: Path) -> dict` returning `{"concept": str, "front": dict, "back": dict}`, where `concept` is the front side's title.

- [ ] **Step 1: Write the failing test**

Append to `tools/test_import_concept_flashcards.py`:

```python
def test_every_deck_has_exactly_two_slides():
    for path in imp.deck_paths():
        with zipfile.ZipFile(path) as zf:
            slides = [n for n in zf.namelist()
                      if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
        assert len(slides) == 2, path.name


def test_no_deck_uses_grouped_shapes():
    """Grouped shapes would hide content from the flat spTree walk."""
    for path in imp.deck_paths():
        with zipfile.ZipFile(path) as zf:
            for slide in ("slide1", "slide2"):
                assert b"<p:grpSp>" not in zf.read("ppt/slides/%s.xml" % slide), path.name


def test_all_150_sides_extract_with_no_dropped_content():
    for path in imp.deck_paths():
        with zipfile.ZipFile(path) as zf:
            for slide in ("slide1", "slide2"):
                side = imp.extract_side(zf, slide)
                assert side["title"], "%s %s has no title" % (path.name, slide)
                expected = imp.count_content_shapes(zf, slide)
                assert expected == len(side["blocks"]) + 1, "%s %s" % (path.name, slide)
                assert side["blocks"], "%s %s has no blocks" % (path.name, slide)


def test_every_math_block_is_decodable_svg():
    for path in imp.deck_paths():
        with zipfile.ZipFile(path) as zf:
            for slide in ("slide1", "slide2"):
                for block in imp.extract_side(zf, slide)["blocks"]:
                    if block["type"] == "math_svg":
                        assert block["value"].startswith("<svg"), path.name


def test_extract_deck_names_the_concept_from_the_front_title():
    deck = imp.extract_deck(DECK_MATH)
    assert deck["concept"] == "Domain And Range"
    assert deck["front"]["title"] == "Domain And Range"
    assert deck["back"]["title"] == "Worked Example"


def test_all_concept_names_are_unique():
    names = [imp.extract_deck(p)["concept"] for p in imp.deck_paths()]
    assert len(set(names)) == len(names), "duplicate concept names break UNIQUE(lo_id, name)"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: the two `extract_deck` tests fail with `AttributeError: module 'import_concept_flashcards' has no attribute 'extract_deck'`. The four structural tests should already pass.

- [ ] **Step 3: Write the implementation**

Append to `tools/import_concept_flashcards.py`, after `count_content_shapes`:

```python
def extract_deck(path):
    """One deck as {"concept": front title, "front": side, "back": side}."""
    with zipfile.ZipFile(path) as zf:
        front = extract_side(zf, "slide1")
        back = extract_side(zf, "slide2")
        for slide, side in (("slide1", front), ("slide2", back)):
            expected = count_content_shapes(zf, slide)
            if expected != len(side["blocks"]) + 1:
                raise ValueError(
                    "%s %s: %d source shapes but %d blocks + title"
                    % (path.name, slide, expected, len(side["blocks"]))
                )
    return {"concept": front["title"], "front": front, "back": back}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: 12 passed.

If `test_all_concept_names_are_unique` fails, do not rename anything yet. Report the duplicate names and stop: the fix is a mapping decision (two decks under one LO cannot share a name) and belongs to Task 3.

- [ ] **Step 5: Commit**

```bash
git add -f tools/import_concept_flashcards.py tools/test_import_concept_flashcards.py
git commit -m "Add whole-corpus extraction guards: two slides, no groups, no dropped shapes, unique concept names"
```

---

### Task 3: Author and validate the learning-objective mapping

Each deck needs a section and a learning objective, because `concept` hangs off `learning_objective`. The folders give only the chapter, so this task produces the 75 judgments as a reviewable CSV that the generator later consumes as input data.

**Files:**
- Create: `tools/flashcard_lo_mapping.csv`
- Modify: `tools/import_concept_flashcards.py` (append `load_mapping`)
- Modify: `tools/test_import_concept_flashcards.py` (append)

**Interfaces:**
- Consumes: `deck_paths`, `extract_deck` from Tasks 1 and 2.
- Produces: `load_mapping() -> dict[str, dict]` keyed by `card_file`, each value holding `section_number`, `lo_text`, `confidence`, `note`.

- [ ] **Step 1: Author the CSV**

Read the learning objectives first:

```bash
PYTHONIOENCODING=utf-8 python -c "
import json
b=json.load(open('references/openstax_calculus_v1/book_map.json',encoding='utf-8'))
for s in b['sections']:
    print(s['number'], s['title'])
    for lo in s['learning_objectives']: print('   ', lo)
"
```

Then for each of the 75 decks, read its front side and choose the section and LO whose wording the card actually teaches:

```bash
PYTHONIOENCODING=utf-8 python -c "
import sys; sys.path.insert(0,'tools')
import import_concept_flashcards as imp
for p in imp.deck_paths():
    d = imp.extract_deck(p)
    print(p.name, '|', d['concept'], '|',
          ' / '.join(b['value'] for b in d['front']['blocks'] if b['type']=='text')[:160])
"
```

Write `tools/flashcard_lo_mapping.csv` with this exact header and 75 rows:

```csv
card_file,concept_name,section_number,lo_text,confidence,note
001_Functions.pptx,Functions,1.1,Use functional notation to evaluate a function.,clear,
002_Domain_And_Range.pptx,Domain And Range,1.1,Determine the domain and range of a function.,clear,
028_Power_Rule.pptx,Power Rule,3.3,"State the constant, constant multiple, and power rules.",clear,
029_Constant_Multiple_Rule.pptx,Constant Multiple Rule,3.3,"State the constant, constant multiple, and power rules.",clear,
031_Product_Rule.pptx,Product Rule,3.3,Use the product rule for finding the derivative of a product of functions.,clear,
057_Sigma_Notation.pptx,Sigma Notation,5.1,Use sigma (summation) notation to calculate sums and powers of integers.,clear,
```

Rules for the remaining rows:

- `card_file` is the bare filename; `concept_name` must equal the deck's front title exactly, as `extract_deck` returns it.
- `lo_text` must match a learning objective in `book_map.json` byte for byte, including trailing periods. Any LO text containing a comma must be quoted, as in the `3.3` rows above.
- `confidence` is `clear` or `judgment`. Use `judgment` whenever the card's topic is not named in the LO wording, and give the reason in `note`. Known cases: `042_Extreme_Value_Theorem` and `044_Rolles_Theorem` (named theorems OpenStax folds into unnamed LOs), `039_Higher_Derivatives` (no LO of its own anywhere).
- `note` is empty for `clear` rows and a single sentence for `judgment` rows. Never use a comma inside an unquoted note.
- Many decks may share one LO. That is legal and expected.
- The section chosen must be the section that LO belongs to. The validator enforces this.

- [ ] **Step 2: Write the failing test**

Append to `tools/test_import_concept_flashcards.py`:

```python
import json


def _book():
    path = imp.REPO / "references" / "openstax_calculus_v1" / "book_map.json"
    return json.loads(path.read_text(encoding="utf-8"))


def test_mapping_covers_every_deck_exactly_once():
    mapping = imp.load_mapping()
    assert len(mapping) == 75
    assert set(mapping) == {p.name for p in imp.deck_paths()}


def test_mapping_concept_names_match_the_decks():
    mapping = imp.load_mapping()
    for path in imp.deck_paths():
        assert mapping[path.name]["concept_name"] == imp.extract_deck(path)["concept"]


def test_every_mapped_lo_exists_in_that_section():
    valid = {(s["number"], lo) for s in _book()["sections"]
             for lo in s["learning_objectives"]}
    for card, row in imp.load_mapping().items():
        assert (row["section_number"], row["lo_text"]) in valid, card


def test_confidence_vocabulary_is_closed_and_judgments_are_explained():
    for card, row in imp.load_mapping().items():
        assert row["confidence"] in ("clear", "judgment"), card
        if row["confidence"] == "judgment":
            assert row["note"].strip(), "%s is flagged but unexplained" % card


def test_concept_names_are_unique_within_each_learning_objective():
    seen = set()
    for card, row in imp.load_mapping().items():
        key = (row["section_number"], row["lo_text"], row["concept_name"])
        assert key not in seen, "%s collides on UNIQUE(lo_id, name)" % card
        seen.add(key)
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: the five new tests fail with `AttributeError: ... has no attribute 'load_mapping'`.

- [ ] **Step 4: Write the implementation**

Append to `tools/import_concept_flashcards.py`:

```python
import csv

MAPPING = Path(__file__).resolve().parent / "flashcard_lo_mapping.csv"


def load_mapping():
    """The authored card-to-LO mapping, keyed by deck filename."""
    with MAPPING.open(encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))
    mapping = {}
    for row in rows:
        card = row["card_file"].strip()
        if card in mapping:
            raise ValueError("duplicate mapping row for %s" % card)
        mapping[card] = {
            "concept_name": row["concept_name"],
            "section_number": row["section_number"].strip(),
            "lo_text": row["lo_text"],
            "confidence": row["confidence"].strip(),
            "note": row["note"] or "",
        }
    return mapping
```

Move the `import csv` line up beside the other imports at the top of the file rather than leaving it mid-file.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: 17 passed. Fix the CSV, not the tests, when a row fails.

- [ ] **Step 6: Report the flagged rows**

Run: `PYTHONIOENCODING=utf-8 python -c "import sys; sys.path.insert(0,'tools'); import import_concept_flashcards as imp; [print(k, '|', v['section_number'], '|', v['lo_text'], '|', v['note']) for k,v in sorted(imp.load_mapping().items()) if v['confidence']=='judgment']"`

Print the list in the task summary so Hitaansh can review the judgment calls without opening the CSV.

- [ ] **Step 7: Commit**

```bash
git add -f tools/flashcard_lo_mapping.csv tools/import_concept_flashcards.py tools/test_import_concept_flashcards.py
git commit -m "Map 75 concept flashcards to OpenStax learning objectives with confidence flags"
```

---

### Task 4: Generate the card SQL and drop the placeholder cards

Emit `03_concept_cards.sql`, and strip the three hand-written sample cards from the hierarchy seed so the deck versions are the only cards.

**Files:**
- Modify: `tools/generate_flashcards_seed.py` (remove `SAMPLE_CARDS`, expose `lo_index`)
- Modify: `tools/import_concept_flashcards.py` (append `main` and SQL helpers)
- Modify: `tools/test_import_concept_flashcards.py` (append)
- Create: `flashcards_db/init/03_concept_cards.sql` (generated)
- Modify: `flashcards_db/init/02_seed.sql` (regenerated)

**Interfaces:**
- Consumes: `load_mapping`, `extract_deck`, `deck_paths`.
- Produces: `lo_index(book) -> dict[(section_number, lo_text), int]` in `generate_flashcards_seed`, imported by the new tool so both generators agree on learning-objective ids.

- [ ] **Step 1: Write the failing test**

Append to `tools/test_import_concept_flashcards.py`:

```python
import hashlib


def test_lo_index_is_shared_between_both_generators():
    import generate_flashcards_seed as seed
    index = seed.lo_index(_book())
    assert len(index) == 195
    assert index[("1.1", "Use functional notation to evaluate a function.")] == 1


def test_card_json_round_trips_and_is_utf8():
    doc = imp.card_json(imp.extract_deck(DECK_MATH)["back"])
    assert isinstance(doc, bytes)
    parsed = json.loads(doc.decode("utf-8"))
    assert parsed["title"] == "Worked Example"
    assert parsed["blocks"][0]["value"].endswith("(x\u22122).")


def test_generated_sql_has_one_concept_and_one_card_per_deck():
    sql = imp.build_sql()
    assert sql.count("(1, 1, 'concept_example'") == 1
    concepts = sql.split("INSERT INTO concept")[1].split(";")[0]
    cards = sql.split("INSERT INTO flashcard")[1].split(";")[0]
    assert concepts.count("\n  (") == 75
    assert cards.count("\n  (") == 75
    assert "'json'" in cards
    assert "'latex'" not in cards


def test_sql_generation_is_deterministic():
    assert hashlib.sha256(imp.build_sql().encode("utf-8")).hexdigest() == \
           hashlib.sha256(imp.build_sql().encode("utf-8")).hexdigest()


def test_seed_no_longer_ships_placeholder_cards():
    seed_sql = (imp.REPO / "flashcards_db" / "init" / "02_seed.sql").read_text(encoding="utf-8")
    assert "INSERT INTO concept" not in seed_sql
    assert "INSERT INTO flashcard" not in seed_sql
    assert "INSERT INTO learning_objective" in seed_sql
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: failures for `lo_index`, `card_json`, `build_sql`, and the seed still containing card inserts.

- [ ] **Step 3: Refactor the seed generator**

In `tools/generate_flashcards_seed.py`:

Delete the `SAMPLE_CARDS` dict (lines 15 to 48) and the `sql_blob` function, which no longer has a caller.

Replace the body of `main` that builds `concept_rows` and `card_rows` (lines 109 to 132) so nothing after the learning-objective insert is emitted. The final `lines.append("")` before `OUT.write_text` stays.

Add this function above `main`, and use it inside `main` in place of the inline `lo_id_by_key` bookkeeping:

```python
def lo_index(book):
    """(section_number, lo_text) -> learning_objective id, 1-based in book order.

    Shared with tools/import_concept_flashcards.py so both generators agree.
    """
    index = {}
    lo_id = 0
    for sec in book["sections"]:
        for lo in sec["learning_objectives"]:
            lo_id += 1
            index[(sec["number"], lo)] = lo_id
    return index
```

Update the final `print` to drop the now-meaningless concept and card counts:

```python
    print(f"chapters={len(chapter_rows)} los={lo_id}")
```

- [ ] **Step 4: Write the card generator**

Append to `tools/import_concept_flashcards.py`:

```python
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_flashcards_seed import lo_index, sql_str  # noqa: E402

BOOK_MAP = REPO / "references" / "openstax_calculus_v1" / "book_map.json"
OUT = REPO / "flashcards_db" / "init" / "03_concept_cards.sql"


def card_json(side):
    """A side as canonical UTF-8 JSON bytes. sort_keys makes it deterministic."""
    return json.dumps(side, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":")).encode("utf-8")


def build_sql():
    book = json.loads(BOOK_MAP.read_text(encoding="utf-8"))
    index = lo_index(book)
    mapping = load_mapping()

    concept_rows, card_rows = [], []
    ordinal_by_lo = {}
    for cid, path in enumerate(deck_paths(), start=1):
        row = mapping[path.name]
        lo_id = index[(row["section_number"], row["lo_text"])]
        deck = extract_deck(path)
        ordinal_by_lo[lo_id] = ordinal_by_lo.get(lo_id, 0) + 1
        concept_rows.append(
            "  (%d, %d, %s, %d)" % (cid, lo_id, sql_str(deck["concept"]),
                                    ordinal_by_lo[lo_id])
        )
        card_rows.append(
            "  (%d, %d, 'concept_example', 0x%s, 'json', 0x%s, 'json')"
            % (cid, cid, card_json(deck["front"]).hex(), card_json(deck["back"]).hex())
        )

    return "\n".join([
        "-- GENERATED by tools/import_concept_flashcards.py. Do not edit by hand.",
        "-- Source: OpenStax_Calculus_Volume_1_Concept_Only_Flashcards/ (75 decks)",
        "-- Mapping: tools/flashcard_lo_mapping.csv",
        "USE flashcards;",
        "SET NAMES utf8mb4;",
        "",
        "INSERT INTO concept (id, lo_id, name, ordinal) VALUES\n"
        + ",\n".join(concept_rows) + ";",
        "",
        "INSERT INTO flashcard (id, concept_id, card_type, front_content,"
        " front_format, back_content, back_format) VALUES\n"
        + ",\n".join(card_rows) + ";",
        "",
    ])


def main():
    sql = build_sql()
    OUT.write_text(sql, encoding="utf-8", newline="\n")
    print("concepts=75 cards=75 bytes=%d" % len(sql.encode("utf-8")))


if __name__ == "__main__":
    main()
```

Move `import json` and `import sys` up beside the other imports at the top of the file.

- [ ] **Step 5: Regenerate both SQL files**

```bash
python tools/generate_flashcards_seed.py
python tools/import_concept_flashcards.py
```

Expected: `chapters=45 los=195`, then `concepts=75 cards=75 bytes=...`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `python -m pytest tools/test_import_concept_flashcards.py -v`
Expected: 22 passed.

- [ ] **Step 7: Verify determinism across runs**

```bash
python tools/import_concept_flashcards.py
sha256sum flashcards_db/init/03_concept_cards.sql
python tools/import_concept_flashcards.py
sha256sum flashcards_db/init/03_concept_cards.sql
```

Expected: identical hashes. If they differ, find the nondeterminism before continuing; do not proceed to the load.

- [ ] **Step 8: Commit**

```bash
git add -f tools/import_concept_flashcards.py tools/test_import_concept_flashcards.py tools/generate_flashcards_seed.py
git add flashcards_db/init/02_seed.sql flashcards_db/init/03_concept_cards.sql
git commit -m "Generate 75 concept cards as JSON blobs and drop the three placeholder cards from the seed"
```

---

### Task 5: Load into MySQL and verify

Nothing is claimed to work until this task's output is shown.

**Files:**
- Create: `tools/verify_flashcard_import.sql`
- Create: `tools/check_blob_round_trip.py`
- Modify: `flashcards_db/README.md`

**Interfaces:**
- Consumes: the generated SQL from Task 4.
- Produces: no code, a verified database and a printed verification ledger.

**Prerequisite:** Docker Desktop must be running. It was not running when this plan was written. If `docker ps` fails, stop and ask Hitaansh to start it rather than working around it.

- [ ] **Step 1: Rebuild the database from scratch**

Init scripts only run on an empty volume, so the volume must be dropped:

```bash
cd flashcards_db
docker compose down -v
docker compose up -d
cd ..
```

Wait for health, then confirm the init applied without error:

```bash
docker compose -f flashcards_db/docker-compose.yml logs flashcards-db | grep -i "error\|03_concept_cards"
```

Expected: the entrypoint reports running `03_concept_cards.sql`, and no error lines.

- [ ] **Step 2: Write the verification query file**

Create `tools/verify_flashcard_import.sql`:

```sql
-- Verification ledger for the concept flashcard import.
-- Run: docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards < tools/verify_flashcard_import.sql
USE flashcards;

SELECT 'chapters' AS check_name, COUNT(*) AS actual, 45 AS expected FROM chapter
UNION ALL SELECT 'learning_objectives', COUNT(*), 195 FROM learning_objective
UNION ALL SELECT 'concepts', COUNT(*), 75 FROM concept
UNION ALL SELECT 'cards', COUNT(*), 75 FROM flashcard
UNION ALL SELECT 'cards_json_format', COUNT(*), 75 FROM flashcard
    WHERE front_format = 'json' AND back_format = 'json'
UNION ALL SELECT 'front_invalid_json', COUNT(*), 0 FROM flashcard
    WHERE JSON_VALID(CONVERT(front_content USING utf8mb4)) = 0
UNION ALL SELECT 'back_invalid_json', COUNT(*), 0 FROM flashcard
    WHERE JSON_VALID(CONVERT(back_content USING utf8mb4)) = 0
UNION ALL SELECT 'cards_missing_title', COUNT(*), 0 FROM flashcard
    WHERE JSON_UNQUOTE(JSON_EXTRACT(CONVERT(front_content USING utf8mb4), '$.title')) = ''
UNION ALL SELECT 'orphan_concepts', COUNT(*), 0 FROM concept c
    LEFT JOIN learning_objective lo ON c.lo_id = lo.id WHERE lo.id IS NULL;

-- Coverage gap: learning objectives with no concept yet. Expected to stay large.
SELECT COUNT(*) AS los_without_any_card
FROM learning_objective lo LEFT JOIN concept c ON c.lo_id = lo.id WHERE c.id IS NULL;

-- Spread across the book, sanity check against the folder counts 15/9/16/16/9/10.
SELECT ch.chapter_number, COUNT(*) AS cards
FROM flashcard f JOIN concept co ON f.concept_id = co.id
JOIN learning_objective lo ON co.lo_id = lo.id
JOIN chapter ch ON lo.chapter_id = ch.id
GROUP BY ch.chapter_number ORDER BY ch.chapter_number;

-- Per-card blob hashes, compared against the source decks in step 4.
SELECT id, SHA2(front_content, 256) AS front_sha, SHA2(back_content, 256) AS back_sha
FROM flashcard ORDER BY id;
```

- [ ] **Step 3: Run the ledger**

```bash
docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards < tools/verify_flashcard_import.sql
```

Expected: every row of the first result set has `actual` equal to `expected`; chapter spread is 15, 9, 16, 16, 9, 10; `los_without_any_card` is 195 minus the number of distinct LOs used. Paste the real output into the task summary. Do not paraphrase it.

- [ ] **Step 4: Confirm the blobs survived the round trip**

Create this as a scratch file rather than a shell one-liner, since quoting a
multi-line comparison through the shell is error prone. Write
`tools/check_blob_round_trip.py`:

```python
"""One-shot check: stored blob hashes equal the hashes of freshly extracted decks."""
import hashlib
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_concept_flashcards as imp

want = {}
for cid, path in enumerate(imp.deck_paths(), start=1):
    deck = imp.extract_deck(path)
    want[cid] = (
        hashlib.sha256(imp.card_json(deck["front"])).hexdigest(),
        hashlib.sha256(imp.card_json(deck["back"])).hexdigest(),
    )

query = ("SELECT id, SHA2(front_content,256), SHA2(back_content,256) "
         "FROM flashcard ORDER BY id")
result = subprocess.run(
    ["docker", "exec", "-i", "flashcards-db", "mysql", "-uroot",
     "-pchange_me_root", "-N", "-B", "flashcards", "-e", query],
    capture_output=True, text=True, check=True)

rows = [line.split("\t") for line in result.stdout.strip().splitlines()]
bad = [r for r in rows if want[int(r[0])] != (r[1], r[2])]
print("rows compared: %d | mismatches: %d" % (len(rows), len(bad)))
assert len(rows) == 75, "expected 75 cards, found %d" % len(rows)
assert not bad, bad[:3]
print("blob round trip OK")
```

Run: `python tools/check_blob_round_trip.py`

Expected: `rows compared: 75 | mismatches: 0` then `blob round trip OK`.

- [ ] **Step 5: Re-run the two negative controls**

```bash
docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards -e "
INSERT INTO flashcard (concept_id, card_type, front_content, back_content)
VALUES (1, 'concept_example', 0x00, 0x00);"
```

Expected: `ERROR 1062` duplicate entry on `uq_flashcard_concept_type`.

```bash
docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards -e "
INSERT INTO flashcard (concept_id, card_type, front_content, back_content)
VALUES (99999, 'problem_solution', 0x00, 0x00);"
```

Expected: `ERROR 1452` foreign key constraint failure.

Both must fail. A success here means the constraints were lost and the task fails.

- [ ] **Step 6: Visual spot-check**

Render five cards from their stored JSON and compare against the original decks in PowerPoint. Pick `001_Functions` (no math at all), `002_Domain_And_Range` (math on the back only), one deck with math on the front, and two others at random. Write the five to HTML:

```bash
PYTHONIOENCODING=utf-8 python -c "
import sys, json, html; sys.path.insert(0,'tools')
import import_concept_flashcards as imp
picks = ['001_Functions.pptx','002_Domain_And_Range.pptx','028_Power_Rule.pptx','057_Sigma_Notation.pptx','075_Center_Of_Mass.pptx']
out = ['<meta charset=utf-8><style>body{font:16px sans-serif;max-width:900px;margin:2em auto}.card{border:1px solid #999;padding:1em;margin:1em 0}svg{vertical-align:middle}</style>']
for p in imp.deck_paths():
    if p.name not in picks: continue
    d = imp.extract_deck(p)
    for side in ('front','back'):
        out.append('<div class=card><h2>%s / %s: %s</h2>' % (html.escape(p.name), side, html.escape(d[side]['title'])))
        for b in d[side]['blocks']:
            out.append('<p>%s</p>' % (html.escape(b['value']) if b['type']=='text' else b['value']))
        out.append('</div>')
open('spot_check.html','w',encoding='utf-8').write('\n'.join(out))
print('wrote spot_check.html')
"
```

Open `spot_check.html` in a browser next to the decks. Confirm for each: no line missing, no line out of order, every formula present and rendering. Report what you compared and what you saw. Delete `spot_check.html` afterwards; it is a scratch artifact, not a deliverable.

- [ ] **Step 7: Update the README**

In `flashcards_db/README.md`, three edits:

1. In "Run it", replace the `02_seed.sql` sentence so it reads: applies `init/01_schema.sql` (six tables plus the `flashcard_full` view), then `init/02_seed.sql` (OpenStax Calculus Volume 1 hierarchy: 45 sections, 195 learning objectives), then `init/03_concept_cards.sql` (75 concept cards).
2. In "Schema in one line", change `` `latex` today `` to `` `json` today ``.
3. In "Notes", change the last bullet to run `init/01_schema.sql`, then `init/02_seed.sql`, then `init/03_concept_cards.sql` in that order.

- [ ] **Step 8: Commit**

```bash
git add -f tools/verify_flashcard_import.sql tools/check_blob_round_trip.py
git add flashcards_db/README.md
git commit -m "Add flashcard import verification ledger and update the database README for JSON concept cards"
```

---

### Task 6: Update project memory

CLAUDE.md operating rule 1 requires this in the same session, not as a follow-up.

**Files:**
- Modify: `CLAUDE.md` (sections 9, 12, 13, 15)

- [ ] **Step 1: Record the decisions**

In section 9, under the July 20 flashcard DB block, add a July 24 entry covering: the import of the 75 concept decks; JSON as the card content format with the reason (the DB feeds the pipeline, which consumes JSON, and a raster render is deterministically regenerable from the same JSON by a pinned renderer); the same-session reversal from "both formats" to JSON only, per operating rule 3; the schema deliberately left unchanged; best-fit LO mapping with a flagged review file as the control; the three placeholder cards replaced; and the source decks archived off-repo rather than committed, with the `.git` size as the reason.

- [ ] **Step 2: Record the caveats**

In section 12, add: the deck defect (every `.png` inside the decks is SVG bytes misnamed, in all 70 decks that carry images, so raster-fallback consumers see broken images and the deck author should be told); formulas remain images inside the JSON because the MathJax SVGs carry no `aria-label`, `<title>`, or annotation element, so prose is searchable and math is not; the block format is our invention and unvalidated against Peter's production expectations, the same standing caveat as the column naming; and the 75 mapping judgments are LLM-derived with the flagged review file as a human gate, not a proof.

- [ ] **Step 3: Update the backlog and file map**

In section 13 item 14, mark the concept-card authoring follow-up (c) as done for `concept_example` cards and note that `problem_solution` cards remain unbuilt pending the animation decision. Add a new follow-up: tell the deck author about the fake-PNG defect.

In section 15, add `tools/import_concept_flashcards.py`, `tools/test_import_concept_flashcards.py`, `tools/flashcard_lo_mapping.csv`, `tools/verify_flashcard_import.sql`, `tools/check_blob_round_trip.py`, `flashcards_db/init/03_concept_cards.sql`, `plan/concept_flashcard_import_design.md`, and `plan/concept_flashcard_import_implementation_plan.md`. Note that the deck folder is deliberately not tracked.

- [ ] **Step 4: Confirm the tree is clean**

```bash
git status --short
```

Expected: the deck folder may appear as untracked (that is the logged decision); nothing else outstanding.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "Log the concept flashcard import: JSON card content, LO mapping, deck defect and caveats"
```

---

## Notes for the executor

- The five decks with no images at all are `001_Functions`, `023_Intermediate_Value`, `027_Differentiability`, `042_Extreme_Value_Theorem`, `046_First_Derivative_Test`. They are the useful edge case in every test.
- Do not "fix" the mislabelled `.png` files inside the decks. The extractor routes around them by design, and the decks are source material we do not own.
- If a test fails, fix the code or the CSV, never the assertion, unless the assertion is provably wrong about the source files. Say so explicitly if you change one.
- Docker was not running when this plan was written. Tasks 1 to 4 need no database at all.
