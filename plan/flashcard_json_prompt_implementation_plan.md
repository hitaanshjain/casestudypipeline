# Flashcard JSON Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `.pptx`-generating flashcard prompt with a content-only
prompt that emits validated JSON, so every rule the old prompt could not enforce
becomes either a mechanical gate or deterministic renderer code.

**Architecture:** The prompt emits one JSON document per card. A stdlib-only
validator (`tools/check_flashcard_json.py`) enforces 14 gates and is the single
source of truth for the contract; the JSON Schema file is generated from it and
drift-tested. `tools/render_flashcards.py` gains a v2 branch and owns all
geometry, palette, and typography.

**Tech Stack:** Python 3.13 stdlib only (no jsonschema, no python-pptx: neither
is installed and the repo's existing tools are stdlib-only), pytest 9.0.2 for
tests, MathJax from CDN inside the generated HTML preview.

## Global Constraints

- Spec: `plan/flashcard_json_prompt_design.md`. Any deviation gets logged in
  CLAUDE.md sec 9 per operating rule 3.
- Stdlib only. `jsonschema` and `python-pptx` are NOT installed; do not add
  dependencies.
- Contract strings are byte-exact and written once as module constants:
  `Flip for a worked example`, `Worked Example`.
- Error line format, exactly: `ERROR <gate_id>: <message>` on stdout, one per
  line. Exit 0 = all gates passed. Exit 2 = at least one failed.
- `book_tag` for the current corpus is `openstax_calc1`. Sections are matched on
  the `number` key in `references/openstax_calculus_v1/book_map.json`.
- Row count is 4 to 6, never exactly 6. Row 6 of the old prompt is dead.
- No em dashes in any prose written for this project.
- Commit after every task, one-line message, no trailers.
- `tools/` is gitignored except for explicitly tracked files: every new file
  under `tools/` needs `git add -f`. Do NOT edit `.gitignore`'s `tools/` line
  (see the July 25 incident in CLAUDE.md sec 9).

---

### Task 1: Validator skeleton and the copy gates (G01 to G04)

**Files:**
- Create: `tools/check_flashcard_json.py`
- Create: `tools/test_check_flashcard_json.py`

**Interfaces:**
- Consumes: nothing.
- Produces: `check_card(card: dict) -> list[str]` returning error lines;
  `good_card() -> dict` test fixture factory in the test module; constants
  `FRONT_FOOTER`, `BACK_TITLE`, `TITLE_MAX_CHARS`, `ROWS_MIN`, `ROWS_MAX`.

- [ ] **Step 1: Write the failing tests**

Create `tools/test_check_flashcard_json.py`:

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: collection error, `ModuleNotFoundError: No module named 'check_flashcard_json'`.

- [ ] **Step 3: Write the validator with G01 to G04**

Create `tools/check_flashcard_json.py`:

```python
"""Validate flashcard card JSON (format_version 2) against the v2 contract.

This module is the single source of truth for the contract. The JSON Schema in
flashcards_db/card_schema_v2.json is generated from these constants and
drift-tested, so edit here, never there.

Spec: plan/flashcard_json_prompt_design.md
Run from repo root:  python tools/check_flashcard_json.py card.json [more.json]
Exit 0 = every gate passed. Exit 2 = at least one gate failed.
"""
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BOOK_MAPS = REPO / "references"

FORMAT_VERSION = 2
FRONT_FOOTER = "Flip for a worked example"
BACK_TITLE = "Worked Example"
CARD_TYPES = ("concept_example", "problem_solution")

TITLE_MAX_CHARS = 24
SUBTITLE_MIN_WORDS, SUBTITLE_MAX_WORDS = 2, 4
MAIN_MAX_WORDS = 14
SUPPORTING_MAX_WORDS = 17
PROBLEM_MAX_WORDS = 14
BACK_FOOTER_MAX_WORDS = 12
CENTRAL_TEXT_MAX_WORDS = 24
KEY_MEANING_MAX_WORDS = 8
KEY_MAX_ENTRIES = 5          # replaces the old "at most two visual lines" rule
ROWS_MIN, ROWS_MAX = 4, 6

BANNED_FOOTER_PREFIXES = ("Tip:", "Remember:", "Shortcut:", "Note:", "Key idea:")

REQUIRED_TOP = ("format_version", "card_type", "concept", "source", "front", "back")
REQUIRED_SOURCE = ("book_tag", "section", "lo_ordinal", "lo_text")
REQUIRED_FRONT = ("title", "subtitle", "central", "main_description",
                  "supporting_description", "footer")
REQUIRED_BACK = ("title", "problem", "rows", "footer")


def words(text):
    return len(text.split())


def _err(errors, gate, message):
    errors.append("ERROR %s: %s" % (gate, message))


def g01_shape(card, errors):
    """Structure, required keys, closed vocabularies."""
    if not isinstance(card, dict):
        _err(errors, "G01", "top level is %s, expected an object"
             % type(card).__name__)
        return False
    for key in REQUIRED_TOP:
        if key not in card:
            _err(errors, "G01", "missing required key %r" % key)
    if card.get("format_version") != FORMAT_VERSION:
        _err(errors, "G01", "format_version is %r, contract requires %d"
             % (card.get("format_version"), FORMAT_VERSION))
    if card.get("card_type") not in CARD_TYPES:
        _err(errors, "G01", "card_type %r is outside the closed vocabulary %s"
             % (card.get("card_type"), list(CARD_TYPES)))
    for section, required in (("source", REQUIRED_SOURCE),
                              ("front", REQUIRED_FRONT),
                              ("back", REQUIRED_BACK)):
        block = card.get(section)
        if not isinstance(block, dict):
            _err(errors, "G01", "%s is missing or not an object" % section)
            continue
        for key in required:
            if key not in block:
                _err(errors, "G01", "missing required key %s.%s" % (section, key))
    central = card.get("front", {}).get("central")
    if isinstance(central, dict) and ("latex" in central) == ("text" in central):
        _err(errors, "G01",
             "front.central needs exactly one of 'latex' or 'text'")
    return not errors


def g02_contract_strings(card, errors):
    front_footer = card["front"].get("footer")
    if front_footer != FRONT_FOOTER:
        _err(errors, "G02", "front.footer is %r, contract requires %r"
             % (front_footer, FRONT_FOOTER))
    back_title = card["back"].get("title")
    if back_title != BACK_TITLE:
        _err(errors, "G02", "back.title is %r, contract requires %r"
             % (back_title, BACK_TITLE))


def g03_word_budgets(card, errors):
    front, back = card["front"], card["back"]
    n = words(front.get("subtitle", ""))
    if not SUBTITLE_MIN_WORDS <= n <= SUBTITLE_MAX_WORDS:
        _err(errors, "G03", "front.subtitle has %d words, contract requires %d to %d"
             % (n, SUBTITLE_MIN_WORDS, SUBTITLE_MAX_WORDS))
    for field, cap in (("main_description", MAIN_MAX_WORDS),
                       ("supporting_description", SUPPORTING_MAX_WORDS)):
        n = words(front.get(field, ""))
        if n > cap:
            _err(errors, "G03", "front.%s has %d words, cap is %d"
                 % (field, n, cap))
    n = sum(words(s.get("v", "")) for s in back.get("problem", [])
            if s.get("t") == "text")
    if n > PROBLEM_MAX_WORDS:
        _err(errors, "G03", "back.problem has %d prose words, cap is %d"
             % (n, PROBLEM_MAX_WORDS))
    n = words(back.get("footer", ""))
    if n > BACK_FOOTER_MAX_WORDS:
        _err(errors, "G03", "back.footer has %d words, cap is %d"
             % (n, BACK_FOOTER_MAX_WORDS))
    central = front.get("central", {})
    if "text" in central and words(central["text"]) > CENTRAL_TEXT_MAX_WORDS:
        _err(errors, "G03", "front.central.text has %d words, cap is %d"
             % (words(central["text"]), CENTRAL_TEXT_MAX_WORDS))


def g04_title_length(card, errors):
    title = card["front"].get("title", "")
    if not 1 <= len(title) <= TITLE_MAX_CHARS:
        _err(errors, "G04", "front.title is %d characters, cap is %d"
             % (len(title), TITLE_MAX_CHARS))


GATES = [g02_contract_strings, g03_word_budgets, g04_title_length]


def check_card(card):
    """Every error line for one card. Empty list means it passed."""
    errors = []
    if not g01_shape(card, errors):
        return errors          # later gates assume the shape holds
    for gate in GATES:
        gate(card, errors)
    return errors
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 9 passed.

- [ ] **Step 5: Make G01 type-aware, not just presence-aware**

**Amendment, July 28, from the Task 1 review.** The Step 3 code above checks
that required keys are *present* and never that their values have the right
*type*. A validator whose entire job is gating untrusted LLM output must not
crash on that output. Three reproductions found in review:

- `card["front"] = None` raises `AttributeError` inside `g01_shape` itself, at
  `card.get("front", {}).get("central")`. The `{}` default only fires when the
  key is absent, not when it is present and null, so the "front is not an
  object" error that was already queued never reaches the caller.
- `card["front"]["main_description"] = None` passes `g01_shape`, then crashes
  `g03_word_budgets` at `words(None)`.
- `card["back"]["problem"] = {"t": "text", "v": "hi"}` passes `g01_shape`, then
  crashes `g03_word_budgets`, because iterating a dict yields string keys.

`g01_shape` must emit an `ERROR G01:` line and return False, never raise, for
any of: `source` / `front` / `back` / `front.central` present but not a dict;
`front.variable_key` / `back.problem` / `back.rows` present but not a list;
`concept`, `source.book_tag`, `source.section`, `source.lo_text`,
`front.title`, `front.subtitle`, `front.main_description`,
`front.supporting_description`, `front.footer`, `back.title`, `back.footer`
present but not a string. Guard the `central` one-of check so it runs only when
both `front` and `central` are dicts.

Tests must cover all three reproductions plus at least two more wrong-type
cases, each asserting both that `check_card` does not raise and that G01 fires,
plus one test that walks several nested paths setting each to `None` in turn and
asserts a list comes back every time.

This same presence-only pattern would otherwise recur in Tasks 2 to 4; because
G01 now returns False on a type error, the later gates keep their "assume the
shape holds" contract honestly.

- [ ] **Step 6: Commit**

```bash
git add -f tools/check_flashcard_json.py tools/test_check_flashcard_json.py
git commit -m "Add the flashcard JSON validator with its shape, contract string, budget, and title gates"
```

---

### Task 2: Structural gates (G05 to G08)

**Files:**
- Modify: `tools/check_flashcard_json.py`
- Modify: `tools/test_check_flashcard_json.py`

**Interfaces:**
- Consumes: `check_card`, `good_card`, `errors_for` from Task 1.
- Produces: gate functions `g05_row_count`, `g06_bold_row`, `g07_aligned_rows`,
  `g08_variable_key_presence`, all appended to `GATES`.

**Amendment, July 28, carried from the Task 1 re-review.** Task 1's G01 now
type-checks containers but not their contents, and four crash inputs survive:

- `back.problem = [{"t": "text", "v": "hi"}, "raw string"]` raises in
  `g03_word_budgets` at `s.get("t")`
- `back.problem = [None]` or `[1, 2, 3]` raises the same way
- `back.problem = [{"t": "text", "v": 123}]` raises at `words(...)`
- `front.central = {"text": 123}` or `{"text": None}` raises at `words(...)`

This task iterates rows and segments, so it must close them. Extend
`g01_shape` to also validate, emitting `ERROR G01:` and returning False rather
than raising: every element of `back.problem` and of each `row["segments"]` is
a dict; each segment's `t` is `"text"` or `"math"`; a text segment's `v` and a
math segment's `latex` are strings; each element of `back.rows` is a dict; each
element of `front.variable_key` is a dict whose `symbol` and `meaning` are
strings; and `front.central.text` / `front.central.latex`, when present, are
strings. Add a test per input above, each asserting both that `check_card`
returns a list and that G01 fires.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test_check_flashcard_json.py`:

```python
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


def test_g06_rejects_bold_on_a_middle_row():
    card = good_card()
    card["back"]["rows"][0]["bold"] = True
    assert "G06" in errors_for(card)


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


def test_g08_rejects_missing_key_when_central_is_latex():
    card = good_card()
    del card["front"]["variable_key"]
    assert "G08" in errors_for(card)


def test_g08_rejects_key_present_when_central_is_text():
    card = good_card()
    card["front"]["central"] = {"text": "A rate of change measured at a point."}
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 12 failed (the new ones), 9 passed.

- [ ] **Step 3: Write the gates**

Insert into `tools/check_flashcard_json.py` above the `GATES` list:

```python
def g05_row_count(card, errors):
    n = len(card["back"].get("rows", []))
    if not ROWS_MIN <= n <= ROWS_MAX:
        _err(errors, "G05", "back.rows has %d rows, contract requires %d to %d"
             % (n, ROWS_MIN, ROWS_MAX))


def g06_bold_row(card, errors):
    rows = card["back"].get("rows", [])
    bold = [i for i, row in enumerate(rows) if row.get("bold")]
    if len(bold) != 1:
        _err(errors, "G06", "%d rows are bold, contract requires exactly 1"
             % len(bold))
    elif bold[0] != len(rows) - 1:
        _err(errors, "G06", "row %d is bold, the bold row must be the last (row %d)"
             % (bold[0] + 1, len(rows)))


def g07_aligned_rows(card, errors):
    rows = card["back"].get("rows", [])
    flags = [bool(row.get("aligned")) for row in rows]
    if not any(flags):
        return                                  # zero aligned rows is valid
    first = flags.index(True)
    if not all(flags[first:]):
        _err(errors, "G07", "aligned rows are not contiguous: %s"
             % "".join("A" if f else "." for f in flags))
    if flags and not flags[-1]:
        _err(errors, "G07",
             "the aligned block must run to the last row, but row %d is not aligned"
             % len(flags))
```

**Amendment, July 28, from the Task 2 review.** The `g07_aligned_rows` body
above is WRONG and must not be transcribed as written. `not all(flags[first:])`
is true both when there is an interior gap and whenever the block merely ends
early, so the pattern `[T,T,F,F]` fires two error lines, and the first one says
"aligned rows are not contiguous" about rows that are perfectly contiguous.
Since the generating model reads these lines to correct itself, a message that
misdescribes the problem is worse than no message.

Required: exactly one G07 line per underlying problem, describing the real one.
Interior gap (`[T,F,T,T]`) reports non-contiguity; contiguous but ending early
(`[T,T,F,F]`) reports only the reach-the-last-row problem; both at once emits
one line, not two. Test all five of `[F,F,T,T]`, `[T,F,T,T]`, `[T,T,F,F]`,
`[F,F,F,F]`, `[T,T,T,T]` by COUNTING G07 lines, not by set membership: the
`errors_for` helper collapses duplicates and cannot catch a double fire.

Two more defects the same review found, both to fix here:

- `test_g06_rejects_bold_on_a_middle_row` does not test its own name. The
  fixture's last row is already bold, so setting row 0 bold creates two bold
  rows and trips the count branch, leaving the position branch untested. The
  test must set bold on row 0 AND clear it on the last row.
- G08 lets `"variable_key": []` through when `central` is text. The contract is
  present iff latex, so a present-but-empty key on the text side must fire.

```python


def g08_variable_key_presence(card, errors):
    front = card["front"]
    central = front.get("central", {})
    key = front.get("variable_key")
    if "latex" in central:
        if not key:
            _err(errors, "G08",
                 "front.central is latex, so variable_key is required and non-empty")
            return
    else:
        if key:
            _err(errors, "G08",
                 "front.central is text, so variable_key must be absent")
        return
    if len(key) > KEY_MAX_ENTRIES:
        _err(errors, "G08", "variable_key has %d entries, cap is %d"
             % (len(key), KEY_MAX_ENTRIES))
    seen = set()
    for entry in key:
        symbol = entry.get("symbol", "")
        if symbol in seen:
            _err(errors, "G08", "variable_key defines %r more than once" % symbol)
        seen.add(symbol)
        if words(entry.get("meaning", "")) > KEY_MEANING_MAX_WORDS:
            _err(errors, "G08", "variable_key meaning for %r has %d words, cap is %d"
                 % (symbol, words(entry.get("meaning", "")), KEY_MEANING_MAX_WORDS))
```

Then replace the `GATES` list with:

```python
GATES = [g02_contract_strings, g03_word_budgets, g04_title_length,
         g05_row_count, g06_bold_row, g07_aligned_rows,
         g08_variable_key_presence]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 21 passed.

- [ ] **Step 5: Commit**

```bash
git add -f tools/check_flashcard_json.py tools/test_check_flashcard_json.py
git commit -m "Add the flashcard JSON structural gates for row count, bold row, alignment, and variable key"
```

---

### Task 3: Notation gates (G09 to G12)

**Files:**
- Modify: `tools/check_flashcard_json.py`
- Modify: `tools/test_check_flashcard_json.py`

**Interfaces:**
- Consumes: everything from Tasks 1 and 2.
- Produces: `latex_identifiers(latex: str) -> set[str]`, and gates
  `g09_symbol_coverage`, `g10_notation_consistency`, `g11_unicode_ban`,
  `g12_latex_sanity`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test_check_flashcard_json.py`:

```python
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
    card["back"]["problem"][0]["v"] = "Differentiate x\u2075 "
    assert "G11" in errors_for(card)


def test_g11_rejects_unicode_minus_in_prose():
    card = good_card()
    card["front"]["main_description"] = "Powers can be \u22122 or larger."
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 12 failed, 21 passed.

- [ ] **Step 3: Write the gates**

Insert into `tools/check_flashcard_json.py` above the `GATES` list:

```python
# Notation every student already reads, so it is never required in the key.
UNIVERSAL_MACROS = frozenset({
    "\\cdot", "\\times", "\\div", "\\pm", "\\mp", "\\frac", "\\left", "\\right",
    "\\big", "\\Big", "\\bigg", "\\Bigg", "\\quad", "\\qquad", "\\,", "\\;",
    "\\text", "\\mathrm", "\\displaystyle", "\\boldsymbol", "\\bm", "\\sqrt",
    "\\begin", "\\end", "\\aligned", "\\approx", "\\neq", "\\leq", "\\geq",
    "\\to", "\\infty", "\\ldots", "\\cdots", "\\sin", "\\cos", "\\tan",
    "\\sec", "\\csc", "\\cot", "\\log", "\\ln", "\\exp",
})
TEXT_GROUP_RE = re.compile(r"\\(?:text|mathrm|operatorname)\{[^{}]*\}")
TOKEN_RE = re.compile(r"\\[a-zA-Z]+|[A-Za-z]")
UNICODE_MATH_RE = re.compile(
    "[\u2070-\u209f\u00b2\u00b3\u00b9\u2212\u00d7\u00f7]|\\^")

# Fields whose value is prose the student reads as words, not as mathematics.
PROSE_FIELDS = (("front", "title"), ("front", "subtitle"),
                ("front", "main_description"), ("front", "supporting_description"),
                ("front", "footer"), ("back", "title"), ("back", "footer"))


def latex_identifiers(latex):
    """Definable identifiers in a LaTeX string.

    Single letters and topic-specific macros count. Universal notation and any
    letters inside \\text{...} do not: those are words, not variables.
    """
    stripped = TEXT_GROUP_RE.sub(" ", latex)
    found = set()
    for token in TOKEN_RE.findall(stripped):
        if token.startswith("\\") and token in UNIVERSAL_MACROS:
            continue
        found.add(token)
    return found


def _all_latex(node):
    """Every latex string anywhere inside a front or back block."""
    out = []
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "latex" and isinstance(value, str):
                out.append(value)
            else:
                out.extend(_all_latex(value))
    elif isinstance(node, list):
        for item in node:
            out.extend(_all_latex(item))
    return out


def g09_symbol_coverage(card, errors):
    """Every symbol in the central formula is defined exactly once, and back."""
    front = card["front"]
    central = front.get("central", {})
    if "latex" not in central:
        return
    key = front.get("variable_key") or []
    symbols = [entry.get("symbol", "") for entry in key]
    formula = central["latex"]
    for symbol in symbols:
        if symbol and symbol not in formula:
            _err(errors, "G09",
                 "variable_key defines %r, which does not appear in front.central"
                 % symbol)
    for ident in sorted(latex_identifiers(formula)):
        if not any(ident in symbol for symbol in symbols):
            _err(errors, "G09",
                 "%r appears in front.central but no variable_key entry covers it"
                 % ident)


def g10_notation_consistency(card, errors):
    """Nothing appears on the back that the front or an earlier row never named."""
    front, back = card["front"], card["back"]
    known = set()
    central = front.get("central", {})
    if "latex" in central:
        known |= latex_identifiers(central["latex"])
    for entry in front.get("variable_key") or []:
        known |= latex_identifiers(entry.get("symbol", ""))
    for latex in _all_latex(back.get("problem", [])):
        known |= latex_identifiers(latex)
    for i, row in enumerate(back.get("rows", []), 1):
        used = set()
        for latex in _all_latex(row):
            used |= latex_identifiers(latex)
        for ident in sorted(used - known):
            _err(errors, "G10",
                 "back row %d uses %r, which the front and earlier rows never introduce"
                 % (i, ident))
        known |= used                    # a row may introduce for later rows


def g11_unicode_ban(card, errors):
    """No Unicode superscript, subscript, minus, or caret in prose."""
    def scan(where, text):
        hit = UNICODE_MATH_RE.search(text or "")
        if hit:
            _err(errors, "G11",
                 "%s contains %r, which belongs in a latex segment"
                 % (where, hit.group(0)))
    for block, field in PROSE_FIELDS:
        scan("%s.%s" % (block, field), card[block].get(field, ""))
    for entry in card["front"].get("variable_key") or []:
        scan("variable_key meaning", entry.get("meaning", ""))
    central = card["front"].get("central", {})
    if "text" in central:
        scan("front.central.text", central["text"])
    for i, segment in enumerate(card["back"].get("problem", []), 1):
        if segment.get("t") == "text":
            scan("back.problem segment %d" % i, segment.get("v", ""))
    for r, row in enumerate(card["back"].get("rows", []), 1):
        for i, segment in enumerate(row.get("segments", []), 1):
            if segment.get("t") == "text":
                scan("back row %d segment %d" % (r, i), segment.get("v", ""))


def g12_latex_sanity(card, errors):
    """Structural sanity only: a full parse needs KaTeX, which is not installed."""
    for latex in _all_latex(card["front"]) + _all_latex(card["back"]):
        if not latex.strip():
            _err(errors, "G12", "empty latex string")
            continue
        depth = 0
        for i, ch in enumerate(latex):
            if ch == "{" and (i == 0 or latex[i - 1] != "\\"):
                depth += 1
            elif ch == "}" and (i == 0 or latex[i - 1] != "\\"):
                depth -= 1
            if depth < 0:
                break
        if depth != 0:
            _err(errors, "G12", "unbalanced braces in latex %r" % latex)
```

Replace the `GATES` list with:

```python
GATES = [g02_contract_strings, g03_word_budgets, g04_title_length,
         g05_row_count, g06_bold_row, g07_aligned_rows,
         g08_variable_key_presence, g09_symbol_coverage,
         g10_notation_consistency, g11_unicode_ban, g12_latex_sanity]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 33 passed.

If `test_g10_accepts_a_symbol_introduced_by_the_problem_line` fails, the cause
is `f'(x)`: the prime is not matched by `TOKEN_RE`, so only `f` and `x` are
extracted, and both come from `back.problem`. Do not loosen G10 to fix a
different failure; re-read which identifier the message names first.

- [ ] **Step 5: Commit**

```bash
git add -f tools/check_flashcard_json.py tools/test_check_flashcard_json.py
git commit -m "Add the flashcard JSON notation gates for symbol coverage, consistency, Unicode, and LaTeX sanity"
```

---

### Task 4: Corpus gate, CLI, and the negative fixture suite

**Files:**
- Modify: `tools/check_flashcard_json.py`
- Modify: `tools/test_check_flashcard_json.py`
- Create: `tools/fixtures/flashcard_json/valid_power_rule.json`
- Create: `tools/fixtures/flashcard_json/bad_G05_three_rows.json`
- Create: `tools/fixtures/flashcard_json/bad_G09_undefined_symbol.json`
- Create: `tools/fixtures/flashcard_json/bad_G11_unicode_superscript.json`
- Create: `tools/fixtures/flashcard_json/bad_G13_wrong_lo_text.json`

**Interfaces:**
- Consumes: everything from Tasks 1 to 3.
- Produces: `g13_corpus_mapping`, `g14_footer_prefix`, `main()`, and a CLI with
  the exit 0/2 contract.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test_check_flashcard_json.py`:

```python
FIXTURES = Path(__file__).resolve().parent / "fixtures" / "flashcard_json"


def run_cli(*paths):
    done = subprocess.run(
        [sys.executable, str(REPO / "tools" / "check_flashcard_json.py")] +
        [str(p) for p in paths],
        capture_output=True, text=True, cwd=str(REPO))
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


def test_every_gate_has_a_test():
    """A gate with no negative control is decoration."""
    source = (REPO / "tools" / "test_check_flashcard_json.py").read_text(
        encoding="utf-8")
    for n in range(1, 15):
        gate = "G%02d" % n
        assert '"%s" in errors_for' % gate in source or \
               'ERROR %s:' % gate in source, "%s has no test" % gate
```

- [ ] **Step 2: Create the fixtures**

Write `tools/fixtures/flashcard_json/valid_power_rule.json` with exactly the
dict returned by `good_card()` in Task 1, serialised as JSON with 2-space
indent. Then create each bad fixture as a copy with one field changed:

- `bad_G05_three_rows.json`: `back.rows` truncated to its first 3 entries, and
  `bold` set to `true` on the new last row so only G05 fires.
- `bad_G09_undefined_symbol.json`: `front.variable_key` reduced to the single
  entry `{"symbol": "n", "meaning": "constant exponent"}`.
- `bad_G11_unicode_superscript.json`: `back.problem[0].v` set to
  `"Differentiate x\u2075 "`.
- `bad_G13_wrong_lo_text.json`: `source.lo_text` set to
  `"State the power rule and some other rules."`.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 10 failed, 33 passed.

- [ ] **Step 4: Write the corpus gate, the footer gate, and the CLI**

Insert into `tools/check_flashcard_json.py` above the `GATES` list:

```python
_BOOK_MAP_CACHE = {}


def load_book_map(book_tag):
    """Section number -> section dict, for one book. Cached per process."""
    if book_tag not in _BOOK_MAP_CACHE:
        sections = None
        for path in sorted(BOOK_MAPS.glob("*/book_map.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            if data.get("book_tag") == book_tag:
                sections = {s["number"]: s for s in data["sections"]}
                break
        _BOOK_MAP_CACHE[book_tag] = sections
    return _BOOK_MAP_CACHE[book_tag]


def g13_corpus_mapping(card, errors):
    source = card["source"]
    sections = load_book_map(source.get("book_tag"))
    if sections is None:
        _err(errors, "G13", "no book_map.json under references/ has book_tag %r"
             % source.get("book_tag"))
        return
    section = sections.get(source.get("section"))
    if section is None:
        _err(errors, "G13", "section %r is not in the %s corpus"
             % (source.get("section"), source.get("book_tag")))
        return
    ordinal = source.get("lo_ordinal")
    if ordinal is None:
        if not (source.get("review_note") or "").strip():
            _err(errors, "G13",
                 "lo_ordinal is null, so source.review_note is required")
        if source.get("lo_text"):
            _err(errors, "G13", "lo_ordinal is null, so lo_text must be empty")
        return
    objectives = section.get("learning_objectives", [])
    if not isinstance(ordinal, int) or not 1 <= ordinal <= len(objectives):
        _err(errors, "G13", "lo_ordinal %r is out of range: section %s has %d objectives"
             % (ordinal, source.get("section"), len(objectives)))
        return
    expected = objectives[ordinal - 1]
    if source.get("lo_text") != expected:
        _err(errors, "G13",
             "lo_text does not match the corpus objective at %s ordinal %d.\n"
             "         corpus: %r\n         card:   %r"
             % (source.get("section"), ordinal, expected, source.get("lo_text")))


def g14_footer_prefix(card, errors):
    footer = card["back"].get("footer", "")
    for prefix in BANNED_FOOTER_PREFIXES:
        if footer.startswith(prefix):
            _err(errors, "G14", "back.footer starts with the banned prefix %r"
                 % prefix)
```

Extend the `GATES` list with `g13_corpus_mapping, g14_footer_prefix`, then
append the CLI at the end of the module:

```python
def main(argv):
    if not argv:
        print("usage: python tools/check_flashcard_json.py card.json [more.json]")
        return 2
    failed = False
    for arg in argv:
        path = Path(arg)
        try:
            card = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            print("%s" % path)
            print("  ERROR G01: cannot read as JSON: %s" % exc)
            failed = True
            continue
        errors = check_card(card)
        print("%s: %s" % (path, "PASS" if not errors else "FAIL"))
        for line in errors:
            print("  %s" % line)
        failed = failed or bool(errors)
    return 2 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: 43 passed.

- [ ] **Step 6: Prove the exit codes by hand**

```bash
python tools/check_flashcard_json.py tools/fixtures/flashcard_json/valid_power_rule.json; echo "exit=$?"
python tools/check_flashcard_json.py tools/fixtures/flashcard_json/bad_G13_wrong_lo_text.json; echo "exit=$?"
```
Expected: `PASS` then `exit=0`; then `FAIL`, an `ERROR G13:` line naming both
strings, and `exit=2`.

- [ ] **Step 7: Commit**

```bash
git add -f tools/check_flashcard_json.py tools/test_check_flashcard_json.py tools/fixtures/flashcard_json/
git commit -m "Add the flashcard JSON corpus gate, footer prefix gate, CLI, and negative fixtures"
```

---

### Task 5: Generate the JSON Schema from the validator

**Files:**
- Create: `tools/generate_card_schema.py`
- Create: `flashcards_db/card_schema_v2.json` (generated)
- Modify: `tools/test_check_flashcard_json.py`

**Interfaces:**
- Consumes: the constants from Task 1.
- Produces: `build_schema() -> dict` and a committed schema file that a drift
  test pins to it.

Rationale: `jsonschema` is not installed and the repo is stdlib-only, so the
validator, not the schema, is the enforcing artifact. The schema exists as
machine-readable documentation for Peter's production side. Generating it from
the validator's constants is the July 25 pattern (committed output must equal
its generator's output) and removes any chance of the two disagreeing.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test_check_flashcard_json.py`:

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_check_flashcard_json.py -q`
Expected: collection error, `ModuleNotFoundError: No module named 'generate_card_schema'`.

- [ ] **Step 3: Write the generator**

Create `tools/generate_card_schema.py`:

```python
"""Generate flashcards_db/card_schema_v2.json from the validator's constants.

The validator is the contract; this file publishes it in a portable form.
Run from repo root:  python tools/generate_card_schema.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_flashcard_json as chk

OUT = Path(__file__).resolve().parent.parent / "flashcards_db" / "card_schema_v2.json"

SEGMENT = {
    "type": "object",
    "oneOf": [
        {"required": ["t", "v"],
         "properties": {"t": {"const": "text"}, "v": {"type": "string"}},
         "additionalProperties": False},
        {"required": ["t", "latex"],
         "properties": {"t": {"const": "math"}, "latex": {"type": "string",
                                                          "minLength": 1}},
         "additionalProperties": False},
    ],
}


def build_schema():
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Flashcard card, format_version 2",
        "description": "Enforced by tools/check_flashcard_json.py, which is the "
                       "contract. This file is generated from it.",
        "type": "object",
        "required": list(chk.REQUIRED_TOP),
        "properties": {
            "format_version": {"const": chk.FORMAT_VERSION},
            "card_type": {"enum": list(chk.CARD_TYPES)},
            "concept": {"type": "string", "minLength": 1, "maxLength": 40},
            "source": {
                "type": "object",
                "required": list(chk.REQUIRED_SOURCE),
                "properties": {
                    "book_tag": {"type": "string"},
                    "section": {"type": "string"},
                    "lo_ordinal": {"type": ["integer", "null"], "minimum": 1},
                    "lo_text": {"type": "string"},
                    "review_note": {"type": "string"},
                },
            },
            "front": {
                "type": "object",
                "required": list(chk.REQUIRED_FRONT),
                "properties": {
                    "title": {"type": "string", "minLength": 1,
                              "maxLength": chk.TITLE_MAX_CHARS},
                    "subtitle": {"type": "string"},
                    "central": {
                        "type": "object",
                        "oneOf": [{"required": ["latex"]}, {"required": ["text"]}],
                        "properties": {"latex": {"type": "string"},
                                       "text": {"type": "string"}},
                    },
                    "variable_key": {
                        "type": "array",
                        "maxItems": chk.KEY_MAX_ENTRIES,
                        "items": {
                            "type": "object",
                            "required": ["symbol", "meaning"],
                            "properties": {"symbol": {"type": "string"},
                                           "meaning": {"type": "string"}},
                        },
                    },
                    "main_description": {"type": "string"},
                    "supporting_description": {"type": "string"},
                    "footer": {"const": chk.FRONT_FOOTER},
                },
            },
            "back": {
                "type": "object",
                "required": list(chk.REQUIRED_BACK),
                "properties": {
                    "title": {"const": chk.BACK_TITLE},
                    "problem": {"type": "array", "items": SEGMENT},
                    "rows": {
                        "type": "array",
                        "minItems": chk.ROWS_MIN,
                        "maxItems": chk.ROWS_MAX,
                        "items": {
                            "type": "object",
                            "required": ["segments", "aligned", "bold"],
                            "properties": {
                                "segments": {"type": "array", "items": SEGMENT,
                                             "minItems": 1},
                                "aligned": {"type": "boolean"},
                                "bold": {"type": "boolean"},
                            },
                        },
                    },
                    "footer": {"type": "string"},
                },
            },
        },
    }


def main():
    OUT.write_text(json.dumps(build_schema(), indent=2) + "\n",
                   encoding="utf-8", newline="\n")
    print("wrote %s" % OUT.relative_to(OUT.parent.parent))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Generate the schema and run the tests**

```bash
python tools/generate_card_schema.py
python -m pytest tools/test_check_flashcard_json.py -q
```
Expected: `wrote flashcards_db/card_schema_v2.json`, then 45 passed.

- [ ] **Step 5: Commit**

```bash
git add -f tools/generate_card_schema.py
git add flashcards_db/card_schema_v2.json
git commit -m "Generate the card JSON schema from the validator constants with a drift test"
```

---

### Task 6: The content-only prompt

**Files:**
- Create: `prompts/flashcard_concept_card_prompt_v2.md`

**Interfaces:**
- Consumes: the contract from Tasks 1 to 5.
- Produces: the prompt file. Its output is checked by
  `tools/check_flashcard_json.py`.

- [ ] **Step 1: Write the prompt**

Create `prompts/flashcard_concept_card_prompt_v2.md`. It starts at `<role>`
with no markdown title or lineage header (CLAUDE.md sec 11, July 7 rule).
Required sections, in order:

`<role>` one paragraph: author one two-sided concept flashcard for community
college students, emit JSON only.

`<input>` the required inputs `topic`, `book_tag`, `section`, and the optional
`source_notes`. State that `lo_ordinal`, `lo_text`, and every text field are the
model's job to derive from the named section.

`<output_contract>` the single hardest rule: output is **one JSON object and
nothing else**. No prose before or after, no markdown code fence, no commentary.
Include the full annotated example from the spec's section 3 verbatim.

`<field_rules>` every budget as a number, copied from the spec: title <= 24
characters, subtitle 2 to 4 words, main <= 14 words, supporting <= 17 words,
problem <= 14 prose words, back footer <= 12 words, variable_key <= 5 entries
with meanings <= 8 words, rows 4 to 6.

`<notation_rules>` all mathematics goes in `{"t":"math","latex":...}` segments;
prose segments never contain a Unicode superscript, subscript, minus, or caret;
every symbol in the central formula gets exactly one variable_key entry; nothing
on the back uses a symbol the front or an earlier row never introduced.

`<pedagogy>` what survives from the old prompt: the front's seven elements, the
worked example must demonstrate the exact front concept, every row carries real
reasoning, no filler rows, the last row is the complete conclusion, the footer
states the transferable idea and never opens with `Tip:`, `Remember:`,
`Shortcut:`, `Note:`, or `Key idea:`. Include the escape hatch: when the concept
will not work in 4 to 6 rows, choose a simpler representative example rather
than padding or compressing.

`<honest_gaps>` when no objective in the section fits, set `lo_ordinal` to null,
`lo_text` to the empty string, and write `review_note`. Never invent an
objective: `lo_text` is compared byte for byte against the corpus.

`<failure>` when a required input is missing or the section is not in the
corpus, output exactly one line, `ERROR input: <reason>`, and no JSON.

`<self_check>` a numbered list the model runs before emitting, one line per
validator gate G02 to G14, phrased as something countable.

Do NOT include: colours, fonts, point sizes, inches, borders, backgrounds,
slide dimensions, spacing, optical scale, file formats, or any instruction to
render or validate the output itself. The renderer owns all of it.

- [ ] **Step 2: Run the static checks**

```bash
python - <<'PY'
from pathlib import Path
p = Path("prompts/flashcard_concept_card_prompt_v2.md")
s = p.read_text(encoding="utf-8")
bad = [(i+1, l) for i, l in enumerate(s.splitlines())
       if any(ord(c) > 127 for c in l)]
print("non-ascii lines:", bad or "none")
for needed in ["Flip for a worked example", "Worked Example", "ERROR input:",
               "format_version", "lo_ordinal", "review_note"]:
    print(("OK   " if needed in s else "MISS "), needed)
print("starts at <role>:", s.lstrip().startswith("<role>"))
print("em dashes:", s.count("\u2014"))
PY
```
Expected: no non-ASCII lines, every required string OK, starts at `<role>`
true, 0 em dashes.

- [ ] **Step 3: Commit**

```bash
git add prompts/flashcard_concept_card_prompt_v2.md
git commit -m "Add the content-only flashcard prompt that emits validated card JSON"
```

---

### Task 7: The three example cards

**Files:**
- Create: `flashcard_examples_v2/power_rule.json`
- Create: `flashcard_examples_v2/intermediate_value.json`
- Create: `flashcard_examples_v2/definite_integral.json`
- Create: `flashcard_examples_v2/README.md`

**Interfaces:**
- Consumes: `tools/check_flashcard_json.py`.
- Produces: three validated cards used by Task 8's preview.

These three are chosen to exercise every branch of the contract: Power Rule has
a symbolic central formula and an aligned derivation; Intermediate Value has
`central.text` and no variable key and zero aligned rows; Definite Integral has
a notation-heavy key at the 5-entry cap and a non-derivation back.

- [ ] **Step 1: Write power_rule.json**

Identical to `tools/fixtures/flashcard_json/valid_power_rule.json`. Copy it.

- [ ] **Step 2: Write intermediate_value.json**

Section 2.4, ordinal 5. The objective text must be copied verbatim from
`references/openstax_calculus_v1/book_map.json`; at time of writing it is
`Provide an example of the intermediate value theorem.` Verify before writing.

```json
{
  "format_version": 2,
  "card_type": "concept_example",
  "concept": "Intermediate Value Theorem",
  "source": {
    "book_tag": "openstax_calc1",
    "section": "2.4",
    "lo_ordinal": 5,
    "lo_text": "Provide an example of the intermediate value theorem."
  },
  "front": {
    "title": "Intermediate Value",
    "subtitle": "No Skipped Values",
    "central": {"text": "A continuous function takes every value between its two endpoint values."},
    "main_description": "An unbroken graph must hit every height in between.",
    "supporting_description": "If the curve starts below a target and ends above it, it crossed.",
    "footer": "Flip for a worked example"
  },
  "back": {
    "title": "Worked Example",
    "problem": [{"t": "text", "v": "Is there a solution between 1 and 4?"}],
    "rows": [
      {"segments": [{"t": "text", "v": "The graph is continuous with no breaks."}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "At the left end the value is below zero."}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "At the right end the value is above zero."}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "Zero lies between those two heights."}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "A solution is guaranteed between 1 and 4."}],
       "aligned": false, "bold": true}
    ],
    "footer": "Continuity guarantees every in between value is reached."
  }
}
```

- [ ] **Step 3: Write definite_integral.json**

Section 5.2, ordinal 2. Verify the objective text against the book map first;
at time of writing it is `Explain the terms integrand, limits of integration,
and variable of integration.`

The central object is `\int_{a}^{b} f(x)\,dx`, deliberately not the Riemann sum
definition: the sum form needs `\lim`, `\sum`, `n`, `i`, `x_i^*` and `\Delta x`
defined, which cannot fit the 5-entry key cap. This is the spec's "choose an
equivalent formula with fewer symbols" escape hatch firing for real.

```json
{
  "format_version": 2,
  "card_type": "concept_example",
  "concept": "Definite Integral",
  "source": {
    "book_tag": "openstax_calc1",
    "section": "5.2",
    "lo_ordinal": 2,
    "lo_text": "Explain the terms integrand, limits of integration, and variable of integration."
  },
  "front": {
    "title": "Definite Integral",
    "subtitle": "Reading The Notation",
    "central": {"latex": "\\int_{a}^{b} f(x)\\,dx"},
    "variable_key": [
      {"symbol": "\\int_{a}^{b}", "meaning": "accumulate from a to b"},
      {"symbol": "a", "meaning": "lower limit of integration"},
      {"symbol": "b", "meaning": "upper limit of integration"},
      {"symbol": "f(x)", "meaning": "the integrand being accumulated"},
      {"symbol": "dx", "meaning": "variable of integration"}
    ],
    "main_description": "Every part of this symbol names one piece of the setup.",
    "supporting_description": "Reading it correctly tells you what accumulates and over which interval.",
    "footer": "Flip for a worked example"
  },
  "back": {
    "title": "Worked Example",
    "problem": [{"t": "text", "v": "Name each part of "},
                {"t": "math", "latex": "\\int_{1}^{4} 3x^{2}\\,dx"}],
    "rows": [
      {"segments": [{"t": "text", "v": "The integrand is"},
                    {"t": "math", "latex": "3x^{2}"}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "The limits of integration are"},
                    {"t": "math", "latex": "a=1"},
                    {"t": "text", "v": "and"},
                    {"t": "math", "latex": "b=4"}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "The variable of integration is"},
                    {"t": "math", "latex": "x"}],
       "aligned": false, "bold": false},
      {"segments": [{"t": "text", "v": "So this accumulates"},
                    {"t": "math", "latex": "3x^{2}"},
                    {"t": "text", "v": "from 1 to 4."}],
       "aligned": false, "bold": true}
    ],
    "footer": "The limits say where, the integrand says what."
  }
}
```

- [ ] **Step 4: Validate all three, and fix rather than loosen**

```bash
python tools/check_flashcard_json.py flashcard_examples_v2/*.json; echo "exit=$?"
```
Expected: three `PASS` lines and `exit=0`.

If a gate fires, fix the card, never the gate. The one likely failure is G09 on
`definite_integral.json`: `\int` is extracted as an identifier and must be
covered by a key symbol, which `\int_{a}^{b}` does by substring. If G09 fires
on something genuinely universal, add that macro to `UNIVERSAL_MACROS` and add
a test pinning the decision.

- [ ] **Step 5: Write the README**

Create `flashcard_examples_v2/README.md`: what these three are, which contract
branch each exercises, the command that validates them, and a one-line pointer
to the spec and the prompt.

- [ ] **Step 6: Commit**

```bash
git add flashcard_examples_v2/
git commit -m "Add three validated example cards covering every branch of the card contract"
```

---

### Task 8: Render format v2, and update the project memory

**Files:**
- Modify: `tools/render_flashcards.py:1-201`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the three example cards from Task 7.
- Produces: `render_side_v2(doc, theme)`, a `--file` flag, and
  `flashcards.html` showing v1 and v2 cards on one page.

- [ ] **Step 1: Add the v2 rendering branch**

In `tools/render_flashcards.py`, rename the existing `render_side` to
`render_side_v1` and add a dispatcher plus the v2 renderer:

```python
def render_side(doc, theme, scale):
    """Dispatch on format. v1 cards have no format_version key."""
    if doc.get("format_version") == 2:
        return render_side_v2(doc, theme)
    return render_side_v1(doc, theme, scale)


def _segments_html(segments):
    """Segments as HTML. Math becomes a MathJax delimiter, not an image."""
    out = []
    for segment in segments:
        if segment.get("t") == "math":
            out.append("\\(%s\\)" % segment["latex"])
        else:
            out.append(html.escape(segment.get("v", "")))
    return " ".join(out)


def render_side_v2(doc, theme):
    """A format_version 2 side. Layout lives here, never in the JSON."""
    parts = ['<div class="card %s">' % theme,
             '<div class="title">%s</div>' % html.escape(doc["title"])]
    if "subtitle" in doc:                                   # front
        parts.append('<div class="sub">%s</div>' % html.escape(doc["subtitle"]))
        central = doc["central"]
        parts.append('<div class="math central">%s</div>'
                     % ("\\[%s\\]" % central["latex"] if "latex" in central
                        else html.escape(central["text"])))
        key = doc.get("variable_key") or []
        if key:
            parts.append('<div class="varkey">%s</div>' % "; ".join(
                "\\(%s\\) = %s" % (e["symbol"], html.escape(e["meaning"]))
                for e in key))
        parts.append("<p>%s</p>" % html.escape(doc["main_description"]))
        parts.append('<p class="supporting">%s</p>'
                     % html.escape(doc["supporting_description"]))
        parts.append('<p class="foot">%s</p>' % html.escape(doc["footer"]))
    else:                                                   # back
        parts.append('<div class="sub">%s</div>' % _segments_html(doc["problem"]))
        for row in doc["rows"]:
            parts.append('<p class="row%s">%s</p>'
                         % (" bold" if row.get("bold") else "",
                            _segments_html(row["segments"])))
        parts.append('<p class="foot">%s</p>' % html.escape(doc["footer"]))
    parts.append("</div>")
    return "".join(parts)
```

Add to `CSS`:

```css
.card .varkey { font-size:.78rem; opacity:.85; margin:.1rem 0 .35rem; }
.card .central { font-size:1.15rem; margin:.3rem 0; }
.card .supporting { font-size:.85rem; }
.card .foot { font-style:italic; font-size:.82rem; margin-top:.5rem; opacity:.9; }
.card .row { font-size:.9rem; margin:.12rem 0; }
.card .row.bold { font-weight:700; }
.dark .varkey, .dark .foot { color:var(--accent); }
.light .foot { color:#176CF8; }
```

- [ ] **Step 2: Add the MathJax loader and the --file flag**

In `build_page`, when any card has `format_version == 2` in either side, append
this to the `out` list before the cards:

```python
    if any(c["front"].get("format_version") == 2 or
           c["back"].get("format_version") == 2 for c in cards):
        out.append(
            '<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],'
            'displayMath:[["\\\\[","\\\\]"]]},svg:{fontCache:"global"}};</script>'
            '<script id="MathJax-script" async '
            'src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mjx.js"></script>')
```

Add a `load_files(paths)` function that reads card JSON from disk and returns
the same shape `fetch` returns, splitting the wrapper so `front` and `back` each
carry `format_version`:

```python
def load_files(paths):
    """Cards read from disk, so prompt output can be previewed before import."""
    cards = []
    for path in paths:
        doc = json.loads(Path(path).read_text(encoding="utf-8"))
        front = dict(doc["front"], format_version=doc["format_version"])
        back = dict(doc["back"], format_version=doc["format_version"])
        cards.append({"id": Path(path).stem, "section": doc["source"]["section"],
                      "concept": doc["concept"], "front": front, "back": back})
    return cards
```

In `main`, add the flag and branch before `fetch`:

```python
    ap.add_argument("--file", nargs="+", metavar="CARD.json",
                    help="render card JSON from disk instead of the database")
```
```python
    cards = load_files(args.file) if args.file else \
        fetch(card_ids=args.ids, section=args.section)
```

- [ ] **Step 3: Render the three examples and look at them**

```bash
python tools/render_flashcards.py --file flashcard_examples_v2/*.json --out flashcards_v2.html
```
Expected: `wrote flashcards_v2.html (3 cards, theme=deck, math x1.75)`.

Open it in a browser. Confirm, on each card: the front title, subtitle,
central object, variable key, both description lines and the footer are all
visible; the back shows the problem line, 4 or 5 rows, a bold final row, and the
footer; every formula is typeset, not raw LaTeX. Raw `\(...\)` on screen means
MathJax did not load, which needs network.

- [ ] **Step 4: Confirm the legacy path still works**

```bash
cd flashcards_db && docker compose up -d && cd ..
python tools/render_flashcards.py 28 --out flashcards_v1_check.html
```
Expected: one card, the Power Rule v1 deck, rendering exactly as before. This is
the regression check on the rename in Step 1. If Docker is not running, say so
rather than claiming the check passed.

- [ ] **Step 5: Update CLAUDE.md**

Per operating rule 1, in the same response as the work:

- Section 5: add the `flashcard_concept_card_prompt_v2` lineage entry.
- Section 9: add the decision block. It must record: the measured compliance
  audit that motivated the change; the prompt/renderer split; the row count
  reversal from 6 to 4-6 with the 0/75 evidence; the LO ordinal amendment
  replacing `lo_id`; the validator-as-contract with the generated schema; and
  the accepted cost of two JSON formats coexisting in the DB.
- Section 12: add what the tests do and do not prove. They do not prove the
  prompt works: no fresh-session generation has run.
- Section 13: backlog 14 gains the follow-ups, and add regenerating the 75
  legacy cards under v2 as an open item.
- Section 15: add every new file to the file map.

- [ ] **Step 6: Commit**

```bash
git add tools/render_flashcards.py CLAUDE.md
git commit -m "Render format v2 cards from disk or the database and log the flashcard JSON decisions"
```

---

## Verification, once every task is done

```bash
python -m pytest tools/test_check_flashcard_json.py -q
python tools/check_flashcard_json.py flashcard_examples_v2/*.json; echo "exit=$?"
python tools/generate_card_schema.py && git diff --exit-code flashcards_db/card_schema_v2.json
git status --porcelain
```
Expected: 45 passed; three PASS lines and exit 0; no schema diff; a clean tree.

## Manual step the plan cannot execute: the fresh-session run

Spec section 7 item 4 requires running the prompt cold. No task above does this,
because it needs a separate session or a model call, and a run inside the
session that wrote the prompt proves nothing about a cold start.

Procedure, for Hitaansh or a fresh session:

1. Open a new chat with no project context loaded.
2. Paste `prompts/flashcard_concept_card_prompt_v2.md`, then the inputs
   `topic: Product Rule`, `book_tag: openstax_calc1`, `section: 3.3`. This topic
   is deliberately not one of the three examples.
3. Save the reply verbatim as `flashcard_examples_v2/product_rule.json`. Do not
   edit it, not even whitespace: an edited output measures the editor.
4. Run `python tools/check_flashcard_json.py flashcard_examples_v2/product_rule.json`.
5. Record the result in CLAUDE.md sec 12, including which gates fired. A first
   run that fails two or three gates is a useful measurement, not a failure of
   the exercise; it says exactly which rules the prompt states unclearly.

Repeat on a second model if cross-provider portability matters, and log both.

## What this plan does not do

- No fresh-session run of the prompt inside the plan. Until the manual step
  above runs, nothing here proves the prompt produces valid JSON, only that
  invalid JSON would be caught.
- The 75 legacy cards are untouched and keep the v1 format.
- No PNG output. HTML preview only, per the July 28 decision.
- `problem_solution` cards remain unbuilt.
