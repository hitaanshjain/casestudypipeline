# Concept Flashcard Import: Design Spec

Status: approved by Hitaansh July 24, 2026.
Scope: load the 75 PowerPoint concept flashcards in
`OpenStax_Calculus_Volume_1_Concept_Only_Flashcards/` into the existing
flashcards MySQL database (`flashcards_db/`, built and verified July 20, 2026).

Related: `plan/flashcards_db_design.md` (schema spec),
`plan/flashcards_db_implementation_plan.md` (the DB build), CLAUDE.md sec 9
(flashcard DB decisions) and sec 12 (verification results and caveats).

## 1. Input inventory (measured, not assumed)

- 75 `.pptx` decks in 6 chapter folders (`01_Functions_and_Graphs` through
  `06_Applications_of_Integration`), 8.3 MB total.
- Every deck is exactly 2 slides: slide 1 = concept front, slide 2 = worked
  example back. This maps one-to-one onto the `concept_example` card type.
- Slide 1 titles are the concept names ("Domain And Range").
- Math is embedded as MathJax-rendered SVG images, not text: 66 of 75 front
  slides and 70 of 75 back slides carry image shapes. Prose (title, subtitle,
  framing lines, takeaway) remains real text.
- 702 media files, 3.6 MB raw, about 1.8 MB unique.
- Every text-bearing shape has an explicit `<a:off>` vertical offset, so
  document order can be recovered deterministically by sorting on y.
- 5 decks carry no images at all: `001_Functions`, `023_Intermediate_Value`,
  `027_Differentiability`, `042_Extreme_Value_Theorem`,
  `046_First_Derivative_Test`.

### Defect found in the source decks

Every file named `*.png` inside the decks is **not a PNG**. It is SVG bytes with
a `.png` filename, byte-identical to its `.svg` sibling. This holds for all 70
decks that contain images. PowerPoint renders correctly because the slides use
the `svgBlip` extension, but any consumer falling back to the raster path (older
viewers, Google Slides import, some converters) gets a broken image.

Consequences for this import: the extractor must read the `.svg` sibling and
ignore the `.png`; there is no raster copy in the files to harvest; and whoever
generated the decks should be told.

### What is not recoverable

The SVGs are MathJax glyph paths with no `aria-label`, no `<title>`, and no
annotation element. The original LaTeX is not present in the files. Formulas can
therefore be preserved as vector images but cannot be recovered as searchable
text or as LaTeX. Only prose becomes searchable.

## 2. Decisions

1. **Content format is JSON only.** `front_content` / `back_content` hold a JSON
   document with `format='json'`. Reason: the DB feeds the pipeline, which
   consumes JSON; a raster render is derived data that a pinned renderer
   reproduces deterministically from the same JSON, so storing it would be
   storing what can be regenerated. Reversal note: an earlier turn selected
   "both formats" (JSON plus PNG); Hitaansh reversed it the same session, and
   the reversal removes the `flashcard_render` table, `init/04_renders.sql`, the
   PowerPoint COM render step, and the package size risk that came with them.
2. **The schema does not change.** No new tables, no new columns. The six-table
   core (`subject > textbook > chapter > learning_objective > concept >
   flashcard`) stays exactly as verified on July 20, since it is the artifact
   Peter's production integration may inherit.
3. **Faithful ordered blocks, not inferred semantic roles.** Each side is
   serialized as a title plus an ordered `blocks` array preserving slide order.
   Reason: role inference ("this line is the takeaway") would vary per deck and
   is an interpretation the source does not support.
4. **Standard library only.** Extraction uses `zipfile` and
   `xml.etree.ElementTree`. Reason: the existing build tool
   (`tools/generate_flashcards_seed.py`) is dependency-free and deterministic;
   adding `python-pptx` buys nothing for a uniform 2-slide structure.
5. **Mapping policy: best fit plus a flagged review list.** Every card is
   assigned to its closest learning objective so all 75 load, and every
   assignment that required judgment is recorded with its reasoning in a review
   file. Reason: keeps the DB complete while keeping the judgment visible rather
   than buried in generated SQL.
6. **The three placeholder cards are replaced.** The hand-written samples seeded
   on July 20 overlap `001_Functions` and `002_Domain_And_Range`; the deck
   versions are the real content.
7. **Source decks are archived off-repo** (Google Drive, beside
   `flashcards_db/`), not committed. ASSUMPTION, not yet confirmed by Hitaansh;
   asked twice and unanswered, defaulted to the reversible option. Reason:
   `.git` is already 44 MB and backlog
   8 flags repo bloat as an open exposure. With PNG dropped, the decks are the
   only record of the visual design, so they must be archived somewhere
   deliberate. Easily reversed later by committing the folder.

## 3. JSON document format

One document per side. Shapes are read in vertical order (sorted by `<a:off>`
y-offset), decorative shapes carrying neither text nor image are skipped.

```json
{
  "title": "Domain And Range",
  "blocks": [
    {"type": "text",     "value": "Allowed Values"},
    {"type": "text",     "value": "Domain = allowed inputs; range = possible outputs."},
    {"type": "math_svg", "value": "<svg …MathJax…></svg>"}
  ]
}
```

- `title`: the slide's title shape text, verbatim.
- `blocks[].type`: `text` or `math_svg`. No other types are emitted.
- `blocks[].value`: for `text`, the shape's concatenated runs; for `math_svg`,
  the full SVG document as a UTF-8 string, taken from the `.svg` media part.
- Encoding: UTF-8, stored in the LONGBLOB as UTF-8 bytes.

The format is our invention. If Peter's production integration expects a
different shape, the `front_format` / `back_format` columns make swapping it a
data migration rather than a schema change.

## 4. Mapping procedure

Each deck becomes one `concept` row, which requires a parent `learning_objective`,
which fixes the section. The folders only give the chapter, so section and LO are
derived per card:

1. Concept name = slide 1 title text.
2. Candidate section chosen from the card's front-slide content matched against
   the 45 section names and their 195 LO texts, not from the filename alone.
3. LO chosen as the best textual fit within that section.
4. Confidence recorded per card as `clear` or `judgment`.
5. `ordinal` assigned by the card's numeric filename prefix within its LO.

Output is `tools/flashcard_lo_mapping.csv` with columns: `card_file`,
`concept_name`, `section_number`, `lo_text`, `confidence`, `note`. Every
`judgment` row carries a note explaining the call. CORRECTED post-execution
(see CLAUDE.md sec 9): this section originally named `039_Higher_Derivatives`
and `044_Rolles_Theorem` as known judgment cases, but execution proved both
have named objectives (3.2 "Explain the meaning of a higher-order
derivative." and 4.4 "Explain the meaning of Rolle's theorem.") and both
shipped `clear`. The only named-theorem judgment case is
`042_Extreme_Value_Theorem`, which OpenStax folds into an unnamed 4.3
objective about locating absolute extrema on a closed interval.

Many-to-one is expected and legal: `028_Power_Rule` and
`029_Constant_Multiple_Rule` both belong to section 3.3's "State the constant,
constant multiple, and power rules." `UNIQUE(lo_id, name)` on `concept` permits
this; `UNIQUE(concept_id, card_type)` on `flashcard` is what prevents a duplicate
card of the same type per concept.

## 5. File layout

```
tools/import_concept_flashcards.py   new build tool (extraction + SQL emission)
tools/flashcard_lo_mapping.csv       generated mapping, reviewable, with flags
flashcards_db/init/01_schema.sql     unchanged
flashcards_db/init/02_seed.sql       hierarchy only, 3 sample cards removed
flashcards_db/init/03_concept_cards.sql  75 concepts + 75 cards  [generated]
```

Init files apply in filename order on first boot of an empty volume, so foreign
keys resolve without extra sequencing.

`tools/` is gitignored; both tools are tracked with `git add -f`, matching how
`tools/generate_flashcards_seed.py` and `tools/check_phase1_package.ps1` are
already handled.

## 6. Verification

No completion claim is made until these run and pass, with output shown:

1. **Counts**: 45 chapters, 195 LOs, 75 concepts, 75 cards.
2. **Completeness per deck** (the silent-omission guard): for each of the 150
   sides, the source count of text-bearing shapes plus image shapes must equal
   the number of blocks in the emitted JSON. Any mismatch fails the import.
3. **Round trip**: every JSON blob pulled back out of MySQL parses, and its
   SHA-256 matches the bytes the generator emitted.
4. **Negative controls still reject**: duplicate `(concept_id, card_type)`
   returns ERROR 1062; a flashcard citing a phantom concept returns ERROR 1452.
5. **Coverage gap**: the existing demo query re-run, reporting how many of the
   195 LOs still have no card. Expected to remain large; 75 cards cannot cover
   195 objectives.
6. **Visual spot-check**: about 5 cards rendered from their JSON and compared
   against the original decks, including at least one text-only deck (from the 5
   with no images) and one math-heavy deck.
7. **Generator determinism**: running the import twice produces byte-identical
   SQL, hash-checked, matching how the existing seed generator was verified.

## 7. Risks and accepted caveats

- The JSON is an interpretation of the deck, not a copy. Layout, header bands,
  fonts, and colors are dropped. A render from JSON reproduces the JSON, not the
  deck. Accepted: no downstream consumer needs the deck's exact look, and the
  decks are archived.
- Formulas remain images inside the JSON. Prose is searchable; math is not. This
  is a property of the source files, not of this design.
- The block format is unvalidated against Peter's production expectations, since
  that integration path is still unknown. Same standing caveat as the column
  naming already logged in CLAUDE.md sec 12.
- 75 mapping judgments are LLM-derived. The flagged review file is the control;
  it is a human review gate, not a proof.
- Docker is not currently running on this machine, so the load and all database
  verification steps require Docker Desktop to be started first.

## 8. Out of scope

- `problem_solution` cards. The ENUM still carries the value unpopulated, and the
  animation format decision (GIF vs browser JSON) remains open.
- Authoring new concepts or cards. This imports what exists.
- Any renderer that turns the JSON into display output.
- Multi-book support. Still one textbook row; the linear algebra corpus lands
  later (CLAUDE.md backlog 14d).
