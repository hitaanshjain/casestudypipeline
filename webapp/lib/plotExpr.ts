// webapp/lib/plotExpr.ts
// A tiny, closed-vocabulary expression language for practice-deck plot visuals.
//
// WHY THIS EXISTS: the model declares a function as plain ASCII and the RENDERER
// computes every plotted point, so the model never states a coordinate. A curve
// therefore cannot silently disagree with the step's algebra; the only way to draw
// the wrong curve is to write the wrong expression, and the expression sits in the
// JSON next to the equations where a human can read it. (The alternative,
// model-supplied sample points, puts model arithmetic on the critical path, which
// is the one thing this project's architecture says never to trust.)
//
// Neither eval() nor the Function constructor is used: a hand-written parser for a
// grammar this small is auditable and carries no supply-chain surface.
//
// Grammar (precedence climbing):
//   expr    := term (('+' | '-') term)*
//   term    := factor (('*' | '/') factor)*
//   factor  := ('-' | '+') factor | power
//   power   := primary ('^' factor)?        right associative
//   primary := number | constant | 'x' | func '(' expr ')' | '(' expr ')'
//
// Unary binds LOOSER than '^', so -x^2 compiles as -(x^2), matching normal
// mathematical reading. power's exponent is a factor, so x^-2 parses.

const FUNCTIONS: Record<string, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export const EXPR_FUNCTIONS = Object.keys(FUNCTIONS);
export const EXPR_CONSTANTS = Object.keys(CONSTANTS);

type Node = (x: number) => number;

type Token =
  | { t: "num"; v: number; i: number }
  | { t: "ident"; v: string; i: number }
  | { t: "op"; v: string; i: number };

class ParseError extends Error {}

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (c >= "0" && c <= "9") {
      const start = i;
      while (i < src.length && src[i] >= "0" && src[i] <= "9") i++;
      if (src[i] === ".") {
        i++;
        while (i < src.length && src[i] >= "0" && src[i] <= "9") i++;
      }
      const text = src.slice(start, i);
      // Implicit multiplication ("2x", "2sin(x)") is rejected on purpose: it is
      // ambiguous beside multi-character identifiers, and an explicit-only rule
      // gives the model a precise, actionable retry message.
      if (i < src.length && isIdentStart(src[i])) {
        throw new ParseError(
          `implicit multiplication is not allowed near "${text}${src[i]}" at position ${i}; write it explicitly with *`
        );
      }
      out.push({ t: "num", v: Number(text), i: start });
      continue;
    }
    if (isIdentStart(c)) {
      const start = i;
      while (i < src.length && isIdentPart(src[i])) i++;
      out.push({ t: "ident", v: src.slice(start, i), i: start });
      continue;
    }
    if ("+-*/^()".includes(c)) {
      out.push({ t: "op", v: c, i });
      i++;
      continue;
    }
    throw new ParseError(`unexpected character "${c}" at position ${i}`);
  }
  return out;
}

function isIdentStart(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
}

function isIdentPart(c: string): boolean {
  return isIdentStart(c) || (c >= "0" && c <= "9");
}

class Parser {
  private pos = 0;
  constructor(private readonly toks: Token[]) {}

  private peek(): Token | undefined {
    return this.toks[this.pos];
  }

  private isOp(v: string): boolean {
    const t = this.peek();
    return !!t && t.t === "op" && t.v === v;
  }

  private eatOp(v: string): boolean {
    if (this.isOp(v)) {
      this.pos++;
      return true;
    }
    return false;
  }

  private expectOp(v: string): void {
    if (!this.eatOp(v)) {
      const t = this.peek();
      throw new ParseError(
        t ? `expected "${v}" at position ${t.i}, found "${describe(t)}"` : `expected "${v}" but the expression ended`
      );
    }
  }

  parse(): Node {
    if (this.toks.length === 0) throw new ParseError("the expression is empty");
    const node = this.expr();
    const rest = this.peek();
    if (rest) throw new ParseError(`unexpected "${describe(rest)}" at position ${rest.i}`);
    return node;
  }

  private expr(): Node {
    let left = this.term();
    for (;;) {
      if (this.eatOp("+")) {
        const right = this.term();
        const l = left;
        left = (x) => l(x) + right(x);
      } else if (this.eatOp("-")) {
        const right = this.term();
        const l = left;
        left = (x) => l(x) - right(x);
      } else return left;
    }
  }

  private term(): Node {
    let left = this.factor();
    for (;;) {
      if (this.eatOp("*")) {
        const right = this.factor();
        const l = left;
        left = (x) => l(x) * right(x);
      } else if (this.eatOp("/")) {
        const right = this.factor();
        const l = left;
        left = (x) => l(x) / right(x);
      } else return left;
    }
  }

  private factor(): Node {
    if (this.eatOp("-")) {
      const inner = this.factor();
      return (x) => -inner(x);
    }
    if (this.eatOp("+")) return this.factor();
    return this.power();
  }

  private power(): Node {
    const base = this.primary();
    if (this.eatOp("^")) {
      // Exponent is a factor, so it is right associative and accepts a unary sign.
      const exp = this.factor();
      return (x) => Math.pow(base(x), exp(x));
    }
    return base;
  }

  private primary(): Node {
    const t = this.peek();
    if (!t) throw new ParseError("the expression ended unexpectedly");
    if (t.t === "num") {
      this.pos++;
      const v = t.v;
      return () => v;
    }
    if (t.t === "ident") {
      this.pos++;
      const name = t.v;
      if (name === "x") return (x) => x;
      if (name in CONSTANTS) {
        const v = CONSTANTS[name];
        return () => v;
      }
      if (name in FUNCTIONS) {
        const fn = FUNCTIONS[name];
        this.expectOp("(");
        const arg = this.expr();
        this.expectOp(")");
        return (x) => fn(arg(x));
      }
      throw new ParseError(
        `unknown name "${name}" at position ${t.i}; allowed: x, ${EXPR_CONSTANTS.join(", ")}, ${EXPR_FUNCTIONS.join(", ")}`
      );
    }
    if (t.t === "op" && t.v === "(") {
      this.pos++;
      const inner = this.expr();
      this.expectOp(")");
      return inner;
    }
    throw new ParseError(`unexpected "${describe(t)}" at position ${t.i}`);
  }
}

function describe(t: Token): string {
  return t.t === "num" ? String(t.v) : t.v;
}

export type CompiledExpr = { ok: true; fn: (x: number) => number } | { ok: false; error: string };

// Compiles an expression to a closure. Never throws: callers get {ok:false,error}.
// The returned closure may itself return non-finite values (a pole, a domain edge);
// that is the caller's business, and the plot renderer breaks its polyline there.
export function compileExpr(src: string): CompiledExpr {
  try {
    const fn = new Parser(tokenize(src)).parse();
    return { ok: true, fn };
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, error: e.message };
    return { ok: false, error: `could not parse expression: ${(e as Error).message}` };
  }
}

export function isValidExpr(src: string): boolean {
  return compileExpr(src).ok;
}
