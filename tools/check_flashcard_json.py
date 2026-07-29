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


def _check_segments(errors, path, segments):
    """Validate a list of {t, v|latex} segment dicts in place.

    path is the dotted/indexed location for error messages, e.g.
    "back.problem" or "back.rows[2].segments".
    """
    for i, seg in enumerate(segments):
        seg_path = "%s[%d]" % (path, i)
        if not isinstance(seg, dict):
            _err(errors, "G01", "%s is %s, expected object"
                 % (seg_path, type(seg).__name__))
            continue
        t = seg.get("t")
        if t not in ("text", "math"):
            _err(errors, "G01", "%s.t is %r, expected 'text' or 'math'"
                 % (seg_path, t))
            continue
        if t == "text" and "v" in seg and not isinstance(seg["v"], str):
            _err(errors, "G01", "%s.v is %s, expected string"
                 % (seg_path, type(seg["v"]).__name__))
        if t == "math" and "latex" in seg and not isinstance(seg["latex"], str):
            _err(errors, "G01", "%s.latex is %s, expected string"
                 % (seg_path, type(seg["latex"]).__name__))


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

    # Type-check concept is a string
    if "concept" in card and not isinstance(card["concept"], str):
        _err(errors, "G01", "concept is %s, expected string"
             % type(card["concept"]).__name__)

    # Check source, front, back blocks and their required keys
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

    # Type-check source string fields
    source = card.get("source")
    if isinstance(source, dict):
        for field in ("book_tag", "section", "lo_text"):
            if field in source and not isinstance(source[field], str):
                _err(errors, "G01", "source.%s is %s, expected string"
                     % (field, type(source[field]).__name__))

    # Type-check front fields
    front = card.get("front")
    if isinstance(front, dict):
        # Check string fields
        for field in ("title", "subtitle", "main_description", "supporting_description", "footer"):
            if field in front and not isinstance(front[field], str):
                _err(errors, "G01", "front.%s is %s, expected string"
                     % (field, type(front[field]).__name__))

        # Check central is a dict if present
        central = front.get("central")
        if "central" in front and not isinstance(central, dict):
            _err(errors, "G01", "front.central is %s, expected object"
                 % type(central).__name__)

        # Check one-of only if central is a dict
        if isinstance(central, dict) and ("latex" in central) == ("text" in central):
            _err(errors, "G01",
                 "front.central needs exactly one of 'latex' or 'text'")

        # Check central.text / central.latex are strings, when present
        if isinstance(central, dict):
            for field in ("text", "latex"):
                if field in central and not isinstance(central[field], str):
                    _err(errors, "G01", "front.central.%s is %s, expected string"
                         % (field, type(central[field]).__name__))

        # Check variable_key is a list if present
        key = front.get("variable_key")
        if "variable_key" in front and not isinstance(key, list):
            _err(errors, "G01", "front.variable_key is %s, expected array"
                 % type(key).__name__)

        # Check variable_key entries: each is a dict with string symbol/meaning
        if isinstance(key, list):
            for i, entry in enumerate(key):
                entry_path = "front.variable_key[%d]" % i
                if not isinstance(entry, dict):
                    _err(errors, "G01", "%s is %s, expected object"
                         % (entry_path, type(entry).__name__))
                    continue
                for field in ("symbol", "meaning"):
                    if field in entry and not isinstance(entry[field], str):
                        _err(errors, "G01", "%s.%s is %s, expected string"
                             % (entry_path, field, type(entry[field]).__name__))

    # Type-check back fields
    back = card.get("back")
    if isinstance(back, dict):
        # Check string fields
        for field in ("title", "footer"):
            if field in back and not isinstance(back[field], str):
                _err(errors, "G01", "back.%s is %s, expected string"
                     % (field, type(back[field]).__name__))

        # Check problem is a list if present
        problem = back.get("problem")
        if "problem" in back and not isinstance(problem, list):
            _err(errors, "G01", "back.problem is %s, expected array"
                 % type(problem).__name__)

        # Check problem's segments: each is a dict, t is text/math, v/latex are strings
        if isinstance(problem, list):
            _check_segments(errors, "back.problem", problem)

        # Check rows is a list if present
        rows = back.get("rows")
        if "rows" in back and not isinstance(rows, list):
            _err(errors, "G01", "back.rows is %s, expected array"
                 % type(rows).__name__)

        # Check rows: each is a dict, and each row's segments follow the
        # same shape rules as back.problem's segments
        if isinstance(rows, list):
            for i, row in enumerate(rows):
                row_path = "back.rows[%d]" % i
                if not isinstance(row, dict):
                    _err(errors, "G01", "%s is %s, expected object"
                         % (row_path, type(row).__name__))
                    continue
                segments = row.get("segments")
                if "segments" in row and not isinstance(segments, list):
                    _err(errors, "G01", "%s.segments is %s, expected array"
                         % (row_path, type(segments).__name__))
                elif isinstance(segments, list):
                    _check_segments(errors, "%s.segments" % row_path, segments)

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
    last = len(flags) - 1 - flags[::-1].index(True)
    if not all(flags[first:last + 1]):
        _err(errors, "G07", "aligned rows are not contiguous: %s"
             % "".join("A" if f else "." for f in flags))
    elif last != len(flags) - 1:
        _err(errors, "G07",
             "the aligned block must run to the last row, but row %d is not aligned"
             % len(flags))


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
        if "variable_key" in front:
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


GATES = [g02_contract_strings, g03_word_budgets, g04_title_length,
         g05_row_count, g06_bold_row, g07_aligned_rows,
         g08_variable_key_presence]


def check_card(card):
    """Every error line for one card. Empty list means it passed."""
    errors = []
    if not g01_shape(card, errors):
        return errors          # later gates assume the shape holds
    for gate in GATES:
        gate(card, errors)
    return errors
