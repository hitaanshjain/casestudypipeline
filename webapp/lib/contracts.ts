// webapp/lib/contracts.ts
import { z } from "zod";

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
export const DeckStep = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  caption: z.string(),
  equations: z.array(DeckEquation),
  cards: z.array(DeckSideCard),
  callout: DeckCallout.nullable().optional(),
});

export const PracticeDeck = z
  .object({
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
  })
  .superRefine((deck, ctx) => {
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
  });

export type TConceptCardsPayload = z.infer<typeof ConceptCardsPayload>;
export type TConceptCard = z.infer<typeof ConceptCard>;
export type TPracticeDeck = z.infer<typeof PracticeDeck>;

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
