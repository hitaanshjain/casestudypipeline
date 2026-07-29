# Flashcard JSON Prompt: Design Spec

Status: design approved by Hitaansh July 28, 2026 (JSON shape approved as
shown; HTML preview chosen over PNG for now). Awaiting spec review.

Scope: replace the `.pptx`-generating concept flashcard prompt with a
content-only prompt that emits **one JSON document per card**, validated
mechanically, stored in `flashcards_db`, and rendered on demand.

Related: `plan/concept_flashcard_import_design.md` (the import that revealed the
defects below), `plan/flashcards_db_design.md` (schema), CLAUDE.md sec 9
(flashcard decisions) and sec 12 (caveats this spec closes).

## 1. Why: measured compliance of the current prompt

Every claim here was measured against all 75 decks in
`OpenStax_Calculus_Volume_1_Concept_Only_Flashcards/`, read with the repo's own
extractor (`tools/import_concept_flashcards.py`).

| Prompt rule | Kind | Compliance |
|---|---|---|
| footer `Flip for a worked example` | exact string | 75/75 |
| back title `Worked Example` | exact string | 75/75 |
| subtitle 2 to 4 words | countable budget | 75/75 |
| variable key present iff formula carries notation | enumerable structure | 75/75 |
| slide size 10 x 7.5 in, 4:3 | fixed geometry | 75/75 |
| title <= 24 characters | countable budget | 74/75 (`Logarithmic Differentiation`, 27) |
| "exactly six meaningful solution rows" | semantic count | **0/75** (6 decks 3 rows, 50 decks 4, 19 decks 5) |
| "never save SVG data inside a `.png` file" | binary file internals | **0/351 png parts are PNG** |
| "never use Unicode superscripts" | cross-cutting ban | **violated in 52/75 decks** |
| "native Office Math" listed as first preference | preference order | **0/75 use OMML** |

Method note on the row count: rows were counted as separate shapes on slide 2,
excluding the problem statement and footer. A rows-4-to-6 block fused into one
image would undercount, so this was checked: the tallest back-side math object
in any deck is 57px, consistent with one tall single line (a fraction or a sigma
with limits), not a three-line aligned block. Independently, the five decks with
no images at all show 4 or 5 plain text rows, where no fusion is possible.

### The pattern

Rules the model could **count or copy verbatim** held at roughly 100%. Rules
requiring it to **measure** something (inches, optical character height,
"meaningful" rows) or to **control bytes it cannot inspect** held at 0%. This is
the same finding the project already logged as a triage principle in CLAUDE.md
sec 9: convert unmeasurable prompt rules into countable ones, and put
enforcement for anything self-graded in the pipeline rather than in more prose.

### The cost already being paid

- CLAUDE.md sec 12 caveat (b): formula LaTeX exists nowhere in the corpus. The
  MathJax SVGs carry no `aria-label`, no `<title>`, no `<annotation>`. Prose is
  SQL-searchable, math is not, and no formula can be re-typeset or re-rendered
  at a different size for the worksheet pipeline.
- CLAUDE.md sec 12 caveat (a): 351 mislabeled PNG parts, a live defect for any
  consumer that takes the raster path.
- `tools/flashcard_lo_mapping.csv`: 75 post-hoc concept-to-LO assignments, 8 of
  them judgment calls, because the prompt never took the section or LO as input.

## 2. Architecture

```
  inputs (topic, book_tag, section, lo_id, LO text, optional source notes)
        |
        v
  [ PROMPT ]  content only. No geometry, no fonts, no colors, no file format.
        |
        v  one JSON document per card
  [ VALIDATOR ]  tools/check_flashcard_json.py, exit 0/2, schema + 14 gates
        |
        v
  [ DB ]  flashcards_db, front_content/back_content LONGBLOB, format 'json-v2'
        |
        v
  [ RENDERER ]  tools/render_flashcards.py, owns palette, type, spacing, size
        |
        v  HTML preview now; PNG/SVG/pptx later, from the same JSON
```

The split follows the compliance data exactly. The prompt keeps what it proved
it can do. Everything measurable moves to deterministic code, where a spacing
rule cannot be violated.

**Moved out of the prompt entirely** (roughly 60% of it): `fixed_palette`,
`typography`, `backgrounds`, `borders`, all X/Y/width/height geometry,
`solution_region`, `shared_solution_scale`, `optical_size_consistency`,
`solution_vertical_spacing`, `solution_horizontal_spacing`, the pptx packaging
rules in `math_rendering_and_compatibility`, and the unexecutable
`render_and_validate` steps. These become renderer configuration.

**Kept in the prompt**: the seven fixed front elements, the variable-key
content rules, row semantics, notation consistency across sides, word budgets,
the exact contract strings, and the "choose a simpler example" escape hatch.

## 3. The card JSON contract

`format_version` is `2`. `front_format` and `back_format` in MySQL are
`VARCHAR(20)`, so the value `json-v2` needs **no schema change**, which is the
extensibility the July 20 blob-plus-format-column decision was hedged for.

Two markers, deliberately: the DB column says `json-v2` so SQL can filter
without parsing blobs, and `format_version` inside the blob says `2` so a
consumer holding only the blob still knows what it has. They must agree; the
importer sets both from the same value.

The model emits ONE object per card. The DB stores `front` and `back` as
separate blobs, as it does today; the wrapper's `source` and `concept` fields
populate the `concept` row and are not stored inside either blob.

```json
{
  "format_version": 2,
  "card_type": "concept_example",
  "concept": "Power Rule",
  "source": {
    "book_tag": "openstax_calc1",
    "section": "3.3",
    "lo_ordinal": 1,
    "lo_text": "State the constant, constant multiple, and power rules."
  },
  "front": {
    "title": "Power Rule",
    "subtitle": "Differentiate Powers",
    "central": { "latex": "\\frac{d}{dx}\\left(x^{n}\\right)=nx^{n-1}" },
    "variable_key": [
      { "symbol": "n", "meaning": "constant exponent" },
      { "symbol": "x", "meaning": "variable you differentiate by" }
    ],
    "main_description": "...",
    "supporting_description": "...",
    "footer": "Flip for a worked example"
  },
  "back": {
    "title": "Worked Example",
    "problem": [
      { "t": "text", "v": "Differentiate " },
      { "t": "math", "latex": "f(x)=x^{5}" }
    ],
    "rows": [
      { "segments": [ ... ], "aligned": false, "bold": false },
      { "segments": [ ... ], "aligned": true,  "bold": false },
      { "segments": [ ... ], "aligned": true,  "bold": true  }
    ],
    "footer": "Power down, exponent down one."
  }
}
```

### Field rules

Top level:

- `format_version`: integer, const `2`.
- `card_type`: closed vocabulary, `concept_example` or `problem_solution`.
  This spec covers `concept_example`; `problem_solution` reuses the same
  contract with a different back structure and is out of scope here.
- `concept`: 1 to 40 characters. Becomes `concept.name` in the DB.
- `source.book_tag`: must match the `book_tag` in a `references/*/book_map.json`.
  For the current corpus that value is `openstax_calc1`.
- `source.section`: must exist in that book map, matched on its `number` field.
- `source.lo_ordinal`: 1-based index into that section's `learning_objectives`
  list, or `null`. **Amendment, July 28**: the spec first called this `lo_id`.
  The corpus assigns no identifiers to objectives, and the DB's
  `learning_objective.id` is an autoincrement that changes on every rebuild, so
  neither is stable enough to put in a stored card. The section-scoped ordinal
  is stable, and the importer resolves it to a DB id at load time.
- `source.lo_text`: the objective **verbatim** from the corpus, or `""` when
  `lo_ordinal` is `null`. Not decoration: gate G13 asserts byte equality with
  `book_map.json` at that ordinal, which mechanically catches a paraphrased or
  invented objective. That is the exact failure mode that left 8 of 75 mappings
  as judgment calls in `tools/flashcard_lo_mapping.csv`.
- `source.review_note`: string, required and non-empty when `lo_ordinal` is
  `null`, absent otherwise. Says why no objective fit. This is the v2 equivalent
  of phase 1's `no_primary_available` honesty path.

`front`:

- `title`: 1 to 24 characters. Schema maximum, so the one 27-character slip in
  the current corpus becomes impossible rather than unlikely.
- `subtitle`: 2 to 4 words, Title Case, no ending punctuation.
- `central`: exactly one of `{"latex": "..."}` or `{"text": "..."}`.
  `text` form is at most 24 words, for genuinely non-symbolic concepts.
- `variable_key`: array of `{symbol, meaning}`. Required and non-empty when
  `central.latex` is present and contains definable notation. Must be absent
  when `central.text` is used. `symbol` is LaTeX. `meaning` is at most 8 words,
  a phrase not a sentence.
- `main_description`: at most 14 words.
- `supporting_description`: at most 17 words.
- `footer`: const `Flip for a worked example` (byte-exact, already 75/75).

`back`:

- `title`: const `Worked Example` (byte-exact, already 75/75).
- `problem`: segments array, at most 14 words of prose across its text
  segments.
- `rows`: **4 to 6 rows**, each `{segments, aligned, bold}`.
- `footer`: at most 12 words, and must not begin with `Tip:`, `Remember:`,
  `Shortcut:`, `Note:`, or `Key idea:` (closed prefix blacklist).

Segments (used by `problem` and every row):

- `{"t": "text", "v": "..."}` for prose, including cue words such as `Let`,
  `Then`, `Since`, `Therefore`.
- `{"t": "math", "latex": "..."}` for anything mathematical.
- No text segment may contain a Unicode superscript, subscript, minus sign, or
  a caret. This is the structural fix for the 52/75 violation: prose-containing-
  math previously had no home in the format, so the model invented one. The ban
  covers prose only: `latex` values use `^` and `_` normally, as LaTeX does.

Row flags:

- `aligned`: the row belongs to the continuing derivation that shares one
  relation-symbol column. Aligned rows must be contiguous and must run to the
  last row. Non-aligned rows are independent centered statements. Zero aligned
  rows is valid and is the normal case for conceptual cards with no symbolic
  derivation, such as the Intermediate Value Theorem.
- `bold`: exactly one row carries `true`, and it must be the last row. This is
  the final answer or conclusion. The renderer bolds the entire row, which
  removes the "bold all numbers, variables, operators, parentheses, exponents"
  instruction from the prompt completely.

### Why the row count changes from 6 to 4-6

Stated four separate times in four sections, "exactly six meaningful rows" was
obeyed zero times out of 75. The model preferred fewer real rows over padding,
which is the correct pedagogical instinct and is what the same prompt asks for
elsewhere ("do not create filler rows", "every row must contribute meaningful
reasoning"). The prompt was wrong, not the output. 4 is the observed modal
count and becomes the floor; 6 stays the ceiling.

## 4. Validator gates

`tools/check_flashcard_json.py <file.json> [...]`, exit 0 on pass, exit 2 on any
failure, one `ERROR <gate_id>: <message>` line per failure, mirroring
`tools/check_phase1_package.ps1`'s exit-code contract.

| id | Gate |
|---|---|
| G01 | File parses as UTF-8 JSON and validates against `card_schema_v2.json` |
| G02 | `front.footer` and `back.title` are byte-exact contract strings |
| G03 | Word budgets: subtitle 2-4, main <= 14, supporting <= 17, problem <= 14, back footer <= 12 |
| G04 | `front.title` <= 24 characters |
| G05 | `back.rows` length is 4 to 6 |
| G06 | Exactly one row has `bold: true`, and it is the last row |
| G07 | `aligned` rows are contiguous and end at the last row |
| G08 | `variable_key` present iff `central.latex` is used |
| G09 | Symbol coverage: every definable identifier in `central.latex` appears in `variable_key`, and every `variable_key` symbol appears in `central.latex`. Each symbol defined exactly once |

| G10 | Notation consistency: every identifier used in `back` either appears in `variable_key` or is introduced by an earlier row |
| G11 | No Unicode superscript, subscript, minus, or caret in any text field |
| G12 | Every `latex` string parses (KaTeX parse check via node when available; skipped with a logged note when not) |
| G13 | `source.section` exists in the named book map, `source.lo_ordinal` is in range for that section, and `source.lo_text` is byte-equal to the corpus objective at that ordinal |
| G14 | Back footer does not begin with a blacklisted prefix |

G09 is the one that matters most: "define every symbol exactly once" was
previously a request the model graded itself on. As a set operation over parsed
LaTeX it is mechanical.

**Definable identifier**, the term G09 and G10 turn on: any single-letter
variable or parameter, any subscripted or indexed form (`p_i`, `CF_t`), any
multi-letter abbreviation (`PV`, `NPV`, `YTM`), any function notation (`f(x)`,
`f'(x)`), any operator whose meaning is topic-specific rather than universal
(`\frac{d}{dx}`, `\int`, `\lim`, `\sum`), and any summation or integration
bound whose meaning the reader needs. Explicitly **not** definable, and
therefore not required in the key: `+`, `-`, `=`, `\times`, `\cdot`,
parentheses, fraction bars used as ordinary division, and standard numerals.
The validator ships this as an explicit allowlist so the boundary is one edited
list rather than a judgment call repeated per card.

G12 degrades honestly rather than silently: when node or KaTeX is unavailable
the gate is reported as `SKIPPED`, never as `PASS`.

### Negative controls

Every gate must be made to fire at least once on purpose. A gate that never
fires is decoration.

**Amendment, July 28**: this first read "one bad file per gate". Split in two,
because the two things being tested are different. Every gate gets a negative
**unit test** that asserts its id fires, and a meta-test walks G01 through G14
and fails if any gate has no such test, so the coverage claim is itself
enforced rather than asserted. Four representative bad **fixtures** live in
`tools/fixtures/flashcard_json/`, one per gate family (structural, notation,
prose, corpus), and exist to test the CLI's exit-2 path end to end. Fourteen
near-identical JSON files would test the same CLI path fourteen times while
adding nothing the unit tests do not already cover.

## 5. Legacy compatibility

The 75 existing cards keep their current format: no `format_version` key,
`blocks` arrays containing `math_svg`. Their LaTeX is unrecoverable from the
source decks, so converting them means regenerating them, which is a separate
decision and is not in this scope.

`tools/render_flashcards.py` branches on the presence of `format_version`:

- absent: existing v1 path, unchanged, including the currentColor normalisation
  added July 28.
- `2`: new named-slot path, LaTeX typeset in the browser.

Both render into the same two-tone deck theme, so v1 and v2 cards can appear on
one preview page and be compared directly. That comparison is also how the
outstanding visual spot-check (CLAUDE.md sec 12 caveat (e), backlog 14(h)) gets
easier: a v2 card and its v1 counterpart side by side.

Math typesetting in the preview uses MathJax from a CDN. Accepted cost: the v2
preview needs network access on first load. Vendoring MathJax into the repo was
rejected because backlog 8 already flags repo weight as an open exposure.

## 6. Failure behavior of the prompt

- Missing or unusable required input (no `section`, or a `section` absent from
  the book map): emit exactly one line, `ERROR input: <reason>`, and no JSON.
- The topic genuinely has no symbolic form: use `central.text` and omit
  `variable_key`. This is an honest path, not an error.
- The concept cannot be worked in 4 to 6 rows: choose a simpler representative
  example. Never pad, never drop below 4.
- No `lo_id` fits the concept: emit `lo_id: null`, `lo_text: ""`, and a
  `review_note` string on `source`. Honest gaps ship flagged, never guessed,
  which is the same rule phase 1 already follows for `no_primary_available`.

## 7. Test plan

1. Static: required-string scan and non-ASCII scan over the prompt file.
2. Schema: the three example cards validate, exit 0.
3. Negative controls: 14 fixtures, one per gate, each exits 2 with its own id.
4. Fresh-session generation: run the prompt cold on a topic not in the examples
   and validate the output without editing it.
5. Render: all three examples plus one legacy v1 card on one preview page.

Claim only what runs. Single runs on one model family prove nothing about
variance, and the runs are semi-fresh because agents in this repo load
CLAUDE.md.

## 8. Accepted costs and open items

- Two JSON formats coexist in the DB until the 75 legacy cards are regenerated.
- The JSON block format remains our invention, unvalidated against Peter's
  production expectations. This is the standing caveat already logged for the
  v1 format and the column naming; v2 does not close it.
- `problem_solution` cards are still unbuilt, and still blocked on the team's
  GIF-versus-JSON animation decision. The v2 contract is designed to extend to
  them without a schema change.
- Attribution: the current prompt forbids a citation slide, and the decks carry
  no license line, only `dc:subject`. OpenStax is CC BY-NC-SA. v2 moves the
  obligation to the renderer (a credit line drawn from the `textbook` row's
  license metadata, which already exists) rather than asking the model for it.
