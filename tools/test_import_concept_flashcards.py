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
