// webapp/app/api/runs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readState, runExists } from "@/lib/runStore";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!runExists(id)) {
      return NextResponse.json({ error: "run not found" }, { status: 404 });
    }
    return NextResponse.json(readState(id));
  } catch {
    return NextResponse.json({ error: "run not found" }, { status: 404 });
  }
}
