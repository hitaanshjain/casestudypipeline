// webapp/app/api/runs/[id]/artifacts/[name]/route.ts
// Serves individual run artifacts by exact filename. The allowlist itself is the
// traversal guard: a name is checked against a fixed list of literal strings
// before it ever touches path.join/the filesystem, so "../../CLAUDE.md" (or any
// other name not on the list) 404s without a path ever being constructed from it.
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { runDir } from "@/lib/runStore";

export const runtime = "nodejs";

const ALLOWED_ARTIFACTS = ["case_study.pdf", "case_study.tex", "concept_cards.json", "practice_deck.json", "compile.log"] as const;
type AllowedArtifact = (typeof ALLOWED_ARTIFACTS)[number];

const CONTENT_TYPES: Record<AllowedArtifact, string> = {
  "case_study.pdf": "application/pdf",
  "case_study.tex": "text/plain",
  "concept_cards.json": "application/json",
  "practice_deck.json": "application/json",
  "compile.log": "text/plain",
};

function isAllowed(name: string): name is AllowedArtifact {
  return (ALLOWED_ARTIFACTS as readonly string[]).includes(name);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id, name } = await params;

  if (!isAllowed(name)) {
    return NextResponse.json({ error: "unknown artifact name" }, { status: 404 });
  }

  let dir: string;
  try {
    dir = runDir(id);
  } catch {
    return NextResponse.json({ error: "run not found" }, { status: 404 });
  }

  const filePath = path.join(dir, name);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "artifact not found" }, { status: 404 });
  }

  const buffer = readFileSync(filePath);
  return new NextResponse(buffer, { headers: { "Content-Type": CONTENT_TYPES[name] } });
}
