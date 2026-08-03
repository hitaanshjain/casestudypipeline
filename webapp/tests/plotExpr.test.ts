import { describe, it, expect } from "vitest";
import { compileExpr } from "../lib/plotExpr";

// Helper: compile and evaluate, failing loudly if the expression did not compile,
// so a broken parse never masquerades as a wrong numeric result.
function ev(src: string, x: number): number {
  const r = compileExpr(src);
  if (!r.ok) throw new Error(`expected ${src} to compile, got: ${r.error}`);
  return r.fn(x);
}

function err(src: string): string {
  const r = compileExpr(src);
  if (r.ok) throw new Error(`expected ${src} to FAIL to compile`);
  return r.error;
}

describe("plotExpr: arithmetic and precedence", () => {
  it("applies multiplication before addition", () => {
    expect(ev("2+3*4", 0)).toBe(14);
  });
  it("respects parentheses over precedence", () => {
    expect(ev("(2+3)*4", 0)).toBe(20);
  });
  it("treats ^ as right associative", () => {
    // Left associative would give (2^3)^2 = 64.
    expect(ev("2^3^2", 0)).toBe(512);
  });
  it("binds unary minus looser than ^, so -x^2 is -(x^2)", () => {
    expect(ev("-x^2", 3)).toBe(-9);
  });
  it("allows a unary exponent", () => {
    expect(ev("x^-2", 2)).toBe(0.25);
  });
  it("subtracts left to right", () => {
    expect(ev("10-3-2", 0)).toBe(5);
  });
  it("divides left to right", () => {
    expect(ev("100/5/2", 0)).toBe(10);
  });
  it("handles a leading unary plus", () => {
    expect(ev("+x", 4)).toBe(4);
  });
  it("reads decimals", () => {
    expect(ev("0.25*x", 8)).toBe(2);
  });
});

describe("plotExpr: functions and constants", () => {
  it("evaluates every whitelisted function against Math", () => {
    const x = 0.7;
    expect(ev("sin(x)", x)).toBeCloseTo(Math.sin(x), 12);
    expect(ev("cos(x)", x)).toBeCloseTo(Math.cos(x), 12);
    expect(ev("tan(x)", x)).toBeCloseTo(Math.tan(x), 12);
    expect(ev("sqrt(x)", x)).toBeCloseTo(Math.sqrt(x), 12);
    expect(ev("abs(-x)", x)).toBeCloseTo(x, 12);
    expect(ev("exp(x)", x)).toBeCloseTo(Math.exp(x), 12);
    expect(ev("ln(x)", x)).toBeCloseTo(Math.log(x), 12);
    expect(ev("log(x)", x)).toBeCloseTo(Math.log10(x), 12);
  });
  it("knows pi and e", () => {
    expect(ev("pi", 0)).toBeCloseTo(Math.PI, 12);
    expect(ev("e", 0)).toBeCloseTo(Math.E, 12);
  });
  it("nests function calls", () => {
    expect(ev("sin(cos(x))", 0.3)).toBeCloseTo(Math.sin(Math.cos(0.3)), 12);
  });
});

describe("plotExpr: the closed vocabulary", () => {
  it("rejects an unknown function", () => {
    expect(err("foo(x)")).toMatch(/foo/);
  });
  it("rejects an unknown variable", () => {
    expect(err("y+1")).toMatch(/y/);
  });
  it("rejects implicit multiplication", () => {
    // Deliberate: ambiguous next to multi-character identifiers, and an
    // explicit-only rule gives the model a clear retry message.
    expect(err("2x")).toMatch(/\*/);
  });
  it("rejects unbalanced parentheses", () => {
    expect(err("sin(x")).toBeTruthy();
    expect(err("(x+1))")).toBeTruthy();
  });
  it("rejects an empty expression", () => {
    expect(err("   ")).toBeTruthy();
  });
  it("rejects a dangling operator", () => {
    expect(err("x+")).toBeTruthy();
  });
  it("rejects a function used without parentheses", () => {
    expect(err("sin x")).toBeTruthy();
  });
});

describe("plotExpr: non-finite results do not throw", () => {
  it("returns a non-finite value at a pole instead of throwing", () => {
    expect(Number.isFinite(ev("1/x", 0))).toBe(false);
  });
  it("returns NaN outside a domain instead of throwing", () => {
    expect(Number.isNaN(ev("sqrt(x)", -1))).toBe(true);
    expect(Number.isFinite(ev("ln(x)", 0))).toBe(false);
  });
});

describe("plotExpr: the fixture's own functions", () => {
  // The exact expressions the practice deck fixture plots. If these ever stop
  // matching the deck's algebra, the drawn curve would contradict the solution.
  const f = "sin(2*x)^3";
  const df = "6*sin(2*x)^2*cos(2*x)";

  it("matches sin^3(2x) across the plotted domain", () => {
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * (Math.PI / 2);
      expect(ev(f, x)).toBeCloseTo(Math.sin(2 * x) ** 3, 12);
    }
  });
  it("matches the derivative 6 sin^2(2x) cos(2x) across the plotted domain", () => {
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * (Math.PI / 2);
      expect(ev(df, x)).toBeCloseTo(6 * Math.sin(2 * x) ** 2 * Math.cos(2 * x), 12);
    }
  });
  it("agrees with the deck's evaluated answer at x = pi/12", () => {
    // The deck's boxed final answer is 3*sqrt(3)/4 ~ 1.299.
    expect(ev(df, Math.PI / 12)).toBeCloseTo((3 * Math.sqrt(3)) / 4, 12);
  });
  it("confirms the derivative expression IS the derivative of the function", () => {
    // Numeric differentiation of f, compared against df: catches an expression
    // that parses cleanly but plots the wrong curve.
    const h = 1e-6;
    for (let i = 1; i < 20; i++) {
      const x = (i / 20) * (Math.PI / 2);
      const numeric = (ev(f, x + h) - ev(f, x - h)) / (2 * h);
      expect(numeric).toBeCloseTo(ev(df, x), 5);
    }
  });
});
