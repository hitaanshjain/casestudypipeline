// webapp/tests/replyParsing.test.ts
// Unit tests for the model-reply parsers. These are the live-run hardening surface:
// every case here is a reply shape a real model plausibly sends that the original
// LF-and-exactly-three-backticks parser would have silently dropped.
import { describe, it, expect } from "vitest";
import {
  normalizeNewlines,
  parseFileBlocks,
  stripFences,
  findErrorLineOutsideFences,
  parseStage1Reply,
  parseCriticReply,
  validateCapturedMapping,
  STAGE1_REQUIRED_FILES,
} from "../lib/replyParsing";

describe("normalizeNewlines", () => {
  it("converts CRLF and lone CR to LF", () => {
    expect(normalizeNewlines("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
  });
});

describe("parseFileBlocks", () => {
  it("parses the baseline LF shape the pipeline asks for", () => {
    const reply = "FILE: primary.md\n```\nhello\n```\n";
    expect(parseFileBlocks(reply)).toEqual({ "primary.md": "hello" });
  });

  it("parses a CRLF reply and normalizes content to LF", () => {
    const reply = "FILE: primary.md\r\n```\r\nline one\r\nline two\r\n```\r\n";
    expect(parseFileBlocks(reply)).toEqual({ "primary.md": "line one\nline two" });
  });

  it("parses multiple files in one reply", () => {
    const reply = "FILE: a.md\n```\nAAA\n```\n\nFILE: b.txt\n```\nBBB\n```\n";
    expect(parseFileBlocks(reply)).toEqual({ "a.md": "AAA", "b.txt": "BBB" });
  });

  it("tolerates a language tag on the fence", () => {
    expect(parseFileBlocks("FILE: lo_mapping.json\n```json\n{}\n```")).toEqual({ "lo_mapping.json": "{}" });
  });

  it("tolerates a 4-backtick fence wrapping 3-backtick content", () => {
    const reply = "FILE: primary.md\n````markdown\ntext\n```\ninner\n```\n````";
    expect(parseFileBlocks(reply)).toEqual({ "primary.md": "text\n```\ninner\n```" });
  });

  it("tolerates decorated FILE lines (bold, heading, backticked name)", () => {
    expect(parseFileBlocks("**FILE: a.md**\n```\nA\n```")).toEqual({ "a.md": "A" });
    expect(parseFileBlocks("### FILE: b.md\n```\nB\n```")).toEqual({ "b.md": "B" });
    expect(parseFileBlocks("FILE: `c.md`\n```\nC\n```")).toEqual({ "c.md": "C" });
    expect(parseFileBlocks("FILE d.md\n```\nD\n```")).toEqual({ "d.md": "D" });
  });

  it("tolerates blank lines between the FILE line and the fence", () => {
    expect(parseFileBlocks("FILE: a.md\n\n\n```\nA\n```")).toEqual({ "a.md": "A" });
  });

  it("parses an empty fenced block as empty content", () => {
    expect(parseFileBlocks("FILE: a.md\n```\n```")).toEqual({ "a.md": "" });
  });

  it("returns {} when no FILE block is present", () => {
    expect(parseFileBlocks("I would write phase1_error.txt but I have no tools.")).toEqual({});
  });
});

describe("stripFences", () => {
  it("unwraps a fenced block", () => {
    expect(stripFences("```latex\n\\documentclass{article}\n```")).toBe("\\documentclass{article}");
  });

  it("unwraps a CRLF fenced block and normalizes to LF", () => {
    expect(stripFences("```\r\na\r\nb\r\n```")).toBe("a\nb");
  });

  it("unwraps a 4-backtick fence", () => {
    expect(stripFences("````\nbody\n````")).toBe("body");
  });

  it("returns trimmed input when nothing wraps it", () => {
    expect(stripFences("  \\documentclass{article}  ")).toBe("\\documentclass{article}");
  });

  // Each of these shipped the wrapper prose into case_study.tex before the fix, which is
  // a guaranteed tectonic failure that burns the stage's single retry.
  it.each([
    ["leading prose", "Here is the complete LaTeX source:\n\n```latex\nTEX\n```"],
    ["trailing prose", "```latex\nTEX\n```\n\nThis compiles in one pass."],
    ["prose on both sides", "Sure!\n\n```latex\nTEX\n```\n\nLet me know if you want changes."],
  ])("extracts the fenced block despite %s", (_label, reply) => {
    expect(stripFences(reply)).toBe("TEX");
  });
});

describe("findErrorLineOutsideFences", () => {
  it("finds a bare ERROR line", () => {
    const reply = "Here is my verdict.\nERROR: calibration failed: critic 4480 vs generator 4520.\n";
    expect(findErrorLineOutsideFences(reply)).toBe("ERROR: calibration failed: critic 4480 vs generator 4520.");
  });

  it("ignores an ERROR line that appears only inside a fenced block", () => {
    const reply =
      'FILE: lo_mapping.json\n```json\n{"critique_findings": ["ERROR: calibration failed is the template"]}\n```\n';
    expect(findErrorLineOutsideFences(reply)).toBeNull();
  });

  it("returns null when there is no ERROR line", () => {
    expect(findErrorLineOutsideFences("Wrote lo_mapping.json: critique completed.")).toBeNull();
  });
});

describe("parseStage1Reply", () => {
  const block = (name: string, body: string) => `FILE: ${name}\n\`\`\`\n${body}\n\`\`\`\n\n`;

  it("accepts a full five-file package", () => {
    const reply =
      block("primary.md", "P") +
      block("supporting_01.md", "S1") +
      block("supporting_02.md", "S2") +
      block("lo_mapping.json", "{}") +
      block("verified_answer.txt", "V");
    const out = parseStage1Reply(reply);
    expect(out.kind).toBe("files");
    if (out.kind === "files") expect(Object.keys(out.files)).toHaveLength(5);
  });

  it("accepts the no-coverage minimum: lo_mapping.json + verified_answer.txt only", () => {
    const reply = block("lo_mapping.json", '{"no_primary_available": true}') + block("verified_answer.txt", "V");
    expect(parseStage1Reply(reply).kind).toBe("files");
  });

  it("reports missing required files when verified_answer.txt is absent", () => {
    const out = parseStage1Reply(block("lo_mapping.json", "{}"));
    expect(out).toEqual({ kind: "missing", missing: ["verified_answer.txt"] });
  });

  it("reports the generator's own error file as an error, using its first line", () => {
    const reply = block("phase1_error.txt", "ERROR: no corpus coverage: nothing found.\ntrailing noise");
    expect(parseStage1Reply(reply)).toEqual({ kind: "error", message: "ERROR: no corpus coverage: nothing found." });
  });

  it("requires exactly the two load-bearing files", () => {
    expect([...STAGE1_REQUIRED_FILES]).toEqual(["lo_mapping.json", "verified_answer.txt"]);
  });
});

describe("parseCriticReply", () => {
  it("treats a bare ERROR line as a calibration failure", () => {
    const reply =
      "ERROR: calibration failed: independent re-derivation disagrees with verified_answer.txt (first disagreement: total: critic 4480 vs generator 4520). Package not certified; do not feed to phase 2.";
    const out = parseCriticReply(reply);
    expect(out.kind).toBe("error");
    if (out.kind === "error") expect(out.message).toContain("calibration failed");
  });

  it("treats a phase1_error.txt block as a failure, using its first line", () => {
    const reply =
      "FILE: phase1_error.txt\n```\nERROR: unreadable package: lo_mapping.json is empty. Package not certified; do not feed to phase 2.\n```";
    const out = parseCriticReply(reply);
    expect(out.kind).toBe("error");
    if (out.kind === "error") expect(out.message).toContain("unreadable package");
  });

  it("captures a returned lo_mapping.json on the pass path", () => {
    const reply =
      'FILE: lo_mapping.json\n```json\n{"critique_status": "completed"}\n```\n\nWrote lo_mapping.json: critique completed, score 0.75, 11 findings';
    const out = parseCriticReply(reply);
    expect(out.kind).toBe("lo_mapping");
    if (out.kind === "lo_mapping") expect(JSON.parse(out.content).critique_status).toBe("completed");
  });

  it("lets an ERROR quoted INSIDE the returned lo_mapping.json pass (fenced text is never a gate signal)", () => {
    const reply =
      'FILE: lo_mapping.json\n```json\n{"critique_findings": ["the template reads ERROR: calibration failed: ..."], "critique_status": "completed"}\n```';
    expect(parseCriticReply(reply).kind).toBe("lo_mapping");
  });

  it("fails safe when both signals are present: the error wins", () => {
    const reply =
      "FILE: phase1_error.txt\n```\nERROR: calibration failed: total: critic 1 vs generator 2. Package not certified; do not feed to phase 2.\n```\n\n" +
      'FILE: lo_mapping.json\n```json\n{"critique_status": "completed"}\n```';
    expect(parseCriticReply(reply).kind).toBe("error");
  });

  it("reports lo_mapping content that does not parse as JSON as unusable", () => {
    expect(parseCriticReply("FILE: lo_mapping.json\n```\nnot json at all\n```")).toEqual({ kind: "unusable" });
  });

  it("reports a JSON array (not an object) as unusable", () => {
    expect(parseCriticReply("FILE: lo_mapping.json\n```json\n[1,2,3]\n```")).toEqual({ kind: "unusable" });
  });

  it("reports narration with neither signal as unusable", () => {
    expect(parseCriticReply("I have completed the audit and would update lo_mapping.json in place.")).toEqual({
      kind: "unusable",
    });
  });

  // The whole point of the fail-safe ordering: a model that emphasizes its failure line
  // must not be read as a pass just because it also echoed the mapping back.
  it.each([
    ["bold", "**ERROR: calibration failed: total: critic 4480 vs generator 4520. Package not certified.**"],
    ["blockquote", "> ERROR: calibration failed: total: critic 4480 vs generator 4520. Package not certified."],
    ["bullet", "- ERROR: calibration failed: total: critic 4480 vs generator 4520. Package not certified."],
    ["heading", "## ERROR: calibration failed: total: critic 4480 vs generator 4520. Package not certified."],
  ])("treats a %s-decorated ERROR line as a failure even when a mapping block follows", (_label, errorLine) => {
    const reply = `${errorLine}\n\nFILE: lo_mapping.json\n\`\`\`json\n{"critique_status": "completed"}\n\`\`\``;
    const out = parseCriticReply(reply);
    expect(out.kind).toBe("error");
    if (out.kind === "error") expect(out.message.startsWith("ERROR:")).toBe(true);
  });

  it("recovers a FENCED ERROR line when there is no mapping to certify", () => {
    const reply =
      "```\nERROR: calibration failed: total: critic 4480 vs generator 4520. Package not certified; do not feed to phase 2.\n```";
    const out = parseCriticReply(reply);
    expect(out.kind).toBe("error");
    if (out.kind === "error") expect(out.message).toContain("calibration failed");
  });

  it("does not read 'ERRORS: none found' prose as a calibration failure", () => {
    const reply =
      'ERRORS: none found in the extracts.\n\nFILE: lo_mapping.json\n```json\n{"critique_status": "completed"}\n```';
    expect(parseCriticReply(reply).kind).toBe("lo_mapping");
  });

  it("keys a path-prefixed file name by its basename", () => {
    const reply = 'FILE: output_path/lo_mapping.json\n```json\n{"critique_status": "completed"}\n```';
    expect(parseCriticReply(reply).kind).toBe("lo_mapping");
  });
});

describe("validateCapturedMapping", () => {
  const draft = JSON.stringify({ sections: [{ role: "PRIMARY" }], confidence_score: 0.85, critique_status: "pending" });

  it("accepts a completed audit that preserves every draft field", () => {
    const captured = JSON.stringify({ sections: [{ role: "PRIMARY" }], confidence_score: 0.85, critique_status: "completed" });
    expect(validateCapturedMapping(captured, draft)).toEqual({ ok: true });
  });

  it("rejects a mapping still carrying the pending sentinel (no audit happened)", () => {
    const out = validateCapturedMapping(draft, draft);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toContain("critique_status");
  });

  it("rejects an abbreviated mapping that dropped sections (the silent topic-resolution killer)", () => {
    const captured = JSON.stringify({ confidence_score: 0.85, critique_status: "completed" });
    const out = validateCapturedMapping(captured, draft);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toContain("sections");
  });
});
