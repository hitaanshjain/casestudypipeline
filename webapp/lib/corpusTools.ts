// webapp/lib/corpusTools.ts
// Path-fenced, read-only tools over references/ for the Anthropic tool-use loop in llm.ts.
// Two tools only: list the book directories, read one text file. Both refuse to leave
// REFERENCES_DIR and refuse PDFs (the 52MB calculus-textbook.pdf lives at the top of
// references/ alongside the openstax_calculus_v1/ corpus and must never be handed to a model).
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { REFERENCES_DIR } from "./paths";

export function listBooks(): string[] {
  return readdirSync(REFERENCES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function fence(relPath: string): string {
  const abs = path.resolve(REFERENCES_DIR, relPath);
  if (!abs.startsWith(path.resolve(REFERENCES_DIR) + path.sep)) {
    throw new Error(`path escapes references/: ${relPath}`);
  }
  return abs;
}

export function readCorpusFile(relPath: string): string {
  const abs = fence(relPath);
  if (abs.toLowerCase().endsWith(".pdf")) throw new Error("PDF files are not readable through this tool");
  return readFileSync(abs, "utf8");
}

export const corpusToolDefs = [
  {
    name: "list_books",
    description: "List the textbook corpora available under references/. Returns directory names.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "read_corpus_file",
    description:
      "Read one text file from references/, e.g. 'openstax_calculus_v1/book_map.json' or 'openstax_calculus_v1/sections/<file>'. Text files only; PDFs are rejected.",
    input_schema: {
      type: "object" as const,
      properties: { path: { type: "string" as const } },
      required: ["path"],
    },
  },
];

export function runCorpusTool(name: string, input: any): string {
  if (name === "list_books") return JSON.stringify(listBooks());
  if (name === "read_corpus_file") return readCorpusFile(String(input?.path ?? ""));
  throw new Error(`unknown tool ${name}`);
}
