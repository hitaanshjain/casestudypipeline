"use client";

import { useMemo } from "react";
import { MathBlock, Prose } from "./Math";
import { compileExpr } from "@/lib/plotExpr";
import type { TDeckVisual } from "@/lib/contracts";
import styles from "./deckVisual.module.css";

// The model declares WHAT to draw and never a coordinate: every plotted point,
// including the y of a marked point, is computed here from the expression. See
// lib/plotExpr.ts for the reasoning.

const W = 560;
const PLOT_H = 300;
const LINE_H = 118;
const PAD = { l: 46, r: 18, t: 18, b: 34 };
const SAMPLES = 240;

function fmt(n: number): string {
  if (Math.abs(n) < 1e-9) return "0";
  const r = Math.round(n * 100) / 100;
  return String(r);
}

export default function DeckVisual({ visual }: { visual: TDeckVisual }) {
  if (visual.kind === "plot") return <PlotVisual v={visual} />;
  if (visual.kind === "number_line") return <NumberLineVisual v={visual} />;
  return <TableVisual v={visual} />;
}

// ---------------------------------------------------------------------------
// plot
// ---------------------------------------------------------------------------
function PlotVisual({ v }: { v: Extract<TDeckVisual, { kind: "plot" }> }) {
  const model = useMemo(() => {
    const [a, b] = v.domain;
    const series = v.curves.map((c) => {
      const compiled = compileExpr(c.expr);
      const pts: ({ x: number; y: number } | null)[] = [];
      if (compiled.ok) {
        for (let i = 0; i <= SAMPLES; i++) {
          const x = a + ((b - a) * i) / SAMPLES;
          const y = compiled.fn(x);
          // A non-finite sample (a pole, a domain edge) becomes a break in the
          // polyline, so an asymptote never draws a false vertical line.
          pts.push(Number.isFinite(y) ? { x, y } : null);
        }
      }
      return { ...c, ok: compiled.ok, fn: compiled.ok ? compiled.fn : null, pts };
    });

    let lo: number;
    let hi: number;
    if (v.yRange) {
      [lo, hi] = v.yRange;
    } else {
      const ys: number[] = [];
      for (const s of series) for (const p of s.pts) if (p) ys.push(p.y);
      if (ys.length === 0) {
        lo = -1;
        hi = 1;
      } else {
        lo = Math.min(...ys);
        hi = Math.max(...ys);
        if (hi - lo < 1e-9) {
          lo -= 1;
          hi += 1;
        }
        const pad = (hi - lo) * 0.08;
        lo -= pad;
        hi += pad;
      }
    }
    return { a, b, lo, hi, series };
  }, [v]);

  const { a, b, lo, hi, series } = model;
  const innerW = W - PAD.l - PAD.r;
  const innerH = PLOT_H - PAD.t - PAD.b;
  const sx = (x: number) => PAD.l + ((x - a) / (b - a)) * innerW;
  const sy = (y: number) => PAD.t + (1 - (y - lo) / (hi - lo)) * innerH;

  const path = (pts: ({ x: number; y: number } | null)[]) => {
    let d = "";
    let pen = false;
    for (const p of pts) {
      if (!p) {
        pen = false;
        continue;
      }
      d += `${pen ? " L" : " M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`;
      pen = true;
    }
    return d.trim();
  };

  // Axis lines sit at zero when zero is in view, otherwise at the plot edge.
  const axisY = lo <= 0 && hi >= 0 ? sy(0) : sy(lo);
  const axisX = a <= 0 && b >= 0 ? sx(0) : sx(a);
  const primary = series.find((s) => s.emphasis === "primary") ?? series[0];

  const xTicks = Array.from({ length: 5 }, (_, i) => a + ((b - a) * i) / 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);

  let shadePath = "";
  if (v.shade && primary?.ok) {
    const baseY = sy(Math.min(Math.max(0, lo), hi));
    const inSpan = primary.pts.filter((p) => p && p.x >= v.shade!.from && p.x <= v.shade!.to) as {
      x: number;
      y: number;
    }[];
    if (inSpan.length > 1) {
      const top = inSpan.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join("");
      shadePath = `${top}L${sx(inSpan[inSpan.length - 1].x).toFixed(2)},${baseY.toFixed(2)}L${sx(inSpan[0].x).toFixed(2)},${baseY.toFixed(2)}Z`;
    }
  }

  const clipId = `plotclip-${v.curves[0].expr.replace(/[^a-z0-9]/gi, "").slice(0, 12)}-${fmt(a)}-${fmt(b)}`;

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${PLOT_H}`}
        role="img"
        aria-label={v.caption}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={PAD.l} y1={sy(t)} x2={W - PAD.r} y2={sy(t)} className={styles.grid} />
            <text x={PAD.l - 7} y={sy(t) + 3.5} className={styles.tickText} textAnchor="end">
              {fmt(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={sx(t)} y1={PAD.t} x2={sx(t)} y2={PLOT_H - PAD.b} className={styles.grid} />
            <text x={sx(t)} y={PLOT_H - PAD.b + 15} className={styles.tickText} textAnchor="middle">
              {fmt(t)}
            </text>
          </g>
        ))}

        <line x1={PAD.l} y1={axisY} x2={W - PAD.r} y2={axisY} className={styles.axis} />
        <line x1={axisX} y1={PAD.t} x2={axisX} y2={PLOT_H - PAD.b} className={styles.axis} />

        <g clipPath={`url(#${clipId})`}>
          {shadePath && <path d={shadePath} className={styles.shade} />}
          {series.map((s, i) => (
            <path
              key={i}
              d={path(s.pts)}
              className={s.emphasis === "primary" ? styles.curvePrimary : styles.curveSecondary}
            />
          ))}
          {(v.marks ?? []).map((m, i) => {
            if (!primary?.fn) return null;
            const y = primary.fn(m.x);
            if (!Number.isFinite(y)) return null;
            return <circle key={i} cx={sx(m.x)} cy={sy(y)} r={4.5} className={styles.mark} />;
          })}
        </g>

        {(v.marks ?? []).map((m, i) => {
          if (!primary?.fn) return null;
          const y = primary.fn(m.x);
          if (!Number.isFinite(y)) return null;
          const cx = sx(m.x);
          const cy = sy(y);
          // Flip the label to the left near the right edge so it never runs off.
          const flip = cx > W - PAD.r - 90;
          return (
            <text
              key={`l${i}`}
              x={flip ? cx - 8 : cx + 8}
              y={cy - 8}
              textAnchor={flip ? "end" : "start"}
              className={styles.markText}
            >
              {m.label}
            </text>
          );
        })}
      </svg>

      {/* The expression is printed so a divergence between the plotted function
          and the step's LaTeX is visible on screen rather than silent. */}
      <div className={styles.legend}>
        {series.map((s, i) => (
          <span key={i} className={styles.legendItem}>
            <span className={s.emphasis === "primary" ? styles.swatchPrimary : styles.swatchSecondary} aria-hidden />
            <Prose text={s.label} />
            <code className={styles.expr}>{s.ok ? s.expr : `could not plot: ${s.expr}`}</code>
          </span>
        ))}
        {v.shade && (
          <span className={styles.legendItem}>
            <Prose text={v.shade.label} />
          </span>
        )}
      </div>
      <figcaption className={styles.caption}>
        <Prose text={v.caption} />
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// number_line
// ---------------------------------------------------------------------------
function NumberLineVisual({ v }: { v: Extract<TDeckVisual, { kind: "number_line" }> }) {
  const [a, b] = v.range;
  const innerW = W - PAD.l - PAD.r;
  const sx = (x: number) => PAD.l + ((x - a) / (b - a)) * innerW;
  const lineY = 78;

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${LINE_H}`}
        role="img"
        aria-label={v.caption}
        preserveAspectRatio="xMidYMid meet"
      >
        {v.intervals.map((iv, i) => {
          const x1 = sx(iv.from);
          const x2 = sx(iv.to);
          const toneClass =
            iv.tone === "positive" ? styles.spanPositive : iv.tone === "negative" ? styles.spanNegative : styles.spanNeutral;
          return (
            <g key={i}>
              <line x1={x1 + 3} y1={44} x2={x2 - 3} y2={44} className={toneClass} />
              <text x={(x1 + x2) / 2} y={34} textAnchor="middle" className={styles.spanText}>
                {iv.label}
              </text>
            </g>
          );
        })}

        <line x1={PAD.l} y1={lineY} x2={W - PAD.r} y2={lineY} className={styles.axis} />
        {/* An arrowhead only where no labelled point sits, so the head never
            collides with an endpoint dot. */}
        {!v.points.some((p) => Math.abs(p.x - b) < 1e-9) && (
          <path d={`M${W - PAD.r},${lineY} l-8,-4 l0,8 z`} className={styles.axisHead} />
        )}
        {!v.points.some((p) => Math.abs(p.x - a) < 1e-9) && (
          <path d={`M${PAD.l},${lineY} l8,-4 l0,8 z`} className={styles.axisHead} />
        )}

        {v.points.map((p, i) => (
          <g key={i}>
            <circle
              cx={sx(p.x)}
              cy={lineY}
              r={5}
              className={p.closed ? styles.pointClosed : styles.pointOpen}
            />
            <text x={sx(p.x)} y={lineY + 22} textAnchor="middle" className={styles.tickText}>
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className={styles.caption}>
        <Prose text={v.caption} />
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// table
// ---------------------------------------------------------------------------
function TableVisual({ v }: { v: Extract<TDeckVisual, { kind: "table" }> }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {v.columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <MathBlock latex={cell} inline />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className={styles.caption}>
        <Prose text={v.caption} />
      </figcaption>
    </figure>
  );
}
