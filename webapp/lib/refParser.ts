// webapp/lib/refParser.ts
// Pure parser for textbook references ("3.41", "Chapter 3, Problem 41", "3.4 ex 118").
// Client-safe: no imports. A bare C.N decimal is ALWAYS chapter.exercise, never
// section.problem — OpenStax numbers exercises continuously through a chapter.
export type ParsedRef = { chapter: number; number: number; sectionHint?: string };

const EX_WORD = "(?:exercise|problem|prob|ex|no\\.?|#)";
const SECTIONED = new RegExp(`^(?:section|sec)?\\s*\\.?\\s*(\\d{1,2})\\s*\\.\\s*(\\d{1,2})\\s*,?\\s*${EX_WORD}\\s*(\\d{1,4})$`);
const CHAPTERED = new RegExp(`^(?:chapter|ch)\\s*\\.?\\s*(\\d{1,2})\\s*,?\\s*${EX_WORD}?\\s*(\\d{1,4})$`);
const BARE = /^(\d{1,2})\s*[.\-#]\s*(\d{1,4})$/;

export function parseRef(raw: string): ParsedRef | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!s) return null;
  let m = s.match(SECTIONED);
  if (m) return check({ chapter: +m[1], number: +m[3], sectionHint: `${+m[1]}.${+m[2]}` });
  m = s.match(CHAPTERED);
  if (m) return check({ chapter: +m[1], number: +m[2] });
  m = s.match(BARE);
  if (m) return check({ chapter: +m[1], number: +m[2] });
  return null;
}

function check(ref: ParsedRef): ParsedRef | null {
  return ref.chapter >= 1 && ref.number >= 1 ? ref : null;
}
