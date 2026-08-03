import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { ConceptCardsPayload, PracticeDeck, PracticeDeckGenerated, parseModelJson } from "../lib/contracts";

const read = (p: string) => readFileSync(new URL(`../fixtures/${p}`, import.meta.url), "utf8");

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
  it("rejects a deck whose last step lacks a final equation", () => {
    const deck = JSON.parse(read("practice_deck.json"));
    const last = deck.steps[deck.steps.length - 1];
    last.equations = last.equations.map((e: any) => ({ ...e, style: "primary" }));
    expect(PracticeDeck.safeParse(deck).success).toBe(false);
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
