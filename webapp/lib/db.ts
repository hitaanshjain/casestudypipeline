// webapp/lib/db.ts
// Data layer against flashcards_db (flashcards_db/init/01_schema.sql, six-table core).
// Every identifier below was verified against 01_schema.sql / 02_seed.sql, not guessed.
import mysql, { Pool } from "mysql2/promise";
import type { TConceptCard, TConceptCardsPayload, TPracticeDeck } from "./contracts";

export class DbUnavailableError extends Error {}

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      // Real compose creds (flashcards_db/docker-compose.yml), not the skeleton's guess.
      user: process.env.MYSQL_USER ?? "flashcards_user",
      password: process.env.MYSQL_PASSWORD ?? "change_me_user",
      database: process.env.MYSQL_DATABASE ?? "flashcards",
      connectionLimit: 4,
    });
  }
  return pool;
}

// Test-only escape hatch for direct pool access (negative-control tests need to bypass
// the cache/store helpers to hit the schema's constraints directly). Never exposed in prod.
export const _testPool: (() => Pool) | undefined =
  process.env.NODE_ENV === "production" ? undefined : getPool;

async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows as T[];
  } catch (e: any) {
    if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "PROTOCOL_CONNECTION_LOST"].includes(e.code)) {
      throw new DbUnavailableError(e.message);
    }
    throw e;
  }
}

// Sibling to q() for INSERTs: same catch-and-map logic, but returns the mysql2 result
// header (insertId) instead of rows. Every write in this file must go through here so
// connection-level failures surface as DbUnavailableError, per the module's contract.
async function exec(sql: string, params: any[] = []): Promise<{ insertId: number }> {
  try {
    const [result]: any = await getPool().query(sql, params);
    return result as { insertId: number };
  } catch (e: any) {
    if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "PROTOCOL_CONNECTION_LOST"].includes(e.code)) {
      throw new DbUnavailableError(e.message);
    }
    throw e;
  }
}

export async function dbAvailable(): Promise<boolean> {
  try {
    await q("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// The corpus's book_tag (e.g. "openstax_calc1", used throughout card JSON and
// contracts.ts's TConceptCard.source.book_tag) is NOT the same string as
// textbook.book_key in the DB (e.g. "openstax_calculus_v1", set by
// tools/generate_flashcards_seed.py from book_map.json's separate book_key field).
// 01_schema.sql has no book_tag column, so bridge the two identifiers here instead of
// changing the seeded schema. Unknown tags fall through unchanged (forward-compatible
// with a caller that already passes a book_key, or a future book whose tag == its key).
const BOOK_TAG_TO_KEY: Record<string, string> = {
  openstax_calc1: "openstax_calculus_v1",
};

export async function resolveChapter(
  bookTag: string,
  section: string
): Promise<{ chapterId: number; title: string } | null> {
  const bookKey = BOOK_TAG_TO_KEY[bookTag] ?? bookTag;
  // chapter rows are one per textbook SECTION; section_number ("5.4") is its own
  // column, separate from name ("Integration Formulas and the Net Change Theorem").
  const rows = await q<{ chapterId: number; title: string }>(
    `SELECT c.id AS chapterId, c.name AS title
     FROM chapter c
     JOIN textbook t ON t.id = c.textbook_id
     WHERE t.book_key = ? AND c.section_number = ?`,
    [bookKey, section]
  );
  return rows[0] ?? null;
}

export async function getCachedConceptCards(chapterId: number): Promise<TConceptCard[]> {
  const rows = await q<{ front_content: Buffer; back_content: Buffer }>(
    `SELECT f.front_content, f.back_content FROM flashcard f
     JOIN concept co ON co.id = f.concept_id
     JOIN learning_objective lo ON lo.id = co.lo_id
     WHERE lo.chapter_id = ? AND f.card_type = 'concept_example'
       AND f.front_format = 'json' AND f.back_format = 'json'`,
    [chapterId]
  );
  return rows.map((r) => {
    const front = JSON.parse(r.front_content.toString());
    return {
      concept_name: front.concept_name,
      front: front.front,
      back: JSON.parse(r.back_content.toString()),
      source: front.source,
    };
  });
}

export async function getCachedPracticeDeck(chapterId: number): Promise<TPracticeDeck | null> {
  const rows = await q<{ back_content: Buffer }>(
    `SELECT f.back_content FROM flashcard f
     JOIN concept co ON co.id = f.concept_id
     JOIN learning_objective lo ON lo.id = co.lo_id
     WHERE lo.chapter_id = ? AND f.card_type = 'problem_solution'
       AND f.front_format = 'json' AND f.back_format = 'json' LIMIT 1`,
    [chapterId]
  );
  return rows[0] ? JSON.parse(rows[0].back_content.toString()) : null;
}

// learning_objective.ordinal is an explicit SMALLINT column (not implied by id order);
// it is contiguous 1..N per chapter in the seed, but matched by value here regardless.
async function loIdForOrdinal(chapterId: number, ordinal: number | null): Promise<number> {
  if (ordinal !== null) {
    const exact = await q<{ id: number }>(
      `SELECT id FROM learning_objective WHERE chapter_id = ? AND ordinal = ?`,
      [chapterId, ordinal]
    );
    if (exact[0]) return exact[0].id;
  }
  const fallback = await q<{ id: number }>(
    `SELECT id FROM learning_objective WHERE chapter_id = ? ORDER BY ordinal LIMIT 1`,
    [chapterId]
  );
  if (!fallback[0]) throw new Error(`chapter ${chapterId} has no learning objectives`);
  return fallback[0].id;
}

// concept.ordinal is NOT NULL with no default; compute the next value for this LO.
async function nextConceptOrdinal(loId: number): Promise<number> {
  const rows = await q<{ nextOrdinal: number }>(
    `SELECT COALESCE(MAX(ordinal), 0) + 1 AS nextOrdinal FROM concept WHERE lo_id = ?`,
    [loId]
  );
  return rows[0].nextOrdinal;
}

export async function storeConceptCards(
  chapterId: number,
  payload: TConceptCardsPayload
): Promise<number> {
  let stored = 0;
  for (const card of payload.cards) {
    const loId = await loIdForOrdinal(chapterId, card.source.lo_ordinal);
    const ordinal = await nextConceptOrdinal(loId);
    // concept has UNIQUE(lo_id, name): storing the same concept_name twice under the
    // same LO is rejected by the schema, not silently allowed as a new row.
    const { insertId: conceptId } = await exec(
      `INSERT INTO concept (lo_id, name, ordinal) VALUES (?, ?, ?)`,
      [loId, card.concept_name, ordinal]
    );
    const frontBlob = JSON.stringify({
      concept_name: card.concept_name,
      front: card.front,
      source: card.source,
    });
    const backBlob = JSON.stringify(card.back);
    await exec(
      `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
       VALUES (?, 'concept_example', ?, 'json', ?, 'json')`,
      [conceptId, frontBlob, backBlob]
    );
    stored++;
  }
  return stored;
}

export async function storePracticeDeck(
  chapterId: number,
  deck: TPracticeDeck,
  problemFront: object
): Promise<void> {
  const first = await q<{ id: number }>(
    `SELECT co.id FROM concept co
     JOIN learning_objective lo ON lo.id = co.lo_id
     WHERE lo.chapter_id = ? ORDER BY co.id LIMIT 1`,
    [chapterId]
  );
  let conceptId: number;
  if (first[0]) {
    conceptId = first[0].id;
  } else {
    const loId = await loIdForOrdinal(chapterId, null);
    const ordinal = await nextConceptOrdinal(loId);
    const inserted = await exec(
      `INSERT INTO concept (lo_id, name, ordinal) VALUES (?, ?, ?)`,
      [loId, deck.title, ordinal]
    );
    conceptId = inserted.insertId;
  }
  await exec(
    `INSERT INTO flashcard (concept_id, card_type, front_content, front_format, back_content, back_format)
     VALUES (?, 'problem_solution', ?, 'json', ?, 'json')`,
    [conceptId, JSON.stringify(problemFront), JSON.stringify(deck)]
  );
}
