These three cards are validated examples of the format_version 2 concept card
contract. Each was chosen to exercise a different branch of that contract, so
between them every conditional path these three were chosen for gets hit at
least once. They do not exercise every path the validator checks: the
honest-gap branch (`lo_ordinal: null`), `problem_solution` cards, a 6-row
back, and every failure path are untested by this set.

- `power_rule.json`: symbolic front (`central.latex`), a 3-entry variable key,
  and a back with an aligned two-row derivation ending on the bold conclusion
  row. Exercises the latex-central path, non-empty variable_key, and a
  non-trivial aligned block (G07, G08, G09).
- `intermediate_value.json`: non-symbolic front (`central.text`), no
  variable_key at all, and a back with zero aligned rows, five rows of plain
  prose reasoning. Exercises the text-central path and the "no variable_key,
  no aligned rows" branch (G07, G08).
- `definite_integral.json`: symbolic front with a variable_key at the 5-entry
  cap, including `\int` as an identifier that only the multi-character key
  entry `\int_{a}^{b}` covers by substring. Exercises the key-size ceiling and
  the notation-coverage substring rule (G08, G09).

Validate all three with:

```
python tools/check_flashcard_json.py flashcard_examples_v2/*.json
```

Expected: three `PASS` lines and exit code 0.

Spec: `prompts/flashcard_concept_card_prompt_v2.md`. Validator source of truth:
`tools/check_flashcard_json.py`.
