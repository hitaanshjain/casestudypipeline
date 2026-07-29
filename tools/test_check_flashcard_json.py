"""Tests for the flashcard card JSON validator.

Run from repo root:  python -m pytest tools/test_check_flashcard_json.py -q
"""
import copy
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_flashcard_json as chk

REPO = Path(__file__).resolve().parent.parent


def good_card():
    """A valid Power Rule card. Every test mutates a copy of this."""
    return copy.deepcopy({
        "format_version": 2,
        "card_type": "concept_example",
        "concept": "Power Rule",
        "source": {
            "book_tag": "openstax_calc1",
            "section": "3.3",
            "lo_ordinal": 1,
            "lo_text": "State the constant, constant multiple, and power rules.",
        },
        "front": {
            "title": "Power Rule",
            "subtitle": "Differentiate Powers",
            "central": {"latex": "\\frac{d}{dx}\\left(x^{n}\\right)=nx^{n-1}"},
            "variable_key": [
                {"symbol": "\\frac{d}{dx}", "meaning": "rate of change with respect to x"},
                {"symbol": "n", "meaning": "constant exponent"},
                {"symbol": "x", "meaning": "variable you differentiate by"},
            ],
            "main_description": "Differentiate any power of a variable in one step.",
            "supporting_description":
                "Multiply by the old exponent, then lower that exponent by one.",
            "footer": "Flip for a worked example",
        },
        "back": {
            "title": "Worked Example",
            "problem": [{"t": "text", "v": "Differentiate "},
                        {"t": "math", "latex": "f(x)=x^{5}"}],
            "rows": [
                {"segments": [{"t": "text", "v": "Here"},
                              {"t": "math", "latex": "n=5"}],
                 "aligned": False, "bold": False},
                {"segments": [{"t": "math",
                               "latex": "\\frac{d}{dx}\\left(x^{n}\\right)=nx^{n-1}"}],
                 "aligned": False, "bold": False},
                {"segments": [{"t": "math", "latex": "f'(x)=5x^{5-1}"}],
                 "aligned": True, "bold": False},
                {"segments": [{"t": "math", "latex": "f'(x)=5x^{4}"}],
                 "aligned": True, "bold": True},
            ],
            "footer": "Power down front, exponent down one.",
        },
    })


def errors_for(card):
    """Gate ids that fired, e.g. {"G05"}."""
    return {line.split(":")[0].replace("ERROR ", "") for line in chk.check_card(card)}


def test_good_card_passes_every_gate():
    assert chk.check_card(good_card()) == []


def test_g01_rejects_wrong_format_version():
    card = good_card()
    card["format_version"] = 1
    assert "G01" in errors_for(card)


def test_g01_rejects_missing_required_key():
    card = good_card()
    del card["front"]["subtitle"]
    assert "G01" in errors_for(card)


def test_g01_rejects_unknown_card_type():
    card = good_card()
    card["card_type"] = "cheat_sheet"
    assert "G01" in errors_for(card)


def test_g02_rejects_paraphrased_front_footer():
    card = good_card()
    card["front"]["footer"] = "Flip for a worked example!"
    assert "G02" in errors_for(card)


def test_g02_rejects_wrong_back_title():
    card = good_card()
    card["back"]["title"] = "Example"
    assert "G02" in errors_for(card)


def test_g03_rejects_one_word_subtitle():
    card = good_card()
    card["front"]["subtitle"] = "Powers"
    assert "G03" in errors_for(card)


def test_g03_rejects_overlong_main_description():
    card = good_card()
    card["front"]["main_description"] = " ".join(["word"] * 15)
    assert "G03" in errors_for(card)


def test_g04_rejects_title_over_24_chars():
    card = good_card()
    card["front"]["title"] = "Logarithmic Differentiation"  # 27, the real slip
    assert "G04" in errors_for(card)


def test_g01_rejects_front_none_type():
    card = good_card()
    card["front"] = None
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_rejects_front_list_type():
    card = good_card()
    card["front"] = []
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_rejects_front_main_description_none():
    card = good_card()
    card["front"]["main_description"] = None
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_rejects_back_problem_dict_not_list():
    card = good_card()
    card["back"]["problem"] = {"t": "text", "v": "hi"}
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_rejects_front_subtitle_integer():
    card = good_card()
    card["front"]["subtitle"] = 42
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_rejects_back_rows_dict_not_list():
    card = good_card()
    card["back"]["rows"] = {"key": "value"}
    result = chk.check_card(card)
    assert result != [] and "G01" in errors_for(card)


def test_g01_crash_proof_on_none_fields():
    card = good_card()
    # Try various paths set to None and assert no crash
    test_paths = [
        ("source.book_tag", lambda c: c["source"].__setitem__("book_tag", None)),
        ("front.title", lambda c: c["front"].__setitem__("title", None)),
        ("back.footer", lambda c: c["back"].__setitem__("footer", None)),
        ("front.central", lambda c: c["front"].__setitem__("central", None)),
        ("front.variable_key", lambda c: c["front"].__setitem__("variable_key", None)),
    ]
    for path, setter in test_paths:
        test_card = good_card()
        setter(test_card)
        result = chk.check_card(test_card)
        assert isinstance(result, list), "check_card should return a list, not raise"
        assert len(result) > 0, "should have at least one error for %s" % path
