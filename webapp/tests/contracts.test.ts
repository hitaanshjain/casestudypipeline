import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { ConceptCardsPayload, PracticeDeck, parseModelJson } from "../lib/contracts";

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
