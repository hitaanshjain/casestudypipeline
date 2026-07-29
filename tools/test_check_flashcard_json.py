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


def test_g01_rejects_empty_concept():
    card = good_card()
    card["concept"] = ""
    assert "G01" in errors_for(card)


def test_g01_rejects_concept_over_40_chars():
    card = good_card()
    card["concept"] = "x" * (chk.CONCEPT_MAX_CHARS + 1)
    assert "G01" in errors_for(card)


def test_g01_accepts_concept_at_40_chars():
    card = good_card()
    card["concept"] = "x" * chk.CONCEPT_MAX_CHARS
    assert "G01" not in errors_for(card)


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


# Amendment, July 28, carried from the Task 1 re-review: four crash inputs
# that survive g01_shape's container type-checks because it never validates
# container CONTENTS. Each of the following used to raise inside a later
# gate instead of returning ERROR lines.

def test_g01_rejects_back_problem_with_a_non_dict_segment():
    card = good_card()
    card["back"]["problem"] = [{"t": "text", "v": "hi"}, "raw string"]
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


def test_g01_rejects_back_problem_of_none():
    card = good_card()
    card["back"]["problem"] = [None]
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


def test_g01_rejects_back_problem_of_ints():
    card = good_card()
    card["back"]["problem"] = [1, 2, 3]
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


def test_g01_rejects_back_problem_text_segment_non_string_v():
    card = good_card()
    card["back"]["problem"] = [{"t": "text", "v": 123}]
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


def test_g01_rejects_front_central_text_non_string():
    card = good_card()
    card["front"]["central"] = {"text": 123}
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


def test_g01_rejects_front_central_text_none():
    card = good_card()
    card["front"]["central"] = {"text": None}
    result = chk.check_card(card)
    assert isinstance(result, list) and "G01" in errors_for(card)


# Final fix wave, July 29. Four mutations passed every gate here while
# FAILING the published schema (measured with jsonschema 4.26), which inverts
# the schema's own "necessary but not sufficient" direction. Two of them are
# substantive holes rather than mere divergences: an empty segments array
# ships a blank filler row, and an empty back.problem ships a worked example
# that states no task. "No filler rows" is the exact rule the old prompt
# scored 0 out of 75 on.

def test_g01_rejects_a_row_with_no_aligned_key():
    card = good_card()
    del card["back"]["rows"][0]["aligned"]
    assert "G01" in errors_for(card)


def test_g01_rejects_a_row_with_no_bold_key():
    card = good_card()
    del card["back"]["rows"][0]["bold"]
    assert "G01" in errors_for(card)


def test_g01_rejects_integer_zero_as_a_row_flag():
    """bold: 0 is not bold: false. G06 reads it with row.get(), which is
    truthy-coerced, so an integer flag used to pass unnoticed."""
    card = good_card()
    card["back"]["rows"][-1]["bold"] = 1
    card["back"]["rows"][0]["aligned"] = 0
    result = chk.check_card(card)
    assert "G01" in errors_for(card)
    assert sum(1 for line in result if "expected true or false" in line) == 2


def test_g01_rejects_an_empty_segments_array():
    card = good_card()
    card["back"]["rows"][0]["segments"] = []
    assert "G01" in errors_for(card)


def test_g01_rejects_a_row_with_no_segments_key():
    card = good_card()
    del card["back"]["rows"][0]["segments"]
    assert "G01" in errors_for(card)


def test_g01_rejects_an_unknown_key_inside_a_segment():
    card = good_card()
    card["back"]["rows"][0]["segments"][0]["style"] = "italic"
    assert "G01" in errors_for(card)


def test_g01_rejects_a_math_key_on_a_text_segment():
    """A segment is a closed shape: t plus v, or t plus latex, never both."""
    card = good_card()
    card["back"]["problem"][0]["latex"] = "x"
    assert "G01" in errors_for(card)


def test_g01_rejects_a_segment_missing_its_value_key():
    card = good_card()
    del card["back"]["problem"][1]["latex"]
    assert "G01" in errors_for(card)


def test_g01_rejects_an_empty_back_problem():
    """A worked example with no task stated cleared all 14 gates."""
    card = good_card()
    card["back"]["problem"] = []
    assert "G01" in errors_for(card)


def test_g05_rejects_three_rows():
    card = good_card()
    card["back"]["rows"] = card["back"]["rows"][:3]
    assert "G05" in errors_for(card)


def test_g05_rejects_seven_rows():
    card = good_card()
    row = copy.deepcopy(card["back"]["rows"][0])
    card["back"]["rows"] = [row] * 6 + [card["back"]["rows"][-1]]
    assert "G05" in errors_for(card)


def test_g05_accepts_six_rows():
    card = good_card()
    plain = {"segments": [{"t": "math", "latex": "n=5"}],
             "aligned": False, "bold": False}
    card["back"]["rows"] = [copy.deepcopy(plain) for _ in range(5)] + \
                           [card["back"]["rows"][-1]]
    assert "G05" not in errors_for(card)


def test_g06_rejects_no_bold_row():
    card = good_card()
    card["back"]["rows"][-1]["bold"] = False
    assert "G06" in errors_for(card)


def test_g06_rejects_two_bold_rows():
    card = good_card()
    # good_card()'s last row is already bold; adding a second bold row
    # must trip the count branch ("N rows are bold").
    card["back"]["rows"][0]["bold"] = True
    assert "G06" in errors_for(card)


def test_g06_rejects_bold_on_a_middle_row():
    card = good_card()
    card["back"]["rows"][0]["bold"] = True
    card["back"]["rows"][-1]["bold"] = False
    result = chk.check_card(card)
    assert "G06" in errors_for(card)
    assert any("row 1 is bold, the bold row must be the last (row 4)" in line
               for line in result)


def test_g07_rejects_non_contiguous_aligned_rows():
    card = good_card()
    card["back"]["rows"][0]["aligned"] = True
    card["back"]["rows"][1]["aligned"] = False
    assert "G07" in errors_for(card)


def test_g07_rejects_aligned_block_not_reaching_the_last_row():
    card = good_card()
    card["back"]["rows"][-1]["aligned"] = False
    assert "G07" in errors_for(card)


def test_g07_accepts_zero_aligned_rows():
    """Conceptual cards such as the IVT have no derivation to align."""
    card = good_card()
    for row in card["back"]["rows"]:
        row["aligned"] = False
    assert "G07" not in errors_for(card)


def _set_aligned(card, flags):
    for row, flag in zip(card["back"]["rows"], flags):
        row["aligned"] = flag
    return card


def _g07_line_count(card):
    return sum(1 for line in chk.check_card(card) if line.startswith("ERROR G07:"))


def test_g07_exact_count_late_start_reaching_the_end():
    # [F, F, T, T]: contiguous block, starts late, reaches the last row.
    card = _set_aligned(good_card(), [False, False, True, True])
    assert _g07_line_count(card) == 0


def test_g07_exact_count_interior_gap():
    # [T, F, T, T]: interior gap, one error line, non-contiguity message.
    card = _set_aligned(good_card(), [True, False, True, True])
    assert _g07_line_count(card) == 1


def test_g07_exact_count_contiguous_but_ends_early():
    # [T, T, F, F]: contiguous, but the block stops before the last row.
    # Must be exactly ONE line (the "must run to the last row" message),
    # not two: the block IS contiguous, so the non-contiguity message
    # would be false.
    card = _set_aligned(good_card(), [True, True, False, False])
    assert _g07_line_count(card) == 1


def test_g07_exact_count_all_unaligned():
    # [F, F, F, F]: zero aligned rows is valid.
    card = _set_aligned(good_card(), [False, False, False, False])
    assert _g07_line_count(card) == 0


def test_g07_exact_count_all_aligned():
    # [T, T, T, T]: fully aligned, contiguous, reaches the last row.
    card = _set_aligned(good_card(), [True, True, True, True])
    assert _g07_line_count(card) == 0


def test_g08_rejects_missing_key_when_central_is_latex():
    card = good_card()
    del card["front"]["variable_key"]
    assert "G08" in errors_for(card)


def test_g08_rejects_key_present_when_central_is_text():
    card = good_card()
    card["front"]["central"] = {"text": "A rate of change measured at a point."}
    assert "G08" in errors_for(card)


def test_g08_rejects_empty_key_present_when_central_is_text():
    card = good_card()
    card["front"]["central"] = {"text": "A rate of change measured at a point."}
    card["front"]["variable_key"] = []
    assert "G08" in errors_for(card)


def test_g08_rejects_more_than_five_key_entries():
    card = good_card()
    card["front"]["variable_key"] = [
        {"symbol": "n", "meaning": "constant exponent"} for _ in range(6)]
    assert "G08" in errors_for(card)


def test_g08_rejects_overlong_meaning():
    card = good_card()
    card["front"]["variable_key"][1]["meaning"] = " ".join(["word"] * 9)
    assert "G08" in errors_for(card)


def test_latex_identifiers_finds_variables_and_operators():
    found = chk.latex_identifiers("\\frac{d}{dx}\\left(x^{n}\\right)=nx^{n-1}")
    assert {"d", "x", "n"} <= found


def test_latex_identifiers_ignores_universal_notation():
    found = chk.latex_identifiers("a+b=c\\cdot d")
    assert "\\cdot" not in found
    assert "\\left" not in found


def test_latex_identifiers_ignores_letters_inside_text():
    found = chk.latex_identifiers("\\text{slope} = m")
    assert found == {"m"}


def test_g09_rejects_an_undefined_symbol():
    card = good_card()
    card["front"]["variable_key"] = [
        {"symbol": "n", "meaning": "constant exponent"}]  # x and d/dx undefined
    assert "G09" in errors_for(card)


def test_g09_rejects_a_key_symbol_absent_from_the_formula():
    card = good_card()
    card["front"]["variable_key"][2] = {"symbol": "y", "meaning": "output value"}
    assert "G09" in errors_for(card)


def test_g10_rejects_a_back_symbol_never_introduced():
    card = good_card()
    card["back"]["rows"][0]["segments"] = [
        {"t": "math", "latex": "k=5"}]  # k appears nowhere on the front
    assert "G10" in errors_for(card)


def test_g10_accepts_a_symbol_introduced_by_the_problem_line():
    """f is introduced in back.problem, not in the variable key."""
    assert "G10" not in errors_for(good_card())


def test_g11_rejects_unicode_superscript_in_prose():
    card = good_card()
    card["back"]["problem"][0]["v"] = "Differentiate x⁵ "
    assert "G11" in errors_for(card)


def test_g11_rejects_unicode_superscript_in_the_concept_name():
    """concept is prose too: it becomes concept.name in MySQL."""
    card = good_card()
    card["concept"] = "Powers of x²"
    assert "G11" in errors_for(card)


def test_g11_rejects_unicode_minus_in_prose():
    card = good_card()
    card["front"]["main_description"] = "Powers can be −2 or larger."
    assert "G11" in errors_for(card)


def test_g11_allows_caret_and_underscore_inside_latex():
    """LaTeX uses ^ and _ normally. The ban covers prose only."""
    assert "G11" not in errors_for(good_card())


def test_g12_rejects_unbalanced_braces():
    card = good_card()
    card["front"]["central"] = {"latex": "\\frac{d}{dx"}
    assert "G12" in errors_for(card)


def test_g12_rejects_an_empty_latex_string():
    card = good_card()
    card["back"]["rows"][0]["segments"] = [{"t": "math", "latex": "   "}]
    assert "G12" in errors_for(card)


# Fix round 1 (quality review, three defects in the brief's own code):
# FIX 1 (Critical): G09's reverse direction used raw substring matching
# instead of tokenized identifiers, so an undefined symbol could hide inside
# the spelling of an unrelated key entry. FIX 2 (Minor): \mathrm{...} and
# \operatorname{...} were stripped exactly like \text{...}, so multi-letter
# symbols such as PV/FV/NPV were invisible to latex_identifiers in both
# directions. FIX 3 (Minor): G12's brace-escape check only looked one
# character back, misjudging braces preceded by an even number of backslashes.

def test_g09_reverse_direction_uses_tokenized_identifiers_not_substrings():
    """FIX 1. Before the fix, a bare 'a' in the formula was treated as
    "covered" merely because the letter 'a' is a substring of the key
    symbol's own spelling ('a' inside "\\frac{d}{dx}", from \\frac itself),
    even though \\frac is a universal macro and defines nothing. The reverse
    direction must compare against the key symbols' TOKENIZED identifiers,
    not do a raw substring search."""
    card = good_card()
    card["front"]["central"]["latex"] = \
        "\\frac{d}{dx}\\left(x^{n}\\right)=nx^{n-1}+a"
    errs = errors_for(card)
    assert "G09" in errs


def test_latex_identifiers_keeps_mathrm_and_operatorname_as_one_token():
    """FIX 2. \\mathrm{...} and \\operatorname{...} name one multi-letter
    symbol (PV, NPV, ...); they must not be stripped like \\text{...}, and
    their contents must not be tokenized into separate bare letters."""
    found = chk.latex_identifiers("\\mathrm{PV}=\\operatorname{NPV}(r)")
    assert "\\mathrm{PV}" in found
    assert "\\operatorname{NPV}" in found
    assert "P" not in found and "V" not in found and "N" not in found


def test_g12_treats_an_even_backslash_run_as_a_real_unescaped_brace():
    """FIX 3. "\\\\{a" is a LaTeX linebreak (\\\\, two literal backslashes)
    followed by a genuinely unescaped, unmatched brace, not an escaped
    brace. Only an ODD run of backslashes escapes the brace that follows."""
    card = good_card()
    card["front"]["central"] = {"latex": "\\\\{a"}
    assert "G12" in errors_for(card)


def test_sanity_frac_key_still_covers_d_and_x():
    """Sanity check 1 from the fix-round instructions."""
    found = chk.latex_identifiers("\\frac{d}{dx}")
    assert found == {"d", "x"}


def test_sanity_good_card_central_still_produces_zero_g09_errors():
    """Sanity check 2: good_card()'s own central/key pairing, unchanged,
    must still produce zero G09 errors after both fixes."""
    assert "G09" not in errors_for(good_card())


def test_sanity_integral_notation_key_symbols_produce_zero_g09_errors():
    """Sanity check 3: \\int_{a}^{b} f(x)\\,dx with key symbols
    \\int_{a}^{b}, a, b, f(x), dx must produce zero G09 errors."""
    card = good_card()
    card["front"]["central"] = {"latex": "\\int_{a}^{b} f(x)\\,dx"}
    card["front"]["variable_key"] = [
        {"symbol": "\\int_{a}^{b}", "meaning": "definite integral from a to b"},
        {"symbol": "a", "meaning": "lower bound"},
        {"symbol": "b", "meaning": "upper bound"},
        {"symbol": "f(x)", "meaning": "integrand"},
        {"symbol": "dx", "meaning": "differential of x"},
    ]
    assert "G09" not in errors_for(card)


def test_sanity_mathrm_pv_only_fires_g09_for_v_and_r():
    """Sanity check 4: central \\mathrm{PV}=V\\cdot r with key symbol
    \\mathrm{PV} only must FIRE G09 for the undefined V and r, not just
    avoid raising an exception."""
    card = good_card()
    card["front"]["central"] = {"latex": "\\mathrm{PV}=V\\cdot r"}
    card["front"]["variable_key"] = [
        {"symbol": "\\mathrm{PV}", "meaning": "present value"},
    ]
    result = chk.check_card(card)
    g09_lines = [line for line in result if line.startswith("ERROR G09:")]
    assert any("'V'" in line for line in g09_lines), g09_lines
    assert any("'r'" in line for line in g09_lines), g09_lines


FIXTURES = Path(__file__).resolve().parent / "fixtures" / "flashcard_json"


def run_cli(*paths):
    # Fix round 2: encoding and errors are pinned, not left to the platform
    # locale. text=True alone decodes the child's stdout with the parent's
    # preferred encoding, so a shell exporting PYTHONIOENCODING=utf-8 made the
    # child emit UTF-8 while the parent decoded cp1252, and the G11 fixture's
    # superscript character crashed the test (measured: 1 failed, 80 passed,
    # green again only after clearing the variable). The suite must not depend
    # on an environment variable. errors="replace" keeps a stray undecodable
    # byte from ever raising again; every assertion below matches ASCII
    # substrings such as "ERROR G11:", so a replacement character is harmless.
    done = subprocess.run(
        [sys.executable, str(REPO / "tools" / "check_flashcard_json.py")] +
        [str(p) for p in paths],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        cwd=str(REPO))
    return done.returncode, done.stdout


def test_g13_rejects_a_section_absent_from_the_corpus():
    card = good_card()
    card["source"]["section"] = "9.9"
    assert "G13" in errors_for(card)


def test_g13_rejects_an_out_of_range_objective_ordinal():
    card = good_card()
    card["source"]["lo_ordinal"] = 99
    assert "G13" in errors_for(card)


def test_g13_rejects_a_paraphrased_objective():
    """The exact failure mode that left 8 of 75 mappings as judgment calls."""
    card = good_card()
    card["source"]["lo_text"] = "State the power rule and some other rules."
    assert "G13" in errors_for(card)


def test_g13_requires_a_review_note_when_no_objective_fits():
    card = good_card()
    card["source"]["lo_ordinal"] = None
    card["source"]["lo_text"] = ""
    assert "G13" in errors_for(card)


def test_g13_accepts_a_flagged_unmapped_card():
    card = good_card()
    card["source"]["lo_ordinal"] = None
    card["source"]["lo_text"] = ""
    card["source"]["review_note"] = "No 3.3 objective covers this framing."
    assert "G13" not in errors_for(card)


def test_g14_rejects_a_blacklisted_footer_prefix():
    card = good_card()
    card["back"]["footer"] = "Tip: power down, exponent down one."
    assert "G14" in errors_for(card)


# Fix round 1 (quality review): two defects in the brief's own g13 code.
# CRITICAL: review_note is not in REQUIRED_SOURCE and is never type-checked
# by g01_shape, so a non-string value reached .strip() and crashed the
# process with exit 1, breaking the CLI's exit 0/2 contract on exactly the
# honest-gap path the brief singles out as important. IMPORTANT: bool
# subclasses int in Python, so lo_ordinal: true passed isinstance(ordinal,
# int) and the range check, silently accepted as ordinal 1.

def test_g13_review_note_wrong_type_never_crashes_and_fires():
    card = good_card()
    card["source"]["lo_ordinal"] = None
    card["source"]["lo_text"] = ""
    card["source"]["review_note"] = 12345
    result = chk.check_card(card)          # must not raise
    assert isinstance(result, list)
    assert "G13" in errors_for(card)


def test_g13_rejects_lo_ordinal_true_as_not_a_real_ordinal():
    card = good_card()
    card["source"]["lo_ordinal"] = True
    assert "G13" in errors_for(card)


def test_g13_null_ordinal_honest_gap_path_still_works():
    """lo_ordinal: null must still take the honest-gap path, unchanged."""
    card = good_card()
    card["source"]["lo_ordinal"] = None
    card["source"]["lo_text"] = ""
    card["source"]["review_note"] = "No 3.3 objective covers this framing."
    assert "G13" not in errors_for(card)


def test_g13_sweep_never_crashes_on_wrong_type_fields():
    """Broader sweep from the fix-round review: every JSON type g13's two
    card fields that g01_shape never type-checks (lo_ordinal, review_note)
    could receive must produce an ERROR line, never an exception."""
    for bad in ("1", 1.0, [1], {"n": 1}, True, False):
        card = good_card()
        card["source"]["lo_ordinal"] = bad
        result = chk.check_card(card)      # must not raise
        assert isinstance(result, list), bad
        assert "G13" in errors_for(card), bad

    for bad in (12345, 1.5, [], {}, True):
        card = good_card()
        card["source"]["lo_ordinal"] = None
        card["source"]["lo_text"] = ""
        card["source"]["review_note"] = bad
        result = chk.check_card(card)      # must not raise
        assert isinstance(result, list), bad
        assert "G13" in errors_for(card), bad


def test_cli_exits_0_on_the_valid_fixture():
    code, out = run_cli(FIXTURES / "valid_power_rule.json")
    assert code == 0, out


def test_cli_exits_2_and_names_the_gate_on_each_bad_fixture():
    for name, gate in (("bad_G05_three_rows.json", "G05"),
                       ("bad_G09_undefined_symbol.json", "G09"),
                       ("bad_G11_unicode_superscript.json", "G11"),
                       ("bad_G13_wrong_lo_text.json", "G13")):
        code, out = run_cli(FIXTURES / name)
        assert code == 2, "%s should fail: %s" % (name, out)
        assert "ERROR %s:" % gate in out, "%s: %s" % (name, out)


def test_cli_exits_2_on_unparseable_json(tmp_path):
    bad = tmp_path / "broken.json"
    bad.write_text("{not json", encoding="utf-8")
    code, out = run_cli(bad)
    assert code == 2
    assert "ERROR G01:" in out


def test_cli_exits_2_not_1_when_review_note_is_a_wrong_type(tmp_path):
    """Fix round 1 exit-contract regression: before the fix this crashed
    with an unhandled AttributeError and exit 1, never reaching exit 2."""
    card = good_card()
    card["source"]["lo_ordinal"] = None
    card["source"]["lo_text"] = ""
    card["source"]["review_note"] = 12345
    path = tmp_path / "bad_review_note.json"
    path.write_text(json.dumps(card), encoding="utf-8")
    code, out = run_cli(path)
    assert code == 2, out
    assert "ERROR G13:" in out


def test_every_gate_has_a_test():
    """A gate with no negative control is decoration."""
    source = (REPO / "tools" / "test_check_flashcard_json.py").read_text(
        encoding="utf-8")
    for n in range(1, 15):
        gate = "G%02d" % n
        assert '"%s" in errors_for' % gate in source or \
               'ERROR %s:' % gate in source, "%s has no test" % gate


import generate_card_schema as gen

SCHEMA_PATH = REPO / "flashcards_db" / "card_schema_v2.json"


def test_committed_schema_matches_its_generator():
    """Regenerate after any constant change, or this fails."""
    on_disk = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    assert on_disk == gen.build_schema()


def test_schema_budgets_track_the_validator_constants():
    schema = gen.build_schema()
    front = schema["properties"]["front"]["properties"]
    assert front["title"]["maxLength"] == chk.TITLE_MAX_CHARS
    back = schema["properties"]["back"]["properties"]
    assert back["rows"]["minItems"] == chk.ROWS_MIN
    assert back["rows"]["maxItems"] == chk.ROWS_MAX
    assert front["footer"]["const"] == chk.FRONT_FOOTER
    assert schema["properties"]["concept"]["maxLength"] == chk.CONCEPT_MAX_CHARS


def test_latex_environments_are_not_allowlisted_as_universal_notation():
    """The prompt bans \\begin{aligned} and friends outright, so the three
    environment macros must not sit in UNIVERSAL_MACROS pretending to be
    notation every student reads."""
    for macro in ("\\begin", "\\end", "\\aligned"):
        assert macro not in chk.UNIVERSAL_MACROS


# The artifacts on disk. 81 green tests on check_card() said nothing about
# what the repo actually ships: no test referenced the example cards or the
# prompt, which is the July 25 lesson (a green builder function proves
# nothing about its committed output) recurring one branch later.

EXAMPLES = REPO / "flashcard_examples_v2"
PROMPT_PATH = REPO / "prompts" / "flashcard_concept_card_prompt_v2.md"
PROMPT_EXAMPLE_MARKER = \
    "Here is one complete card that satisfies every rule in this prompt."


def test_committed_example_cards_pass_every_gate():
    paths = sorted(EXAMPLES.glob("*.json"))
    assert len(paths) == 3, "expected three example cards, found %s" % paths
    for path in paths:
        card = json.loads(path.read_text(encoding="utf-8"))
        assert chk.check_card(card) == [], path.name


def prompt_example_json():
    """The complete card embedded in the prompt, parsed.

    The prompt carries two JSON blocks: a skeleton with ... placeholders, and
    one complete card after the marker sentence. Only the second is parseable,
    so extraction anchors on that sentence.
    """
    text = PROMPT_PATH.read_text(encoding="utf-8")
    assert PROMPT_EXAMPLE_MARKER in text, "the prompt's example marker moved"
    body = text.split(PROMPT_EXAMPLE_MARKER, 1)[1].split("</output_contract>")[0]
    return json.loads(body[body.index("{"):body.rindex("}") + 1])


def test_prompt_embedded_example_passes_every_gate():
    """The one card every run of the prompt is told to copy the structure of.
    If it violates the contract, every generated card inherits the violation."""
    assert chk.check_card(prompt_example_json()) == []


def test_power_rule_fixture_and_example_stay_byte_identical():
    """flashcard_examples_v2/power_rule.json and the valid CLI fixture are the
    same file in two places, with nothing but this test coupling them."""
    assert (FIXTURES / "valid_power_rule.json").read_bytes() == \
           (EXAMPLES / "power_rule.json").read_bytes()


def test_schema_source_requires_review_note_when_lo_ordinal_null():
    """Fix round 1, finding 2: G13 requires review_note (and an empty
    lo_text) whenever lo_ordinal is null. Pin that the schema expresses
    that conditional via if/then instead of silently omitting it."""
    schema = gen.build_schema()
    source = schema["properties"]["source"]
    assert source["if"]["properties"]["lo_ordinal"]["const"] is None
    assert "review_note" in source["then"]["required"]
    assert source["then"]["properties"]["review_note"]["minLength"] == 1
    assert source["then"]["properties"]["lo_text"]["maxLength"] == 0
