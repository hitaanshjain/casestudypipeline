// webapp/lib/exerciseBank.ts
// The textbook exercise bank: zod schema, loader, and mechanical validation for
// references/openstax_calculus_v1/exercises/*.json. Server-only (reads the filesystem).
import fs from "fs";
import path from "path";
import { z } from "zod";
import { REFERENCES_DIR } from "./paths";

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
