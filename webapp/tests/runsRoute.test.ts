// webapp/tests/runsRoute.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/pipeline", () => ({ startRun: vi.fn(async () => "run-test-id") }));

import { POST } from "../app/api/runs/route";
import { startRun } from "@/lib/pipeline";

function post(body: unknown) {
  return POST(new NextRequest("http://localhost/api/runs", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }));
}

const PROBLEM = "Water flows into a tank at r(t) = 20 + 5t liters per hour for 4 hours.";
const SOURCE = { book_key: "openstax_calculus_v1", chapter: 3, section: "3.1", number: 41 };

describe("POST /api/runs source pass-through", () => {
  beforeEach(() => vi.mocked(startRun).mockClear());

  it("passes a well-formed source to startRun", async () => {
    const res = await post({ problem: PROBLEM, source: SOURCE });
    expect(res.status).toBe(200);
    expect(vi.mocked(startRun).mock.calls[0][0]).toMatchObject({ problem: PROBLEM, source: SOURCE });
  });

  it("strips a malformed source rather than failing the run", async () => {
    const res = await post({ problem: PROBLEM, source: { chapter: "three" } });
    expect(res.status).toBe(200);
    expect(vi.mocked(startRun).mock.calls[0][0].source).toBeUndefined();
  });

  it("strips a source with a non-OpenStax book_key rather than failing the run", async () => {
    const res = await post({ problem: PROBLEM, source: { ...SOURCE, book_key: "stewart_8e" } });
    expect(res.status).toBe(200);
    expect(vi.mocked(startRun).mock.calls[0][0].source).toBeUndefined();
  });

  it("still rejects a short problem", async () => {
    const res = await post({ problem: "too short", source: SOURCE });
    expect(res.status).toBe(400);
    expect(vi.mocked(startRun)).not.toHaveBeenCalled();
  });
});
