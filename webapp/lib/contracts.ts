// webapp/lib/contracts.ts
import { z } from "zod";
import { compileExpr } from "./plotExpr";

const noDollar = (s: string) => !s.includes("$");
const latexField = z.string().min(1).refine(noDollar, "no $ delimiters in latex fields");

export const VariableKeyEntry = z.object({
  symbol: z.string().min(1),
  meaning: z.string().min(1),
});

// A field that is semantically "null or a value", where the model may simply
// OMIT the key instead of writing an explicit null. Both halves of an
// exactly-one-of pair look optional to a model filling in the one it wants, and
// on run f811b5f4 that cost a full concept-cards retry (~6.4k output tokens) on
// a reply whose content was otherwise fine. Normalizing undefined to null keeps
// the refinements below written against a single absent value.
const omittableLatex = latexField.nullish().transform((v) => v ?? null);
const omittableProse = z.string().min(1).nullish().transform((v) => v ?? null);

export const ConceptCardFront = z
  .object({
    title: z.string().min(1).max(60),
    subtitle: z.string().min(1),
    central_latex: omittableLatex,
    central_prose: omittableProse,
    variable_key: z.array(VariableKeyEntry).max(8),
    description_main: z.string().min(1),
    description_support: z.string().min(1),
  })
  .refine((f) => (f.central_latex === null) !== (f.central_prose === null), {
    message: "exactly one of central_latex / central_prose must be non-null",
  });

export const ConceptCardStep = z
  .object({ latex: omittableLatex, prose: omittableProse })
  .refine((s) => s.latex !== null || s.prose !== null, { message: "step needs latex or prose" });

export const ConceptCardBack = z.object({
  question: z.string().min(1),
  steps: z.array(ConceptCardStep).min(1).max(10),
  final_answer_latex: latexField,
  footer: z.string().min(1),
});

export const ConceptCard = z.object({
  concept_name: z.string().min(1),
  front: ConceptCardFront,
  back: ConceptCardBack,
  source: z.object({
    book_tag: z.string().min(1),
    section: z.string().min(1),
    lo_ordinal: z.number().int().positive().nullable(),
  }),
});

export const ConceptCardsPayload = z.object({
  cards: z.array(ConceptCard),
  skipped_concepts: z.array(z.object({ name: z.string(), reason: z.string() })).optional(),
});

// MathJax only typesets math inside \( \) delimiters, so a bare "4^{3/2}" in a
// prose field reaches the student as literal braces and carets. Run f811b5f4
// shipped exactly that on a card back. Strip the correctly delimited spans
// first, then look for LaTeX left over in what is supposed to be plain text.
const DELIMITED_MATH = /\\\([\s\S]*?\\\)/g;
const LATEX_MARKER = /\^\{|_\{|\\frac|\\dfrac|\\sqrt|\\left|\\int|\\sum/;

export function hasUndelimitedMath(s: string): boolean {
  return LATEX_MARKER.test(s.replace(DELIMITED_MATH, ""));
}

// The generation gate: fresh model output only. Deliberately NOT on
// ConceptCardsPayload, which is also the reading contract for stored artifacts
// and cached rows — tightening it there would blank the Concept Cards tab for
// every card already generated with raw math, instead of degrading one line.
// Same split, and the same reasoning, as PracticeDeck / PracticeDeckGenerated.
export const ConceptCardsPayloadGenerated = ConceptCardsPayload.superRefine((payload, ctx) => {
  payload.cards.forEach((card, i) => {
    const check = (path: string, s: string | null | undefined) => {
      if (typeof s === "string" && hasUndelimitedMath(s)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `cards[${i}].${path}: math must be wrapped in \\( \\) delimiters, found raw LaTeX in prose: "${s}"`,
        });
      }
    };
    check("front.subtitle", card.front.subtitle);
    check("front.description_main", card.front.description_main);
    check("front.description_support", card.front.description_support);
    check("front.central_prose", card.front.central_prose);
    card.front.variable_key.forEach((v, j) => check(`front.variable_key[${j}].meaning`, v.meaning));
    check("back.question", card.back.question);
    card.back.steps.forEach((s, j) => check(`back.steps[${j}].prose`, s.prose));
    check("back.footer", card.back.footer);
  });
});

export const DeckEquation = z.object({
  label: z.string(),
  latex: latexField,
  style: z.enum(["primary", "rule", "secondary", "final"]),
});
export const DeckSideCard = z.object({
  label: z.string(),
  latex: latexField,
  tone: z.enum(["blue", "violet"]),
});
export const DeckCallout = z.object({
  type: z.enum(["goal", "tip", "memory", "check", "warning", "success"]),
  title: z.string().min(1),
  text: z.string().min(1),
});
// ---------------------------------------------------------------------------
// Step visuals. The model declares WHAT to draw; the renderer computes every
// plotted point from `expr` (see lib/plotExpr.ts for why). exprField compiles the
// expression here at validation time, so a malformed or out-of-vocabulary
// function fails the stage and pipeline.ts hands the parse error back on retry.
// ---------------------------------------------------------------------------
const exprField = z
  .string()
  .min(1)
  .superRefine((s, ctx) => {
    const r = compileExpr(s);
    if (!r.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `expr "${s}" does not compile: ${r.error}` });
    }
  });

const pair = z.tuple([z.number(), z.number()]);

const PlotShape = z.object({
  kind: z.literal("plot"),
  // Two curves rather than a separate tangent-line kind: one mechanism covers a
  // tangent at a point, a comparison of two functions, and a function drawn
  // against its derivative.
  curves: z
    .array(z.object({ expr: exprField, label: z.string().min(1), emphasis: z.enum(["primary", "secondary"]) }))
    .min(1)
    .max(2),
  domain: pair,
  yRange: pair.optional(),
  marks: z.array(z.object({ x: z.number(), label: z.string().min(1) })).max(3).optional(),
  shade: z.object({ from: z.number(), to: z.number(), label: z.string().min(1) }).optional(),
  caption: z.string().min(1),
});

// A sign chart is this kind with "+" and "-" interval labels, so it needs no kind
// of its own.
const NumberLineShape = z.object({
  kind: z.literal("number_line"),
  range: pair,
  points: z.array(z.object({ x: z.number(), label: z.string().min(1), closed: z.boolean() })).max(5),
  intervals: z
    .array(
      z.object({
        from: z.number(),
        to: z.number(),
        label: z.string().min(1),
        tone: z.enum(["positive", "negative", "neutral"]),
      })
    )
    .max(5),
  caption: z.string().min(1),
});

// Headers are plain text because they are labels; cells are LaTeX because they
// are values.
const TableShape = z.object({
  kind: z.literal("table"),
  columns: z.array(z.string().min(1)).min(2).max(4),
  rows: z.array(z.array(latexField)).min(1).max(8),
  caption: z.string().min(1),
});

// The per-kind rules live on the UNION rather than on each member, so the members
// stay plain ZodObjects and z.discriminatedUnion keeps its fast discriminator path.
export const DeckVisual = z
  .discriminatedUnion("kind", [PlotShape, NumberLineShape, TableShape])
  .superRefine((v, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (v.kind === "plot") {
      const [a, b] = v.domain;
      if (!(a < b)) bad(`plot domain must satisfy domain[0] < domain[1], got [${a}, ${b}]`);
      if (v.yRange && !(v.yRange[0] < v.yRange[1])) {
        bad(`plot yRange must satisfy yRange[0] < yRange[1], got [${v.yRange[0]}, ${v.yRange[1]}]`);
      }
      const primaries = v.curves.filter((c) => c.emphasis === "primary").length;
      if (primaries !== 1) bad(`a plot needs exactly one curve with emphasis 'primary', found ${primaries}`);
      for (const m of v.marks ?? []) {
        if (m.x < a || m.x > b) bad(`plot mark x=${m.x} ('${m.label}') lies outside the domain [${a}, ${b}]`);
      }
      if (v.shade) {
        if (!(v.shade.from < v.shade.to)) bad(`plot shade must satisfy from < to, got ${v.shade.from}, ${v.shade.to}`);
        if (v.shade.from < a || v.shade.to > b) bad(`plot shade lies outside the domain [${a}, ${b}]`);
      }
    } else if (v.kind === "number_line") {
      const [a, b] = v.range;
      if (!(a < b)) bad(`number_line range must satisfy range[0] < range[1], got [${a}, ${b}]`);
      for (const p of v.points) {
        if (p.x < a || p.x > b) bad(`number_line point x=${p.x} ('${p.label}') lies outside the range [${a}, ${b}]`);
      }
      for (const iv of v.intervals) {
        if (!(iv.from < iv.to)) bad(`number_line interval '${iv.label}' must satisfy from < to`);
        if (iv.from < a || iv.to > b) bad(`number_line interval '${iv.label}' lies outside the range [${a}, ${b}]`);
      }
    } else {
      v.rows.forEach((row, i) => {
        if (row.length !== v.columns.length) {
          bad(`table row ${i + 1} has ${row.length} cells but there are ${v.columns.length} columns`);
        }
      });
    }
  });

export const DeckStep = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  caption: z.string(),
  equations: z.array(DeckEquation),
  // Defaulted, not required: a step with no side cards is normal, and models
  // omit the key entirely rather than sending []. Requiring it rejected an
  // otherwise-valid deck on every step at once (run 6c0a4fb4, first attempt).
  cards: z.array(DeckSideCard).default([]),
  callout: DeckCallout.nullable().optional(),
  // At most one per step: if two ideas need pictures, they are two steps. Optional
  // and nullable, so decks cached before this feature validate unchanged, which is
  // why these rules can live in the shared shape rather than the generation gate.
  visual: DeckVisual.nullable().optional(),
});

const PracticeDeckShape = z.object({
  schemaVersion: z.literal("1.1"),
  renderer: z.object({ id: z.literal("math-animation-dark-sidebar"), version: z.string() }),
  animationId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  problem: z.object({ prompt: z.string().min(1), latex: latexField, answerLatex: latexField }),
  steps: z.array(DeckStep).min(3).max(10),
  reference: z.object({
    equations: z.array(z.object({ title: z.string().min(1), latex: latexField, text: z.string(), stepId: z.string() })),
  }),
});

type PracticeDeckShapeOut = z.infer<typeof PracticeDeckShape>;

// Structural rules every deck must satisfy, whatever its age: these hold for
// decks cached in MySQL long before any later rule existed.
function checkDeckStructure(deck: PracticeDeckShapeOut, ctx: z.RefinementCtx): void {
  const last = deck.steps[deck.steps.length - 1];
  // Guard: steps may already be invalid (e.g. length 0) when this runs, since
  // superRefine still executes after a field-level check like min(3) fails.
  // Without this guard an empty steps array throws a raw TypeError here
  // instead of surfacing as a normal safeParse failure.
  if (last && !last.equations.some((e) => e.style === "final")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "last step must contain a style:'final' equation" });
  }
  const ids = new Set(deck.steps.map((s) => s.id));
  for (const r of deck.reference.equations) {
    if (!ids.has(r.stepId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `reference stepId '${r.stepId}' matches no step` });
    }
  }
}

// The reading contract: stored artifacts and decks served from the MySQL cache.
// Deliberately does NOT enforce the headline-equation rule below. Decks cached
// before that rule existed must still render, and the renderer carries a
// fallback chain for exactly that case; failing them here would blank the whole
// Practice Deck tab instead, since Results.tsx revalidates every artifact it
// displays.
export const PracticeDeck = PracticeDeckShape.superRefine(checkDeckStructure);

// The generation gate: fresh model output only. The overview slide shows one
// headline equation per step, so a step with no "primary" renders an empty card.
// Enforced here rather than in PracticeDeck because this is the only point where
// failing is useful: the pipeline feeds these messages straight back to the model
// on its one retry, which is why the message names the offending step.
// Deliberately looser than the prompt, which asks for EXACTLY one primary: a
// strict count would fail the whole practice-deck stage over a harmless second
// primary, and no prompt in this pipeline has been measured against a live model.
// problem.latex is the formal statement of the GIVENS; the task sentences live in
// problem.prompt. \text{} carrying task verbs is how run 5f033a30's side panel
// became one long line-broken equation of centered prose fragments.
const TASK_TEXT_IN_LATEX = /\\text\{[^}]*\b(show|find|evaluate|determine|prove|explain|describe|compute|using)\b/i;

export const PracticeDeckGenerated = PracticeDeckShape.superRefine((deck, ctx) => {
  checkDeckStructure(deck, ctx);
  // The concept-cards delimiter gate applied to the deck's prose fields: the
  // renderer typesets only \( \)-delimited math, so raw LaTeX in prose displays
  // as source. Generation-only, like every rule a retry can fix but a cached
  // deck cannot.
  const checkProse = (path: string, s: string | null | undefined) => {
    if (typeof s === "string" && hasUndelimitedMath(s)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${path}: math must be wrapped in \\( \\) delimiters, found raw LaTeX in prose: "${s}"`,
      });
    }
  };
  // Labels drawn INSIDE an SVG figure cannot be typeset at all (MathJax outputs
  // HTML), so they must be plain text: no backslashes, no braces, no \( \).
  // Run 5f033a30-successor: interval labels like "h^{2/3} > 0" shipped as raw
  // brace soup on the number line. A bare caret ("h^(2/3)") reads fine plain.
  const PLAIN_LABEL = /[\\{}]/;
  const checkLabel = (path: string, s: string) => {
    if (PLAIN_LABEL.test(s)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${path}: figure labels are drawn as plain text and cannot render LaTeX; write it plainly (e.g. "h^(2/3) > 0" or a word like "positive"): "${s}"`,
      });
    }
  };
  checkProse("problem.prompt", deck.problem.prompt);
  checkProse("title", deck.title);
  checkProse("subtitle", deck.subtitle);
  if (TASK_TEXT_IN_LATEX.test(deck.problem.latex)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "problem.latex contains task language inside \\text{}; state only the mathematical givens there and keep the tasks in problem.prompt",
    });
  }
  deck.reference.equations.forEach((r, i) => {
    checkProse(`reference.equations[${i}].title`, r.title);
    checkProse(`reference.equations[${i}].text`, r.text);
  });
  for (const s of deck.steps) {
    checkProse(`step '${s.id}' title`, s.title);
    checkProse(`step '${s.id}' caption`, s.caption);
    if (s.callout) checkProse(`step '${s.id}' callout text`, s.callout.text);
    const v = s.visual;
    if (v) {
      checkProse(`step '${s.id}' visual caption`, v.caption);
      if (v.kind === "plot") {
        v.curves.forEach((c, i) => checkProse(`step '${s.id}' visual curve[${i}] label`, c.label));
        if (v.shade) checkProse(`step '${s.id}' visual shade label`, v.shade.label);
        (v.marks ?? []).forEach((m, i) => checkLabel(`step '${s.id}' visual mark[${i}] label`, m.label));
      } else if (v.kind === "number_line") {
        v.points.forEach((p, i) => checkLabel(`step '${s.id}' visual point[${i}] label`, p.label));
        v.intervals.forEach((iv, i) => checkLabel(`step '${s.id}' visual interval[${i}] label`, iv.label));
      } else {
        v.columns.forEach((c, i) => checkLabel(`step '${s.id}' visual column[${i}] header`, c));
      }
    }
  }
  for (const s of deck.steps) {
    // "primary" OR "final" — headlineEquation() in PracticeDeckPlayer resolves
    // `final` FIRST, because on the last step the boxed answer is the conclusive
    // line and a separate primary restating it would be redundant. Demanding a
    // primary everywhere was stricter than the renderer it protects, and it
    // failed run 6c0a4fb4's retry on exactly that step ('final-answer', which
    // carried a boxed final plus its verification and nothing else).
    if (!s.equations.some((e) => e.style === "primary" || e.style === "final")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `step '${s.id}' has no headline equation (needs a style:'primary', or a style:'final' on the last step)`,
      });
    }
  }
});

export type TConceptCardsPayload = z.infer<typeof ConceptCardsPayload>;
export type TConceptCard = z.infer<typeof ConceptCard>;
export type TPracticeDeck = z.infer<typeof PracticeDeck>;
export type TDeckVisual = z.infer<typeof DeckVisual>;

export function parseModelJson<T>(schema: z.ZodType<T>, raw: string): { ok: true; data: T } | { ok: false; error: string } {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) text = fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return { ok: false, error: "no JSON object found in model output" };
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    const result = schema.safeParse(parsed);
    if (result.success) return { ok: true, data: result.data };
    return { ok: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  } catch (e) {
    return { ok: false, error: `JSON.parse failed: ${(e as Error).message}` };
  }
}
