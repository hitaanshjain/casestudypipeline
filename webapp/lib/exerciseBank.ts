// webapp/lib/exerciseBank.ts
// The textbook exercise bank: zod schema, loader, and mechanical validation for
// references/openstax_calculus_v1/exercises/*.json. Server-only (reads the filesystem).
import fs from "fs";
import path from "path";
import { z } from "zod";
import { REFERENCES_DIR } from "./paths";
import { parseRef } from "./refParser";
import { buildCitation, OPENSTAX_ATTRIBUTION } from "./citation";

export const EXERCISES_DIR = path.join(REFERENCES_DIR, "openstax_calculus_v1", "exercises");

export const ExerciseSchema = z
  .object({
    number: z.number().int().positive(),
    text: z.string().min(10),
    kind: z.enum(["symbolic", "table", "graph", "figure"]),
    available: z.boolean(),
    book_page: z.number().int().positive(),
    notes: z.string().optional(),
  })
  .strict();

export const ExerciseFileSchema = z
  .object({
    book_key: z.literal("openstax_calculus_v1"),
    section: z.string().regex(/^\d+\.(\d+|review)$/),
    section_title: z.string().min(1),
    exercise_pages: z.tuple([z.number().int().positive(), z.number().int().positive()]),
    stem_note: z.string().optional(),
    exercises: z.array(ExerciseSchema).min(1),
  })
  .strict();

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseFile = z.infer<typeof ExerciseFileSchema>;

export function chapterOf(file: ExerciseFile): number {
  return parseInt(file.section.split(".")[0], 10);
}

let cache: { dir: string; files: ExerciseFile[] } | null = null;

export function clearBankCache(): void {
  cache = null;
}

/** Load, schema-validate, and sort all bank files. [] when the dir does not exist. Throws on invalid committed files (validateBank reports instead of throwing). */
export function loadBank(dir: string = EXERCISES_DIR): ExerciseFile[] {
  if (cache && cache.dir === dir) return cache.files;
  if (!fs.existsSync(dir)) return [];
  const files: ExerciseFile[] = [];
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    files.push(ExerciseFileSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"))));
  }
  files.sort((a, b) => chapterOf(a) - chapterOf(b) || a.exercises[0].number - b.exercises[0].number);
  cache = { dir, files };
  return files;
}

const ASCII = /^[\x20-\x7E\n\t]*$/;

/**
 * Structural check on \( \) inline-math delimiters in exercise text: balanced,
 * unnested, non-empty. Delimiters are optional (plain-prose exercises carry
 * none), but a malformed pair would render as raw LaTeX in the UI.
 */
function scanDelims(t: string): string | null {
  let depth = 0;
  for (let i = 0; i < t.length - 1; i++) {
    const pair = t.slice(i, i + 2);
    if (pair === "\\(") {
      depth++;
      if (depth > 1) return "nested \\( math delimiters";
      i++;
    } else if (pair === "\\)") {
      depth--;
      if (depth < 0) return "\\) without matching \\(";
      i++;
    }
  }
  if (depth !== 0) return "unclosed \\( math delimiter";
  if (t.includes("\\(\\)") || t.includes("\\( \\)")) return "empty math run";
  return null;
}

/** Mechanical bank validation per the design's section 4. Returns human-readable violations; [] = pass. */
export function validateBank(dir: string = EXERCISES_DIR): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const parsed: { name: string; file: ExerciseFile }[] = [];
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    let json: unknown;
    try {
      json = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    } catch (e) {
      out.push(`${name}: invalid JSON (${e})`);
      continue;
    }
    const r = ExerciseFileSchema.safeParse(json);
    if (!r.success) {
      const issue = r.error.issues[0];
      out.push(`${name}: schema: ${issue.path.join(".")} ${issue.message}`);
      continue;
    }
    parsed.push({ name, file: r.data });
  }
  for (const { name, file } of parsed) {
    const [lo, hi] = file.exercise_pages;
    if (lo > hi) out.push(`${name}: exercise_pages out of order`);
    if (!ASCII.test(file.section_title) || (file.stem_note !== undefined && !ASCII.test(file.stem_note))) {
      out.push(`${name}: non-ASCII in file metadata`);
    }
    let prev: number | null = null;
    for (const ex of file.exercises) {
      const tag = `${name} #${ex.number}`;
      if (prev !== null && ex.number !== prev + 1) out.push(`${tag}: not contiguous after ${prev}`);
      prev = ex.number;
      if (!ASCII.test(ex.text) || (ex.notes !== undefined && !ASCII.test(ex.notes))) out.push(`${tag}: non-ASCII text`);
      const delimErr = scanDelims(ex.text);
      if (delimErr) out.push(`${tag}: ${delimErr}`);
      const servable = ex.kind === "symbolic" || ex.kind === "table";
      if (ex.available !== servable) out.push(`${tag}: available=${ex.available} inconsistent with kind=${ex.kind}`);
      if (ex.book_page < lo || ex.book_page > hi) out.push(`${tag}: book_page ${ex.book_page} outside exercise_pages`);
      if ((ex.kind === "graph" || ex.kind === "figure") && !fs.existsSync(path.join(dir, "figures", `p${ex.book_page}.png`))) {
        out.push(`${tag}: missing figures/p${ex.book_page}.png`);
      }
    }
  }
  const byChapter = new Map<number, { name: string; file: ExerciseFile }[]>();
  for (const p of parsed) {
    const ch = chapterOf(p.file);
    byChapter.set(ch, [...(byChapter.get(ch) ?? []), p]);
  }
  for (const [ch, group] of byChapter) {
    group.sort((a, b) => a.file.exercises[0].number - b.file.exercises[0].number);
    for (let i = 1; i < group.length; i++) {
      const prevLast = group[i - 1].file.exercises[group[i - 1].file.exercises.length - 1].number;
      const first = group[i].file.exercises[0].number;
      if (first !== prevLast + 1) {
        out.push(`chapter ${ch}: gap between ${group[i - 1].name} (ends ${prevLast}) and ${group[i].name} (starts ${first})`);
      }
    }
  }
  return out;
}

export type ResolveResult =
  | { found: true; available: true; ref: { chapter: number; section: string; number: number }; text: string; kind: "symbolic" | "table"; citation: string; attribution: string; hinted_section?: string }
  | { found: true; available: false; reason: "needs_figure"; ref: { chapter: number; section: string; number: number }; kind: "graph" | "figure"; citation: string; attribution: string; hinted_section?: string }
  | { found: false; reason: "bad_ref" }
  | { found: false; reason: "not_extracted"; chapters: number[] }
  | { found: false; reason: "no_such_exercise"; chapter: number; max: number };

/** Resolve a reference string against the bank. Never throws on user input. */
export function resolveRef(input: string, dir: string = EXERCISES_DIR): ResolveResult {
  const parsed = parseRef(input);
  if (!parsed) return { found: false, reason: "bad_ref" };
  const files = loadBank(dir);
  const inChapter = files.filter((f) => chapterOf(f) === parsed.chapter);
  if (inChapter.length === 0) {
    const chapters = [...new Set(files.map(chapterOf))].sort((a, b) => a - b);
    return { found: false, reason: "not_extracted", chapters };
  }
  const file = inChapter.find(
    (f) => parsed.number >= f.exercises[0].number && parsed.number <= f.exercises[f.exercises.length - 1].number
  );
  if (!file) {
    const last = inChapter[inChapter.length - 1];
    return { found: false, reason: "no_such_exercise", chapter: parsed.chapter, max: last.exercises[last.exercises.length - 1].number };
  }
  const ex = file.exercises.find((e) => e.number === parsed.number);
  if (!ex) {
    const last = inChapter[inChapter.length - 1];
    return { found: false, reason: "no_such_exercise", chapter: parsed.chapter, max: last.exercises[last.exercises.length - 1].number };
  }
  const ref = { chapter: parsed.chapter, section: file.section, number: ex.number };
  const citation = buildCitation(file.section, ex.number);
  const hinted = parsed.sectionHint !== undefined && parsed.sectionHint !== file.section ? { hinted_section: parsed.sectionHint } : {};
  const kind = ex.kind;
  if (kind === "graph" || kind === "figure") {
    return { found: true, available: false, reason: "needs_figure", ref, kind, citation, attribution: OPENSTAX_ATTRIBUTION, ...hinted };
  }
  return { found: true, available: true, ref, text: ex.text, kind, citation, attribution: OPENSTAX_ATTRIBUTION, ...hinted };
}
