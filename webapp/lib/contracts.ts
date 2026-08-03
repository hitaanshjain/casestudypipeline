// webapp/lib/contracts.ts
import { z } from "zod";
import { compileExpr } from "./plotExpr";

const noDollar = (s: string) => !s.includes("$");
const latexField = z.string().min(1).refine(noDollar, "no $ delimiters in latex fields");

export const VariableKeyEntry = z.object({
  symbol: z.string().min(1),
  meaning: z.string().min(1),
});

export const ConceptCardFront = z
  .object({
    title: z.string().min(1).max(60),
    subtitle: z.string().min(1),
    central_latex: latexField.nullable(),
    central_prose: z.string().min(1).nullable(),
    variable_key: z.array(VariableKeyEntry).max(8),
    description_main: z.string().min(1),
    description_support: z.string().min(1),
  })
  .refine((f) => (f.central_latex === null) !== (f.central_prose === null), {
    message: "exactly one of central_latex / central_prose must be non-null",
  });

export const ConceptCardStep = z
  .object({ latex: latexField.nullable(), prose: z.string().min(1).nullable() })
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
  cards: z.array(DeckSideCard),
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
export const PracticeDeckGenerated = PracticeDeckShape.superRefine((deck, ctx) => {
  checkDeckStructure(deck, ctx);
  for (const s of deck.steps) {
    if (!s.equations.some((e) => e.style === "primary")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `step '${s.id}' has no style:'primary' equation (every step needs one headline equation)`,
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
