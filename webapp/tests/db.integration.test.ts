// webapp/tests/db.integration.test.ts
// Requires the live flashcards_db container; skips cleanly (describe.skip) when absent
// so CI without Docker still passes green. Run against a container reset per the
// Task 7 brief before trusting these (fresh volume -> 45 chapters / 195 LOs / 0 / 0).
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import {
  dbAvailable,
  resolveChapter,
  storeConceptCards,
  getCachedConceptCards,
  getCachedPracticeDeck,
  storePracticeDeck,
  _testPool,
} from "../lib/db";
import { ConceptCardsPayload, PracticeDeck } from "../lib/contracts";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../fixtures/${p}`, import.meta.url), "utf8"));
const up = await dbAvailable();
const d = up ? describe : describe.skip;

if (!up) {
  // eslint-disable-next-line no-console
  console.warn("db.integration.test.ts: flashcards_db unreachable, skipping live-DB tests");
}

d("db integration (live MySQL)", () => {
  it("resolves openstax_calc1 section 5.4 to a chapter row", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    expect(ch).not.toBeNull();
    expect(ch!.title).toBe("Integration Formulas and the Net Change Theorem");
  });

  it("round-trips concept cards and hits the cache", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const payload = ConceptCardsPayload.parse(read("concept_cards.json"));
    const stored = await storeConceptCards(ch!.chapterId, payload);
    expect(stored).toBe(payload.cards.length);
    const cached = await getCachedConceptCards(ch!.chapterId);
    expect(cached.length).toBeGreaterThanOrEqual(payload.cards.length);
    expect(cached[0].front.title).toBeTruthy();
    expect(cached.some((c) => c.concept_name === payload.cards[0].concept_name)).toBe(true);
  });

  it("round-trips the practice deck", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const deck = PracticeDeck.parse(read("practice_deck.json"));
    await storePracticeDeck(ch!.chapterId, deck, deck.problem);
    const cached = await getCachedPracticeDeck(ch!.chapterId);
    expect(cached?.animationId).toBe(deck.animationId);
  });

  it("rejects a second concept_example flashcard on the same concept (UNIQUE(concept_id, card_type))", async () => {
    const ch = await resolveChapter("openstax_calc1", "5.4");
    const loId = (
      await _testPool!().query("SELECT id FROM learning_objective WHERE chapter_id = ? LIMIT 1", [ch!.chapterId])
    )[0] as any[];
    const [conceptRes]: any = await _testPool!().query(
      "INSERT INTO concept (lo_id, name, ordinal) VALUES (?, ?, ?)",
      [loId[0].id, `Negative Control Concept ${Date.now()}`, 999]
    );
    const conceptId = conceptRes.insertId;
    // First concept_example card succeeds.
    await _testPool!().query(
      `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
       VALUES (?, 'concept_example', ?, 'json', ?, 'json')`,
      [conceptId, JSON.stringify({ a: 1 }), JSON.stringify({ b: 1 })]
    );
    // Second concept_example card on the SAME concept id must violate the UNIQUE key.
    let error: any = null;
    try {
      await _testPool!().query(
        `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
         VALUES (?, 'concept_example', ?, 'json', ?, 'json')`,
        [conceptId, JSON.stringify({ a: 2 }), JSON.stringify({ b: 2 })]
      );
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.code).toBe("ER_DUP_ENTRY");
  });

  it("rejects a flashcard insert against a nonexistent concept_id (FK constraint)", async () => {
    let error: any = null;
    try {
      await _testPool!().query(
        `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
         VALUES (?, 'concept_example', ?, 'json', ?, 'json')`,
        [999999999, JSON.stringify({ a: 1 }), JSON.stringify({ b: 1 })]
      );
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.code).toBe("ER_NO_REFERENCED_ROW_2");
  });
});
