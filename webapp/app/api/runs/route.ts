// webapp/app/api/runs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { startRun } from "@/lib/pipeline";
import type { ProblemSource } from "@/lib/citation";

export const runtime = "nodejs";

function parseSource(s: unknown): ProblemSource | undefined {
  if (!s || typeof s !== "object") return undefined;
  const { book_key, chapter, section, number } = s as Record<string, unknown>;
  if (typeof book_key !== "string" || typeof chapter !== "number" || typeof section !== "string" || typeof number !== "number") return undefined;
  return { book_key, chapter, section, number };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.problem || typeof body.problem !== "string" || body.problem.trim().length < 10) {
    return NextResponse.json({ error: "problem text is required (10+ chars)" }, { status: 400 });
  }
  const id = await startRun({
    problem: body.problem.trim(),
    preferredContext: typeof body.preferredContext === "string" ? body.preferredContext.trim() || undefined : undefined,
    source: parseSource(body.source),
  });
  return NextResponse.json({ id });
}
