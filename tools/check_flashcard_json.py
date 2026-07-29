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

CONCEPT_MAX_CHARS = 40
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


# A segment is a closed shape: exactly these keys, nothing else. The schema
# says the same with additionalProperties: false on each branch.
SEGMENT_KEYS = {"text": ("t", "v"), "math": ("t", "latex")}


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
        if t not in SEGMENT_KEYS:
            _err(errors, "G01", "%s.t is %r, expected 'text' or 'math'"
                 % (seg_path, t))
            continue
        value_key = "v" if t == "text" else "latex"
        if value_key not in seg:
            _err(errors, "G01", "%s is a %s segment with no %r"
                 % (seg_path, t, value_key))
        elif not isinstance(seg[value_key], str):
            _err(errors, "G01", "%s.%s is %s, expected string"
                 % (seg_path, value_key, type(seg[value_key]).__name__))
        extra = sorted(set(seg) - set(SEGMENT_KEYS[t]))
        if extra:
            _err(errors, "G01", "%s carries unknown key(s) %s; a %s segment "
                                "holds only %s"
                 % (seg_path, extra, t, list(SEGMENT_KEYS[t])))


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

    # Type-check concept is a string within the 1-to-CONCEPT_MAX_CHARS contract
    if "concept" in card:
        concept = card["concept"]
        if not isinstance(concept, str):
            _err(errors, "G01", "concept is %s, expected string"
                 % type(concept).__name__)
        elif not 1 <= len(concept) <= CONCEPT_MAX_CHARS:
            _err(errors, "G01", "concept is %d characters, contract requires 1 to %d"
                 % (len(concept), CONCEPT_MAX_CHARS))

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
            # An empty problem array used to pass every gate, so a back with no
            # task stated at all shipped as a valid worked example.
            if not problem:
                _err(errors, "G01",
                     "back.problem is empty, so the worked example states no task")
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
                # aligned and bold decide layout and which row is the
                # conclusion, and both gates that read them (G06, G07) coerce
                # with row.get(), so a missing flag or a truthy 0/1 used to
                # pass silently. Require both, as real booleans.
                for flag in ("aligned", "bold"):
                    if flag not in row:
                        _err(errors, "G01", "%s is missing required key %r"
                             % (row_path, flag))
                    elif type(row[flag]) is not bool:
                        _err(errors, "G01", "%s.%s is %r, expected true or false"
                             % (row_path, flag, row[flag]))
                segments = row.get("segments")
                if "segments" not in row:
                    _err(errors, "G01", "%s is missing required key 'segments'"
                         % row_path)
                elif not isinstance(segments, list):
                    _err(errors, "G01", "%s.segments is %s, expected array"
                         % (row_path, type(segments).__name__))
                elif not segments:
                    # A row with no segments renders as a blank line: the
                    # filler row the prompt's own rule forbids.
                    _err(errors, "G01", "%s.segments is empty, so the row says "
                                        "nothing" % row_path)
                else:
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


# Notation every student already reads, so it is never required in the key.
# \begin, \end and \aligned are deliberately NOT here: the prompt bans LaTeX
# environments outright (rows carry structure, not \begin{aligned}), and this
# tokenizer reads an environment name letter by letter anyway, so allowlisting
# the three macros would only soften the reporting on a card that is invalid
# for a different reason.
UNIVERSAL_MACROS = frozenset({
    "\\cdot", "\\times", "\\div", "\\pm", "\\mp", "\\frac", "\\left", "\\right",
    "\\big", "\\Big", "\\bigg", "\\Bigg", "\\quad", "\\qquad", "\\,", "\\;",
    "\\text", "\\mathrm", "\\displaystyle", "\\boldsymbol", "\\bm", "\\sqrt",
    "\\approx", "\\neq", "\\leq", "\\geq",
    "\\to", "\\infty", "\\ldots", "\\cdots", "\\sin", "\\cos", "\\tan",
    "\\sec", "\\csc", "\\cot", "\\log", "\\ln", "\\exp",
})
TEXT_STRIP_RE = re.compile(r"\\text\{[^{}]*\}")
NAMED_GROUP_RE = re.compile(r"\\(?:mathrm|operatorname)\{[^{}]*\}")
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
    letters inside \\text{...} do not: those are words, not variables. A
    \\mathrm{...} or \\operatorname{...} group counts as ONE whole identifier
    (e.g. \\mathrm{PV}), not as separate letters, since multi-letter finance
    and stats symbols like PV, FV, NPV are conventionally written that way.
    """
    stripped = TEXT_STRIP_RE.sub(" ", latex)
    found = set()

    def _capture_named_group(match):
        found.add(match.group(0))
        return " "                   # blanked so inner letters are not
                                      # also tokenized individually below
    stripped = NAMED_GROUP_RE.sub(_capture_named_group, stripped)
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
    defined = set()
    for symbol in symbols:
        defined |= latex_identifiers(symbol)
    for ident in sorted(latex_identifiers(formula)):
        if ident not in defined:
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
    # concept is prose too: it becomes concept.name in MySQL, where a stray
    # Unicode superscript is as unsearchable as it is on a card.
    scan("concept", card.get("concept", ""))
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


def _preceding_backslash_count(text, i):
    """How many consecutive backslash characters sit right before index i."""
    count = 0
    j = i - 1
    while j >= 0 and text[j] == "\\":
        count += 1
        j -= 1
    return count


def g12_latex_sanity(card, errors):
    """Structural sanity only: a full parse needs KaTeX, which is not installed."""
    for latex in _all_latex(card["front"]) + _all_latex(card["back"]):
        if not latex.strip():
            _err(errors, "G12", "empty latex string")
            continue
        depth = 0
        for i, ch in enumerate(latex):
            if ch not in "{}":
                continue
            # A brace is escaped only when an ODD number of backslashes
            # precede it: \{ is one escaped brace, \\{ is a literal
            # backslash (\\) followed by a real, unescaped brace.
            if _preceding_backslash_count(latex, i) % 2 == 1:
                continue
            if ch == "{":
                depth += 1
            else:
                depth -= 1
            if depth < 0:
                break
        if depth != 0:
            _err(errors, "G12", "unbalanced braces in latex %r" % latex)


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
        review_note = source.get("review_note")
        if review_note is not None and not isinstance(review_note, str):
            # CRITICAL fix (fix round 1): review_note is not in
            # REQUIRED_SOURCE and is never type-checked by g01_shape, so an
            # int/list/bool review_note used to reach .strip() below and
            # crash the whole process instead of producing an error line.
            _err(errors, "G13", "source.review_note is %s, expected string"
                 % type(review_note).__name__)
        elif not (review_note or "").strip():
            _err(errors, "G13",
                 "lo_ordinal is null, so source.review_note is required")
        if source.get("lo_text"):
            _err(errors, "G13", "lo_ordinal is null, so lo_text must be empty")
        return
    objectives = section.get("learning_objectives") or []
    # IMPORTANT fix (fix round 1): type(ordinal) is not int, not
    # isinstance(ordinal, int). bool subclasses int in Python, so
    # isinstance(True, int) is True and lo_ordinal: true used to pass
    # silently as ordinal 1. type() excludes bool without an extra check.
    if type(ordinal) is not int or not 1 <= ordinal <= len(objectives):
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


GATES = [g02_contract_strings, g03_word_budgets, g04_title_length,
         g05_row_count, g06_bold_row, g07_aligned_rows,
         g08_variable_key_presence, g09_symbol_coverage,
         g10_notation_consistency, g11_unicode_ban, g12_latex_sanity,
         g13_corpus_mapping, g14_footer_prefix]


def check_card(card):
    """Every error line for one card. Empty list means it passed."""
    errors = []
    if not g01_shape(card, errors):
        return errors          # later gates assume the shape holds
    for gate in GATES:
        gate(card, errors)
    return errors


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
    # G11 error messages can embed the offending Unicode character itself
    # (e.g. a superscript digit) via repr(). Some console/pipe encodings
    # (cp1252 on Windows) cannot encode it, which would crash the CLI with
    # a traceback instead of a clean exit 2. Keep the stream's own encoding
    # (a no-op on UTF-8 systems) and only swap the error handler so an
    # unencodable character degrades to a backslash escape instead of
    # raising.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="backslashreplace")
    sys.exit(main(sys.argv[1:]))
