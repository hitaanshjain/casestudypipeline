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
