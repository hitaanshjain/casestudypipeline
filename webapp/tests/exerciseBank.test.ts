// webapp/tests/exerciseBank.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { rmSync } from "fs";
import { loadBank, validateBank, clearBankCache, chapterOf } from "../lib/exerciseBank";
import { validFile, writeBank } from "./helpers/bankFixture";

let dirs: string[] = [];
function bank(files: Record<string, unknown>[], figurePages?: number[]): string {
  const d = writeBank(files, figurePages);
  dirs.push(d);
  return d;
}

describe("exerciseBank loader", () => {
  beforeEach(() => { clearBankCache(); dirs.forEach((d) => rmSync(d, { recursive: true, force: true })); dirs = []; });

  it("returns [] for a missing directory", () => {
    expect(loadBank("Z:/does/not/exist")).toEqual([]);
  });

  it("loads and sorts files, and chapterOf reads the chapter", () => {
    const d = bank([validFile()]);
    const files = loadBank(d);
    expect(files).toHaveLength(1);
    expect(chapterOf(files[0])).toBe(3);
  });

  it("caches per dir until clearBankCache", () => {
    const d = bank([validFile()]);
    expect(loadBank(d)).toBe(loadBank(d));
  });
});

describe("validateBank", () => {
  beforeEach(() => { clearBankCache(); dirs.forEach((d) => rmSync(d, { recursive: true, force: true })); dirs = []; });

  it("passes a valid bank", () => {
    expect(validateBank(bank([validFile()]))).toEqual([]);
  });

  it("flags non-contiguous numbering", () => {
    const f = validFile();
    (f.exercises as any)[2].number = 5;
    expect(validateBank(bank([f])).join()).toMatch(/not contiguous/);
  });

  it("flags non-ASCII text", () => {
    const f = validFile();
    (f.exercises as any)[0].text = "Find 4 \u00d7 7."; // multiplication sign
    expect(validateBank(bank([f])).join()).toMatch(/non-ASCII/);
  });

  it("flags available inconsistent with kind", () => {
    const f = validFile();
    (f.exercises as any)[2].available = true; // graph must be unavailable
    expect(validateBank(bank([f])).join()).toMatch(/inconsistent with kind/);
  });

  it("flags a graph exercise whose page render is missing", () => {
    expect(validateBank(bank([validFile()], [])).join()).toMatch(/missing figures\/p200\.png/);
  });

  it("flags book_page outside exercise_pages", () => {
    const f = validFile();
    (f.exercises as any)[0].book_page = 500;
    expect(validateBank(bank([f])).join()).toMatch(/outside exercise_pages/);
  });

  it("rejects unknown keys via strict schema", () => {
    const f = validFile({ surprise: true });
    expect(validateBank(bank([f])).join()).toMatch(/schema/);
  });

  it("flags a cross-file numbering gap within a chapter", () => {
    const a = validFile();
    const b = validFile({
      section: "3.2",
      section_title: "The Derivative as a Function",
      exercise_pages: [212, 215],
      exercises: [{ number: 10, text: "Use the definition of the derivative to find f'(x) for f(x) = 6.", kind: "symbolic", available: true, book_page: 212 }],
    });
    expect(validateBank(bank([a, b])).join()).toMatch(/gap between/);
  });

  it("passes the COMMITTED bank (real files, if any)", () => {
    clearBankCache();
    expect(validateBank()).toEqual([]);
  });
});
