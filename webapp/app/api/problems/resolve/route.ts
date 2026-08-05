// webapp/app/api/problems/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveRef } from "@/lib/exerciseBank";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return NextResponse.json(resolveRef(req.nextUrl.searchParams.get("ref") ?? ""));
}
