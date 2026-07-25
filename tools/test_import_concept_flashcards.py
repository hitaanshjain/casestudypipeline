"""Tests for tools/import_concept_flashcards.py. Run: python -m pytest tools/ -v"""
import collections
import json
import os
import re
import subprocess
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
    assert side["blocks"][0]["value"] == "Find domain and range of f(x)=√(x−2)."
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
                blocks = imp.extract_side(zf, slide)["blocks"]
                for block_idx, block in enumerate(blocks):
                    if block["type"] == "math_svg":
                        assert block["value"].startswith("<svg"), "%s %s block %d" % (path.name, slide, block_idx)


def test_extract_deck_names_the_concept_from_the_front_title():
    deck = imp.extract_deck(DECK_MATH)
    assert deck["concept"] == "Domain And Range"
    assert deck["front"]["title"] == "Domain And Range"
    assert deck["back"]["title"] == "Worked Example"


def test_all_concept_names_are_unique():
    decks = imp.deck_paths()
    concept_to_decks = {}
    for path in decks:
        concept = imp.extract_deck(path)["concept"]
        if concept not in concept_to_decks:
            concept_to_decks[concept] = []
        concept_to_decks[concept].append(path.name)
    duplicates = {name: decks for name, decks in concept_to_decks.items() if len(decks) > 1}
    assert not duplicates, "duplicate concept names break UNIQUE(lo_id, name): %s" % duplicates


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
    assert parsed["blocks"][0]["value"].endswith("(x−2).")


def test_generated_sql_has_one_concept_and_one_card_per_deck():
    sql = imp.build_sql()
    assert sql.count("(1, 1, 'concept_example'") == 1
    concepts = sql.split("INSERT INTO concept")[1].split(";")[0]
    cards = sql.split("INSERT INTO flashcard")[1].split(";")[0]
    assert concepts.count("\n  (") == 75
    assert cards.count("\n  (") == 75
    assert "'json'" in cards
    assert "'latex'" not in cards


def _build_sql_in_subprocess(hash_seed):
    """Run build_sql() in a fresh interpreter with the given PYTHONHASHSEED.

    Emits the SQL to stdout from a -c invocation rather than touching
    flashcards_db/init/03_concept_cards.sql, so the committed file is never
    a side effect of running this test.
    """
    script = (
        "import sys; sys.path.insert(0, %r); "
        "import import_concept_flashcards as imp; "
        "sys.stdout.write(imp.build_sql())" % str(imp.REPO / "tools")
    )
    env = dict(os.environ)
    env["PYTHONHASHSEED"] = hash_seed
    env["PYTHONIOENCODING"] = "utf-8"
    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=str(imp.REPO),
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    return hashlib.sha256(result.stdout.encode("utf-8")).hexdigest()


def test_sql_generation_is_deterministic():
    """Cross-process: two interpreters with different PYTHONHASHSEED must
    agree, or hash-randomization-sensitive iteration (set/dict order) would
    slip past a same-process comparison."""
    assert _build_sql_in_subprocess("0") == _build_sql_in_subprocess("1")


def _concept_ordinals(sql, lo_id):
    """Ordinals for a given lo_id's concept rows, in the order they appear
    in the generated SQL (which is deck_paths() order)."""
    concepts = sql.split("INSERT INTO concept")[1].split(";")[0]
    ordinals = []
    for m in re.finditer(r"\(\d+, (\d+), '.*?', (\d+)\)", concepts):
        if int(m.group(1)) == lo_id:
            ordinals.append(int(m.group(2)))
    return ordinals


def test_ordinals_increment_within_a_shared_lo_and_reset_for_others():
    mapping = imp.load_mapping()
    decks_by_lo = collections.defaultdict(list)
    for path in imp.deck_paths():
        row = mapping[path.name]
        decks_by_lo[(row["section_number"], row["lo_text"])].append(path.name)

    shared_keys = [key for key, decks in decks_by_lo.items() if len(decks) > 1]
    assert shared_keys, "expected at least one learning objective with multiple mapped decks"

    import generate_flashcards_seed as seed
    index = seed.lo_index(_book())
    sql = imp.build_sql()

    shared_key = shared_keys[0]
    shared_ordinals = _concept_ordinals(sql, index[shared_key])
    assert shared_ordinals == list(range(1, len(decks_by_lo[shared_key]) + 1))

    other_key = next(key for key in decks_by_lo if key != shared_key)
    other_ordinals = _concept_ordinals(sql, index[other_key])
    assert other_ordinals[0] == 1


def test_seed_no_longer_ships_placeholder_cards():
    seed_sql = (imp.REPO / "flashcards_db" / "init" / "02_seed.sql").read_text(encoding="utf-8")
    assert "INSERT INTO concept" not in seed_sql
    assert "INSERT INTO flashcard" not in seed_sql
    assert "INSERT INTO learning_objective" in seed_sql
