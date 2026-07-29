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
                       "sole contract; this file is generated from its "
                       "constants and expresses only what JSON Schema can "
                       "state structurally. Passing this schema is necessary "
                       "but NOT sufficient: it does not express G03 (word-count "
                       "budgets on seven fields), G06 (exactly one bold row, "
                       "must be last), G07 (aligned rows must be contiguous "
                       "and run to the end), G09 (variable_key must cover "
                       "every symbol in front.central), G10 (a back row may "
                       "not use a symbol the front or an earlier row never "
                       "introduced), G11 (no Unicode math glyphs in prose "
                       "fields), or G14 (banned footer prefixes). A card can "
                       "pass this schema and still be rejected by the validator.",
        "type": "object",
        "required": list(chk.REQUIRED_TOP),
        "properties": {
            "format_version": {"const": chk.FORMAT_VERSION},
            "card_type": {"enum": list(chk.CARD_TYPES)},
            "concept": {"type": "string", "minLength": 1,
                       "maxLength": chk.CONCEPT_MAX_CHARS},
            "source": {
                "type": "object",
                "required": list(chk.REQUIRED_SOURCE),
                "properties": {
                    "book_tag": {"type": "string"},
                    "section": {"type": "string"},
                    "lo_ordinal": {
                        "type": ["integer", "null"], "minimum": 1,
                        "description": "The validator requires a true "
                            "Python int (type(x) is int). This schema's "
                            "'integer' type also accepts a whole-number "
                            "float such as 1.0, which the validator "
                            "rejects; that divergence is not expressible "
                            "here and is disclosed, not fixed.",
                    },
                    "lo_text": {"type": "string"},
                    "review_note": {"type": "string"},
                },
                "if": {
                    "properties": {"lo_ordinal": {"const": None}},
                },
                "then": {
                    "required": ["review_note"],
                    "properties": {
                        "review_note": {"type": "string", "minLength": 1},
                        "lo_text": {"maxLength": 0},
                    },
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
