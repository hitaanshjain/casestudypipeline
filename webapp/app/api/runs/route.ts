// webapp/app/api/runs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { startRun } from "@/lib/pipeline";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.problem || typeof body.problem !== "string" || body.problem.trim().length < 10) {
    return NextResponse.json({ error: "problem text is required (10+ chars)" }, { status: 400 });
  }
  const id = await startRun({
    problem: body.problem.trim(),
    preferredContext: typeof body.preferredContext === "string" ? body.preferredContext.trim() || undefined : undefined,
  });
  return NextResponse.json({ id });
}
