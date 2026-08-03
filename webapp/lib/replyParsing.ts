// webapp/lib/replyParsing.ts
// Every "what did the model actually send back" decision lives here: pure string
// functions, no fs and no run state, so each reply shape is unit-testable without
// starting a pipeline run. Hardened for the first live-model bring-up: a real reply
// may use CRLF, longer fences, decorated FILE: lines, or a blank line before the
// fence, none of which the original LF-only parser tolerated.

export function normalizeNewlines(s: string): string {
  return s.replace(/\r\n?/g, "\n");
}

// A file block is a FILE: line (optionally decorated with markdown emphasis, heading
// marks, or backticks around the name), optional blank lines, then a fence of 3+
// backticks whose closing fence must match the opening backtick count. The
// backreference is what lets a 4-backtick fence carry 3-backtick content intact.
const FILE_BLOCK_SOURCE =
  "^[ \\t]*[#>*\\-_ \\t]*FILE:?[ \\t]*[`*_]*([A-Za-z0-9._/-]+)[`*_]*[^\\n]*\\n(?:[ \\t]*\\n)*[ \\t]*(`{3,})[A-Za-z0-9]*[ \\t]*\\n([\\s\\S]*?)\\n?[ \\t]*\\2";

export function parseFileBlocks(reply: string): Record<string, string> {
  const text = normalizeNewlines(reply);
  const files: Record<string, string> = {};
  const re = new RegExp(FILE_BLOCK_SOURCE, "gm");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    files[m[1]] = m[3];
  }
  return files;
}

export function stripFences(text: string): string {
  const trimmed = normalizeNewlines(text).trim();
  const m = trimmed.match(/^(`{3,})[A-Za-z0-9]*[ \t]*\n([\s\S]*?)\n?[ \t]*\1$/);
  return m ? m[2] : trimmed;
}

// Strips every fenced block first, so text a model quotes INSIDE a returned file
// (e.g. a critique finding quoting the ERROR-line template) can never trip the
// calibration gate. Only prose outside fences counts as a real error signal.
export function findErrorLineOutsideFences(reply: string): string | null {
  const withoutFences = normalizeNewlines(reply).replace(/(`{3,})[A-Za-z0-9]*[ \t]*\n[\s\S]*?\n?[ \t]*\1/g, "");
  const line = withoutFences.split("\n").find((l) => l.trim().startsWith("ERROR"));
  return line ? line.trim() : null;
}

// ---------------------------------------------------------------------------
// Stage 1 and critic reply shapes
// ---------------------------------------------------------------------------

// The full Stage 1 package. Extracts are OPTIONAL: prompts/phase1_generator_prompt_v1.md
// defines an honest no-coverage path (no_primary_available + fallback_sections) on which
// primary.md and the supporting extracts legitimately do not exist. Only the mapping and
// the verified answer are load-bearing for every downstream stage.
export const STAGE1_ALL_FILES = [
  "primary.md",
  "supporting_01.md",
  "supporting_02.md",
  "lo_mapping.json",
  "verified_answer.txt",
] as const;

export const STAGE1_REQUIRED_FILES = ["lo_mapping.json", "verified_answer.txt"] as const;

export type Stage1Reply =
  | { kind: "error"; message: string }
  | { kind: "files"; files: Record<string, string> }
  | { kind: "missing"; missing: string[] };

function firstNonEmptyLine(text: string): string {
  return (
    normalizeNewlines(text)
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? ""
  );
}

export function parseStage1Reply(reply: string): Stage1Reply {
  const files = parseFileBlocks(reply);
  if (files["phase1_error.txt"] !== undefined) {
    return { kind: "error", message: firstNonEmptyLine(files["phase1_error.txt"]) };
  }
  const missing = STAGE1_REQUIRED_FILES.filter((f) => files[f] === undefined);
  if (missing.length > 0) return { kind: "missing", missing: [...missing] };
  return { kind: "files", files };
}

export type CriticReply =
  | { kind: "error"; message: string }
  | { kind: "lo_mapping"; content: string }
  | { kind: "unusable" };

// Precedence is fail-safe: every error signal is checked before any success signal, so a
// reply carrying both never certifies a package. The critic prompt was written for a
// session with write tools; pipeline.ts's environment note maps those file writes onto
// these two reply shapes.
export function parseCriticReply(reply: string): CriticReply {
  const files = parseFileBlocks(reply);

  if (files["phase1_error.txt"] !== undefined) {
    return { kind: "error", message: firstNonEmptyLine(files["phase1_error.txt"]) };
  }
  const bare = findErrorLineOutsideFences(reply);
  if (bare) return { kind: "error", message: bare };

  const mapping = files["lo_mapping.json"];
  if (mapping !== undefined) {
    try {
      const parsed = JSON.parse(mapping);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "lo_mapping", content: normalizeNewlines(mapping) };
      }
    } catch {
      // Unparseable mapping is not a certification: fall through to unusable.
    }
  }
  return { kind: "unusable" };
}
