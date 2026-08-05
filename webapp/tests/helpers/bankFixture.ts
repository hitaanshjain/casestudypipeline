// webapp/tests/helpers/bankFixture.ts
// Writes a temporary exercise-bank directory for tests. Not a test file itself.
import { mkdtempSync, mkdirSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

export function validFile(overrides: Record<string, unknown> = {}) {
  return {
    book_key: "openstax_calculus_v1",
    section: "3.1",
    section_title: "Defining the Derivative",
    exercise_pages: [199, 202],
    stem_note: "Shared stems are copied into each exercise's text.",
    exercises: [
      { number: 1, text: "Find the slope of the secant line for f(x) = 4x + 7 between x = 1 and x = 2.", kind: "symbolic", available: true, book_page: 199 },
      { number: 2, text: "The table shows position s(t) at times t = 0, 1, 2: s = 0, 4, 16. Estimate the average velocity on [0, 2].", kind: "table", available: true, book_page: 199 },
      { number: 3, text: "Use the graph of f shown to estimate the slope of the tangent line at x = 1.", kind: "graph", available: false, book_page: 200 },
    ],
    ...overrides,
  };
}

/** Writes files into a fresh temp bank dir; figurePages get placeholder PNGs. Returns the dir. */
export function writeBank(files: Record<string, unknown>[], figurePages: number[] = [200]): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "bank-"));
  mkdirSync(path.join(dir, "figures"), { recursive: true });
  for (const p of figurePages) writeFileSync(path.join(dir, "figures", `p${p}.png`), "png");
  files.forEach((f, i) => writeFileSync(path.join(dir, `file_${i}.json`), JSON.stringify(f, null, 2)));
  return dir;
}
