// webapp/tests/refParser.test.ts
import { describe, it, expect } from "vitest";
import { parseRef } from "../lib/refParser";

describe("parseRef accepted forms", () => {
  const cases: [string, { chapter: number; number: number; sectionHint?: string }][] = [
    ["3.41", { chapter: 3, number: 41 }],
    [" 3 . 41 ", { chapter: 3, number: 41 }],
    ["3-41", { chapter: 3, number: 41 }],
    ["3#41", { chapter: 3, number: 41 }],
    ["Chapter 3, Problem 41", { chapter: 3, number: 41 }],
    ["chapter 3 exercise 41", { chapter: 3, number: 41 }],
    ["ch 3 ex 41", { chapter: 3, number: 41 }],
    ["ch3 #41", { chapter: 3, number: 41 }],
    ["Ch. 3 Prob 41", { chapter: 3, number: 41 }],
    ["section 3.4 exercise 118", { chapter: 3, number: 118, sectionHint: "3.4" }],
    ["3.4 ex 118", { chapter: 3, number: 118, sectionHint: "3.4" }],
    ["sec 3.4 problem 118", { chapter: 3, number: 118, sectionHint: "3.4" }],
  ];
  for (const [input, want] of cases) {
    it(`parses ${JSON.stringify(input)}`, () => {
      expect(parseRef(input)).toEqual(want);
    });
  }
});

describe("parseRef rejections", () => {
  for (const bad of ["", "hello", "chapter three problem four", "3.41.2", "3", "problem 41", "0.5", "3.0"]) {
    it(`rejects ${JSON.stringify(bad)}`, () => {
      expect(parseRef(bad)).toBeNull();
    });
  }
});
