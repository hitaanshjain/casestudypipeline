// webapp/lib/replyParsing.ts
// Every "what did the model actually send back" decision lives here: pure string
// functions, no fs and no run state, so each reply shape is unit-testable without
// starting a pipeline run. Hardened for the first live-model bring-up: a real reply
// may use CRLF, longer fences, decorated FILE: lines, prose wrapped around a code
// block, or an emphasized ERROR line, none of which the original parser tolerated.

export function normalizeNewlines(s: string): string {
  return s.replace(/\r\n?/g, "\n");
}

// Leading markdown decoration a model may put in front of a line: heading marks,
// blockquote marks, list bullets, numbering, emphasis. Written as one alternation
// rather than two overlapping character classes, which backtracked quadratically on
// long runs of leading whitespace.
const LINE_DECORATION = "(?:[#>*_~-]+[ \\t]*|\\d+[.)][ \\t]*|[ \\t]+)*";

// A file block is a FILE: line (optionally decorated, with the name optionally
// wrapped in backticks or emphasis), optional blank lines, then a fence of 3+
// backticks whose closing fence must match the opening backtick count. That
// backreference is what lets a 4-backtick fence carry 3-backtick content intact.
const FILE_BLOCK_SOURCE =
  "^" +
  LINE_DECORATION +
  "FILE[`*_]*:?[`*_]*[ \\t]*[`*_]*([A-Za-z0-9._/-]+)[`*_]*[^\\n]*\\n" +
  "(?:[ \\t]*\\n)*[ \\t]*(`{3,})[A-Za-z0-9._-]*[ \\t]*\\n([\\s\\S]*?)\\n?[ \\t]*\\2";

// Models sometimes name a file by the path the prompt used (output_path/lo_mapping.json)
// rather than by its bare name. A key nothing can look up is worse than useless, so the
// basename is always what we key on.
function basename(name: string): string {
  return name.split("/").filter(Boolean).pop() ?? name;
}

export function parseFileBlocks(reply: string): Record<string, string> {
  const text = normalizeNewlines(reply);
  const files: Record<string, string> = {};
  const re = new RegExp(FILE_BLOCK_SOURCE, "gmi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    files[basename(m[1])] = m[3];
  }
  return files;
}

const ANY_FENCE_RE = /(`{3,})[A-Za-z0-9._-]*[ \t]*\n([\s\S]*?)\n?[ \t]*\1/;

// Returns the content of the first fenced block anywhere in the text, or the trimmed
// text when there is no fence. Deliberately NOT anchored to the whole reply: the single
// likeliest live-model drift is a wrapper sentence ("Here is the complete LaTeX source:")
// around an otherwise correct block, and an anchored match silently passed that prose
// through into case_study.tex, guaranteeing a compile failure.
export function stripFences(text: string): string {
  const normalized = normalizeNewlines(text).trim();
  const m = normalized.match(ANY_FENCE_RE);
  return m ? m[2] : normalized;
}

// The contract line always begins "ERROR:", but a model may emphasize or bullet it.
// Requiring the colon avoids matching ordinary prose like "ERRORS: none found".
const ERROR_LINE_RE = new RegExp("^" + LINE_DECORATION + "[`*_]*ERROR[`*_]*:");

function isErrorLine(line: string): boolean {
  return ERROR_LINE_RE.test(line.trim());
}

function cleanErrorLine(line: string): string {
  return line.trim().replace(/^(?:[#>*_~-]+[ \t]*|\d+[.)][ \t]*|[ \t]+)*/, "").replace(/[`*_]+$/, "").trim();
}

function stripAllFences(text: string): string {
  return normalizeNewlines(text).replace(/(`{3,})[A-Za-z0-9._-]*[ \t]*\n[\s\S]*?\n?[ \t]*\1/g, "");
}

// Strips every fenced block first, so text a model quotes INSIDE a returned file can
// never trip the calibration gate. Only prose outside fences counts as a real signal.
export function findErrorLineOutsideFences(reply: string): string | null {
  const line = stripAllFences(reply).split("\n").find(isErrorLine);
  return line ? cleanErrorLine(line) : null;
}

// Last-resort scan that DOES look inside fences. Only consulted after the success
// signals have been ruled out: a model told to "reply with exactly the ERROR line" may
// still fence it, and losing that message would report a format failure to the operator
// when the real event was a calibration failure.
export function findErrorLineAnywhere(reply: string): string | null {
  const line = normalizeNewlines(reply).split("\n").find(isErrorLine);
  return line ? cleanErrorLine(line) : null;
}

// ---------------------------------------------------------------------------
// Stage 1 and critic reply shapes
// ---------------------------------------------------------------------------

// The full Stage 1 package. Extracts are OPTIONAL: prompts/phase1_generator_prompt_v1.md
// emits primary.md "if and only if a PRIMARY entry exists", so an honest no-coverage
// package legitimately has no extracts. Only the mapping and the verified answer are
// load-bearing for the stages downstream.
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

const EMPTY_ERROR_MESSAGE = "the model reported an error but gave no reason";

function firstNonEmptyLine(text: string): string {
  const line = normalizeNewlines(text)
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return line ? cleanErrorLine(line) : EMPTY_ERROR_MESSAGE;
}

export function parseStage1Reply(reply: string): Stage1Reply {
  const files = parseFileBlocks(reply);
  if (files["phase1_error.txt"] !== undefined) {
    return { kind: "error", message: firstNonEmptyLine(files["phase1_error.txt"]) };
  }

  const missing = STAGE1_REQUIRED_FILES.filter((f) => files[f] === undefined);
  if (missing.length === 0) return { kind: "files", files };

  // The generator prompt tells the model to write phase1_error.txt on an honest failure
  // (no corpus coverage, unsolvable problem). Without a write tool it will most likely
  // just say the ERROR line, and reporting "missing output files" instead of that specific
  // reason would throw away the only diagnosis the model gave.
  const bare = findErrorLineAnywhere(reply);
  if (bare) return { kind: "error", message: bare };

  return { kind: "missing", missing: [...missing] };
}

export type CriticReply =
  | { kind: "error"; message: string }
  | { kind: "lo_mapping"; content: string }
  | { kind: "critique"; content: string }
  | { kind: "unusable" };

// The only top-level fields the critic owns. Measured against run f811b5f4 by
// diffing lo_mapping.generator.json against the critic's output: exactly these
// changed, while the other 18 fields were copied back byte-identical. Asking for
// a patch over these instead of the whole document saves ~1,600 output tokens a
// run, and — the real reason — makes it structurally impossible for the critic
// to drop `sections`, which would silently kill topic resolution downstream.
// `missing_concepts` is included because the critic may legitimately extend it.
export const CRITIQUE_FIELDS = [
  "critique_status",
  "critique_score",
  "critique_findings",
  "primary_assessment",
  "supporting_assessment",
  "recommended_changes",
  "search_reasonable",
  "multipart_assessment",
  "missing_concepts",
] as const;

// Precedence is fail-safe: an unambiguous error signal is checked before any success
// signal, so a reply carrying both never certifies a package. The critic prompt was
// written for a session with write tools; pipeline.ts's environment note maps those file
// writes onto these two reply shapes.
export function parseCriticReply(reply: string): CriticReply {
  const files = parseFileBlocks(reply);

  if (files["phase1_error.txt"] !== undefined) {
    return { kind: "error", message: firstNonEmptyLine(files["phase1_error.txt"]) };
  }
  const bare = findErrorLineOutsideFences(reply);
  if (bare) return { kind: "error", message: bare };

  // Preferred shape: a critique patch carrying only the fields the critic owns.
  const critique = files["critique.json"];
  if (critique !== undefined) {
    try {
      const parsed = JSON.parse(critique);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "critique", content: normalizeNewlines(critique) };
      }
    } catch {
      // Unparseable critique is not a certification: fall through.
    }
  }

  // Still accepted: the whole updated document. The critic prompt itself (a
  // tested artifact this pipeline does not edit) says to update lo_mapping.json,
  // so a model that follows it literally rather than the pipeline's patch
  // instruction must not be treated as a failure.
  const mapping = files["lo_mapping.json"];
  if (mapping !== undefined) {
    try {
      const parsed = JSON.parse(mapping);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "lo_mapping", content: normalizeNewlines(mapping) };
      }
    } catch {
      // Unparseable mapping is not a certification: fall through.
    }
  }

  // Only now, with no mapping to certify, is a fenced ERROR line worth reading.
  const fenced = findErrorLineAnywhere(reply);
  if (fenced) return { kind: "error", message: fenced };

  return { kind: "unusable" };
}

// The critic's own output checklist makes "completed" mandatory and defines "pending" as
// the un-audited sentinel, so a reply that merely echoes the draft back is not an audit.
// The key-inventory check catches the likelier live failure: a model abbreviating a 15KB
// document down to the fields it edited, which would silently strip `sections` and break
// topic resolution with no error anywhere.
export function validateCapturedMapping(
  captured: string,
  draft: string
): { ok: true } | { ok: false; reason: string } {
  let capturedObj: Record<string, unknown>;
  let draftObj: Record<string, unknown>;
  try {
    capturedObj = JSON.parse(captured);
    draftObj = JSON.parse(draft);
  } catch {
    return { ok: false, reason: "returned lo_mapping.json is not valid JSON" };
  }

  if (capturedObj.critique_status !== "completed") {
    return { ok: false, reason: `critique_status is ${JSON.stringify(capturedObj.critique_status)}, not "completed"` };
  }

  const droppedKeys = Object.keys(draftObj).filter((k) => !(k in capturedObj));
  if (droppedKeys.length > 0) {
    return { ok: false, reason: `returned lo_mapping.json dropped field(s): ${droppedKeys.join(", ")}` };
  }

  return { ok: true };
}

// Merges a critique patch onto the generator's draft. Rejects any key outside
// CRITIQUE_FIELDS rather than merging it: a confused model that put `sections`
// or `learning_objective` in its patch would otherwise overwrite Stage 1's work
// through a path built to be incapable of that.
export function mergeCritique(
  patch: string,
  draft: string
): { ok: true; merged: string } | { ok: false; reason: string } {
  let patchObj: Record<string, unknown>;
  let draftObj: Record<string, unknown>;
  try {
    patchObj = JSON.parse(patch);
  } catch {
    return { ok: false, reason: "returned critique.json is not valid JSON" };
  }
  try {
    draftObj = JSON.parse(draft);
  } catch {
    return { ok: false, reason: "the generator's lo_mapping.json is not valid JSON" };
  }

  const allowed = new Set<string>(CRITIQUE_FIELDS);
  const foreign = Object.keys(patchObj).filter((k) => !allowed.has(k));
  if (foreign.length > 0) {
    return {
      ok: false,
      reason: `critique.json carried field(s) the critic does not own: ${foreign.join(", ")}`,
    };
  }

  if (patchObj.critique_status !== "completed") {
    return {
      ok: false,
      reason: `critique_status is ${JSON.stringify(patchObj.critique_status)}, not "completed"`,
    };
  }

  const merged = { ...draftObj, ...patchObj };
  // The spread cannot drop a draft key, but assert it anyway: this file is what
  // every downstream stage reads, and a silent loss here has no other alarm.
  const dropped = Object.keys(draftObj).filter((k) => !(k in merged));
  if (dropped.length > 0) {
    return { ok: false, reason: `merge dropped field(s): ${dropped.join(", ")}` };
  }

  return { ok: true, merged: JSON.stringify(merged, null, 2) };
}
