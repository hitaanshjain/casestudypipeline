// webapp/lib/citation.ts
// Pure, client-safe citation helpers for retrieved textbook problems.
// OPENSTAX_ATTRIBUTION mirrors book_map.json's attribution_required for
// openstax_calculus_v1; keep them in sync if the corpus metadata ever changes.
export const BOOK_TITLE = "OpenStax Calculus Volume 1";
export const OPENSTAX_ATTRIBUTION = "Access for free at openstax.org.";

export type ProblemSource = { book_key: string; chapter: number; section: string; number: number };

export function buildCitation(section: string, number: number): string {
  const [ch, rest] = section.split(".");
  const where = rest === "review" ? `Chapter ${ch} Review` : `Section ${section}`;
  return `${BOOK_TITLE}, ${where}, Exercise ${number}`;
}
