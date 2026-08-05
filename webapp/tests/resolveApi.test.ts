// webapp/tests/resolveApi.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resolveRef, clearBankCache } from "../lib/exerciseBank";
import { buildCitation } from "../lib/citation";
import { validFile, writeBank } from "./helpers/bankFixture";

describe("buildCitation", () => {
  it("formats a section citation", () => {
    expect(buildCitation("3.1", 41)).toBe("OpenStax Calculus Volume 1, Section 3.1, Exercise 41");
  });
  it("formats a chapter-review citation", () => {
    expect(buildCitation("3.review", 401)).toBe("OpenStax Calculus Volume 1, Chapter 3 Review, Exercise 401");
  });
});

describe("resolveRef", () => {
  let dir: string;
  beforeEach(() => {
    clearBankCache();
    dir = writeBank([validFile()]);
  });

  it("resolves an available exercise with text, citation, attribution", () => {
    const r = resolveRef("3.1", dir);
    expect(r).toMatchObject({
      found: true,
      available: true,
      ref: { chapter: 3, section: "3.1", number: 1 },
      citation: "OpenStax Calculus Volume 1, Section 3.1, Exercise 1",
      attribution: "Access for free at openstax.org.",
    });
    if (r.found && r.available) expect(r.text).toMatch(/secant/);
  });

  it("returns needs_figure without text for a graph exercise", () => {
    const r = resolveRef("3.3", dir);
    expect(r).toMatchObject({ found: true, available: false, reason: "needs_figure", kind: "graph" });
    expect((r as Record<string, unknown>).text).toBeUndefined();
  });

  it("keeps a wrong section hint as hinted_section while resolving by number", () => {
    const r = resolveRef("section 3.9 exercise 1", dir);
    expect(r).toMatchObject({ found: true, ref: { section: "3.1" }, hinted_section: "3.9" });
  });

  it("bad_ref for garbage", () => {
    expect(resolveRef("hello", dir)).toEqual({ found: false, reason: "bad_ref" });
  });

  it("not_extracted for an absent chapter, listing present chapters", () => {
    expect(resolveRef("5.10", dir)).toEqual({ found: false, reason: "not_extracted", chapters: [3] });
  });

  it("no_such_exercise beyond the chapter's last number", () => {
    expect(resolveRef("3.999", dir)).toEqual({ found: false, reason: "no_such_exercise", chapter: 3, max: 3 });
  });
});

describe("GET /api/problems/resolve", () => {
  it("answers 200 with bad_ref for garbage (content-independent)", async () => {
    const { GET } = await import("../app/api/problems/resolve/route");
    const res = await GET(new NextRequest("http://localhost/api/problems/resolve?ref=hello"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false, reason: "bad_ref" });
  });
  it("answers not_extracted for chapter 99 (content-independent)", async () => {
    const { GET } = await import("../app/api/problems/resolve/route");
    const res = await GET(new NextRequest("http://localhost/api/problems/resolve?ref=99.1"));
    const body = await res.json();
    expect(body.found).toBe(false);
    expect(body.reason).toBe("not_extracted");
  });
});
