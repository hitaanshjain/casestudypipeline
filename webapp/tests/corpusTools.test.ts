// webapp/tests/corpusTools.test.ts
import { describe, it, expect } from "vitest";
import path from "path";
import { readCorpusFile, listBooks, runCorpusTool } from "../lib/corpusTools";
import { REPO_ROOT, REFERENCES_DIR } from "../lib/paths";

describe("corpusTools path fence", () => {
  it("rejects a relative path that escapes references/ (../CLAUDE.md)", () => {
    expect(() => readCorpusFile("../CLAUDE.md")).toThrow(/escapes references\//);
  });

  it("rejects an absolute path outside references/", () => {
    const outside = path.join(REPO_ROOT, "CLAUDE.md");
    expect(() => readCorpusFile(outside)).toThrow(/escapes references\//);
  });

  it("reads openstax_calculus_v1/book_map.json successfully", () => {
    const raw = readCorpusFile("openstax_calculus_v1/book_map.json");
    const parsed = JSON.parse(raw);
    expect(parsed.book_key).toBe("openstax_calculus_v1");
    expect(Array.isArray(parsed.sections)).toBe(true);
  });

  it("rejects reading the corpus PDF", () => {
    expect(() => readCorpusFile("calculus-textbook.pdf")).toThrow(/PDF files are not readable/);
  });

  it("rejects a PDF path regardless of case", () => {
    expect(() => readCorpusFile("Calculus-Textbook.PDF")).toThrow(/PDF files are not readable/);
  });
});

describe("listBooks", () => {
  it("lists only directories under references/, excluding the top-level PDF", () => {
    const books = listBooks();
    expect(books).toContain("openstax_calculus_v1");
    expect(books).not.toContain("calculus-textbook.pdf");
  });
});

describe("runCorpusTool dispatch", () => {
  it("list_books returns a JSON array string", () => {
    const out = JSON.parse(runCorpusTool("list_books", {}));
    expect(Array.isArray(out)).toBe(true);
  });

  it("read_corpus_file reads a real section file via the tool dispatcher", () => {
    const out = runCorpusTool("read_corpus_file", { path: "openstax_calculus_v1/book_map.json" });
    expect(JSON.parse(out).book_key).toBe("openstax_calculus_v1");
  });

  it("throws for an unknown tool name", () => {
    expect(() => runCorpusTool("delete_everything", {})).toThrow(/unknown tool/);
  });
});

// Sanity check that REFERENCES_DIR itself is where we think it is, so the escape tests
// above are actually exercising the fence and not silently no-op-ing against a bad path.
describe("paths sanity", () => {
  it("REFERENCES_DIR is a subdirectory of REPO_ROOT", () => {
    expect(REFERENCES_DIR.startsWith(REPO_ROOT)).toBe(true);
  });
});
