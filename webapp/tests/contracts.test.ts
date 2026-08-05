import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import {
  ConceptCardsPayload,
  ConceptCardsPayloadGenerated,
  PracticeDeck,
  PracticeDeckGenerated,
  hasUndelimitedMath,
  parseModelJson,
} from "../lib/contracts";

const read = (p: string) => readFileSync(new URL(`../fixtures/${p}`, import.meta.url), "utf8");

describe("hasUndelimitedMath detector", () => {
  // The original 8-pattern marker list missed 11 of 15 realistic samples
  // (\pi, \to, \boxed{...} and friends); the detector now flags any backslash
  // command or stray brace outside delimited spans.
  const flagged = [
    "The value of \\pi is close to 3.14159.",
    "As h \\to 0 the quotient settles.",
    "The answer is \\boxed{42}.",
    "Speed in \\text{m/s} units.",
    "Evaluate 4^{3/2} minus 1.",
    "The result $x^2$ is positive.",
  ];
  const clean = [
    "The derivative of \\(x^2\\) at \\(x = 3\\).",
    "As \\(h \\to 0\\) the quotient settles.",
    "The price is $5 and later $10.",
    "Write h^(2/3) plainly on the label.",
    "A perfectly ordinary sentence.",
  ];
  for (const s of flagged) {
    it(`flags ${JSON.stringify(s)}`, () => expect(hasUndelimitedMath(s)).toBe(true));
  }
  for (const s of clean) {
    it(`passes ${JSON.stringify(s)}`, () => expect(hasUndelimitedMath(s)).toBe(false));
  }
});

describe("concept cards contract", () => {
  it("accepts the valid fixture", () => {
    expect(ConceptCardsPayload.safeParse(JSON.parse(read("concept_cards.json"))).success).toBe(true);
  });
  it("rejects the invalid fixture and names the missing field", () => {
    const r = ConceptCardsPayload.safeParse(JSON.parse(read("concept_cards_invalid.json")));
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("final_answer_latex");
  });
});

describe("concept card prose must delimit its math", () => {
  // The exact string that shipped on run f811b5f4's card back, where "4^{3/2}"
  // reached the student as literal braces and carets.
  const RAW = "Evaluate at t=4 (using 4^{3/2}=8, 4^{5/2}=32) minus the value at t=1.";
  const withStepProse = (prose: string) => {
    const p = JSON.parse(read("concept_cards.json"));
    p.cards[0].back.steps[0].prose = prose;
    return p;
  };

  it("rejects undelimited math in freshly generated prose, quoting the offender", () => {
    const r = ConceptCardsPayloadGenerated.safeParse(withStepProse(RAW));
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("back.steps[0].prose");
  });
  it("accepts the same expression once delimited", () => {
    const fixed = "Evaluate at \\(t=4\\) (using \\(4^{3/2}=8\\), \\(4^{5/2}=32\\)) minus the value at \\(t=1\\).";
    expect(ConceptCardsPayloadGenerated.safeParse(withStepProse(fixed)).success).toBe(true);
  });
  // The reading contract must stay looser: cards already stored with raw math
  // have to keep rendering, or the whole tab goes blank instead of one line
  // looking wrong.
  it("still accepts stored cards that contain raw math", () => {
    expect(ConceptCardsPayload.safeParse(withStepProse(RAW)).success).toBe(true);
  });
  it("does not flag prose whose math is fully delimited", () => {
    expect(ConceptCardsPayloadGenerated.safeParse(JSON.parse(read("concept_cards.json"))).success).toBe(true);
  });
});

describe("concept card nullable fields may be omitted", () => {
  // Run f811b5f4 burned a retry because the model omitted the unused half of
  // each exactly-one-of pair instead of writing an explicit null.
  it("accepts a card that omits central_prose and a step's latex", () => {
    const p = JSON.parse(read("concept_cards.json"));
    const card = p.cards[0];
    card.front.central_latex = "x^{2}";
    delete card.front.central_prose;
    card.back.steps[0].prose = "Some explanation.";
    delete card.back.steps[0].latex;
    const r = ConceptCardsPayload.safeParse(p);
    expect(r.success).toBe(true);
    // Omitted keys normalize to null so downstream renderers see one shape.
    expect(r.success && r.data.cards[0].front.central_prose).toBe(null);
    expect(r.success && r.data.cards[0].back.steps[0].latex).toBe(null);
  });
  it("still rejects a card that omits BOTH halves of the pair", () => {
    const p = JSON.parse(read("concept_cards.json"));
    delete p.cards[0].front.central_latex;
    delete p.cards[0].front.central_prose;
    expect(ConceptCardsPayload.safeParse(p).success).toBe(false);
  });
});

describe("practice deck contract", () => {
  it("accepts the valid fixture", () => {
    expect(PracticeDeck.safeParse(JSON.parse(read("practice_deck.json"))).success).toBe(true);
  });
  it("rejects an empty deck", () => {
    expect(PracticeDeck.safeParse(JSON.parse(read("practice_deck_invalid.json"))).success).toBe(false);
  });
  // The overview slide renders one headline equation per step, so a step with
  // no "primary" would render an empty card. The message must name the step id:
  // the pipeline feeds this error string straight back to the model on retry.
  it("rejects freshly generated output whose step carries no primary equation", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[1].equations = deck.steps[1].equations.map((e: any) => ({ ...e, style: "secondary" }));
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain(deck.steps[1].id);
  });
  // Regression, run 6c0a4fb4: the last step's boxed answer IS its headline, and
  // headlineEquation() resolves "final" ahead of "primary" for exactly that
  // reason. Demanding a primary here was stricter than the renderer and failed a
  // perfectly good deck on both attempts, so the whole stage produced nothing.
  it("accepts a final step whose headline is its boxed final equation", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    const last = deck.steps[deck.steps.length - 1];
    last.equations = last.equations.filter((e: any) => e.style === "final" || e.style === "secondary");
    expect(last.equations.some((e: any) => e.style === "final")).toBe(true);
    expect(last.equations.some((e: any) => e.style === "primary")).toBe(false);
    expect(PracticeDeckGenerated.safeParse(deck).success).toBe(true);
  });
  // Regression, run 6c0a4fb4 first attempt: the model omitted `cards` on every
  // step, which is the honest encoding of "this step has no side cards", and the
  // deck was rejected wholesale. An absent array now means an empty one.
  it("accepts steps that omit the cards array entirely", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    for (const s of deck.steps) delete s.cards;
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.steps[0].cards).toEqual([]);
  });
  // The reading contract must stay looser than the generation gate. Decks cached
  // in MySQL predate the headline rule, and Results.tsx revalidates every
  // artifact before rendering it, so tightening PracticeDeck here would blank the
  // whole Practice Deck tab for those decks rather than degrade one card.
  it("still accepts a cached deck that predates the primary-equation rule", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[2].equations = deck.steps[2].equations.filter((e: any) => e.style === "rule");
    deck.steps[3].equations = deck.steps[3].equations.map((e: any) => ({ ...e, style: "secondary" }));
    deck.steps[4].equations = [];
    expect(PracticeDeckGenerated.safeParse(deck).success).toBe(false);
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  // Run 5f033a30: the model wrote the problem statement's math undelimited in
  // prompt and packed the task sentence into problem.latex via \text{}, so the
  // side panel rendered as one line-broken equation of centered prose. Both are
  // generation-gate rules only: the cached deck must keep rendering.
  it("rejects freshly generated output whose problem.prompt carries undelimited math", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.problem.prompt = "A probe's distance is d(t) = (t - 4)^{1/3} meters; find d'(4).";
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("problem.prompt");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("rejects freshly generated output whose problem.latex carries task language in text", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.problem.latex = "d(t) = (t-4)^{1/3}, \\qquad \\text{show } d'(4) \\text{ does not exist}";
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("task language");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("allows units and labels in problem.latex text blocks", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.problem.latex = "g(t) = 6t - t^{2}, \\quad 0 \\le t \\le 6, \\quad \\text{capacity } 30 \\text{ liters}";
    expect(PracticeDeckGenerated.safeParse(deck).success).toBe(true);
  });
  // Titles and visual captions are typeset (delimited math belongs there);
  // labels painted inside an SVG figure cannot render LaTeX at all.
  it("rejects freshly generated output whose step title carries undelimited math", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[3].title = "Analyze the Sign of h^{2/3}";
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("title");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("accepts delimited math in step titles", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[3].title = "Analyze the Sign of \\(h^{2/3}\\)";
    expect(PracticeDeckGenerated.safeParse(deck).success).toBe(true);
  });
  it("rejects a concept card title carrying LaTeX", () => {
    const p = JSON.parse(read("concept_cards.json"));
    p.cards[0].front.title = "Limit of \\(f\\) at a Point";
    const r = ConceptCardsPayloadGenerated.safeParse(p);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("front.title");
    expect(ConceptCardsPayload.safeParse(p).success).toBe(true);
  });
  it("rejects equation and side-card labels carrying LaTeX", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[0].equations[0].label = "\\frac{dy}{dx} SETUP";
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("equation[0] label");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("rejects an undelimited callout title", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    const step = deck.steps.find((s: any) => s.callout);
    expect(step).toBeTruthy();
    step.callout.title = "Watch the h^{2/3} term";
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("callout title");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("rejects figure-drawn labels that carry LaTeX", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[0].visual = {
      kind: "number_line",
      range: [-2, 2],
      points: [{ x: 0, label: "h = 0", closed: false }],
      intervals: [
        { from: -2, to: 0, label: "h^{2/3} > 0", tone: "positive" },
        { from: 0, to: 2, label: "positive", tone: "positive" },
      ],
      caption: "Sign of \\(h^{2/3}\\) around zero.",
    };
    const r = PracticeDeckGenerated.safeParse(deck);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.success ? "" : r.error.issues)).toContain("interval[0]");
    expect(PracticeDeck.safeParse(deck).success).toBe(true);
  });
  it("rejects a deck whose last step lacks a final equation", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    const last = deck.steps[deck.steps.length - 1];
    last.equations = last.equations.map((e: any) => ({ ...e, style: "primary" }));
    expect(PracticeDeck.safeParse(deck).success).toBe(false);
  });
});

describe("deck step visuals", () => {
  const plot = {
    kind: "plot",
    curves: [{ expr: "sin(2*x)^3", label: "y", emphasis: "primary" }],
    domain: [0, 1.5708],
    marks: [{ x: 0.2618, label: "x = pi/12" }],
    caption: "The function over one arch.",
  };
  const numberLine = {
    kind: "number_line",
    range: [-2, 2],
    points: [{ x: 0, label: "0", closed: true }],
    intervals: [{ from: 0, to: 2, label: "+", tone: "positive" }],
    caption: "Sign of the derivative.",
  };
  const table = {
    kind: "table",
    columns: ["x", "f(x)"],
    rows: [["0.9", "1.71"]],
    caption: "Approaching the limit.",
  };
  const withVisual = (visual: unknown) => {
    const deck = JSON.parse(read("practice_deck.json"));
    deck.steps[0].visual = visual;
    return PracticeDeck.safeParse(deck);
  };
  const issues = (r: any) => JSON.stringify(r.success ? "" : r.error.issues);

  it("accepts each visual kind", () => {
    expect(withVisual(plot).success).toBe(true);
    expect(withVisual(numberLine).success).toBe(true);
    expect(withVisual(table).success).toBe(true);
  });
  // The point of the whole design: the model never states a coordinate, so the
  // only way to draw a wrong curve is a wrong expression, and it must not parse
  // silently. compileExpr runs inside zod for exactly this.
  it("rejects an expression outside the closed vocabulary", () => {
    const r = withVisual({ ...plot, curves: [{ expr: "wiggle(x)", label: "y", emphasis: "primary" }] });
    expect(r.success).toBe(false);
    expect(issues(r)).toContain("wiggle");
  });
  it("rejects implicit multiplication in an expression", () => {
    const r = withVisual({ ...plot, curves: [{ expr: "2x+1", label: "y", emphasis: "primary" }] });
    expect(r.success).toBe(false);
  });
  it("rejects an unknown visual kind", () => {
    expect(withVisual({ kind: "hologram", caption: "no" }).success).toBe(false);
  });
  it("rejects a reversed domain", () => {
    const r = withVisual({ ...plot, domain: [2, 0] });
    expect(r.success).toBe(false);
    expect(issues(r)).toContain("domain");
  });
  it("rejects a mark outside the domain", () => {
    const r = withVisual({ ...plot, marks: [{ x: 99, label: "off the page" }] });
    expect(r.success).toBe(false);
    expect(issues(r)).toContain("outside the domain");
  });
  it("rejects a plot without exactly one primary curve", () => {
    const two = [
      { expr: "x", label: "a", emphasis: "primary" },
      { expr: "x^2", label: "b", emphasis: "primary" },
    ];
    expect(withVisual({ ...plot, curves: two }).success).toBe(false);
  });
  it("rejects a table row whose width does not match the columns", () => {
    const r = withVisual({ ...table, rows: [["0.9", "1.71", "extra"]] });
    expect(r.success).toBe(false);
    expect(issues(r)).toContain("columns");
  });
  it("rejects a number_line interval outside the range", () => {
    const r = withVisual({ ...numberLine, intervals: [{ from: -9, to: 9, label: "+", tone: "positive" }] });
    expect(r.success).toBe(false);
  });
  // visual is optional, so the pre-visual decks in the MySQL cache stay valid.
  it("accepts a deck with no visual on any step", () => {
    expect(PracticeDeck.safeParse(JSON.parse(read("practice_deck.json"))).success).toBe(true);
  });
});

describe("parseModelJson", () => {
  it("strips code fences", () => {
    const r = parseModelJson(ConceptCardsPayload, "```json\n" + read("concept_cards.json") + "\n```");
    expect(r.ok).toBe(true);
  });
  it("fails helpfully on prose", () => {
    const r = parseModelJson(ConceptCardsPayload, "I could not generate cards.");
    expect(r.ok).toBe(false);
  });
});
