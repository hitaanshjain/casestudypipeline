"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MathBlock, Prose } from "./Math";
import type { TPracticeDeck } from "@/lib/contracts";
import styles from "./practiceDeck.module.css";

const CALLOUT_ICONS: Record<string, string> = {
  goal: "◎", // ◎
  tip: "✦", // ✦
  memory: "↺", // ↺
  check: "✓", // ✓
  warning: "!",
  success: "✓", // ✓
};

export default function PracticeDeckPlayer({ deck }: { deck: TPracticeDeck }) {
  const [stepIndex, setStepIndex] = useState(0);
  const stageShellRef = useRef<HTMLElement>(null);
  const total = deck.steps.length;

  const goPrev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setStepIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const goFinal = useCallback(() => setStepIndex(total - 1), [total]);
  const jumpTo = useCallback((i: number) => setStepIndex(Math.max(0, Math.min(total - 1, i))), [total]);

  // Active ONLY while this component is mounted, i.e. only while the Practice
  // Deck tab is selected in Results.tsx (which conditionally mounts the tab
  // bodies). Removed on unmount, so switching tabs cleanly tears this down.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "End") {
        e.preventDefault();
        goFinal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, goFinal]);

  function jumpToStepId(stepId: string) {
    const idx = deck.steps.findIndex((s) => s.id === stepId);
    if (idx < 0) return;
    jumpTo(idx);
    stageShellRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={styles.layout}>
      <section className={`panel ${styles.stageShell}`} ref={stageShellRef} aria-label="Practice deck stage">
        <header className={styles.topbar}>
          <div>
            <h2 className={styles.deckTitle}>{deck.title}</h2>
            <p className={styles.deckSubtitle}>{deck.subtitle}</p>
          </div>
          <div className={styles.stepCount}>
            Step {stepIndex + 1} of {total}
          </div>
        </header>

        <div className="progress-track">
          <div className="progress-fill" style={{ transform: `scaleX(${(stepIndex + 1) / total})` }} />
        </div>

        {/* Controls live ABOVE the step content, directly under the progress
            bar, so their position never depends on the current step's height.
            That lets each step size naturally (no tallest-step whitespace,
            Hitaansh's July 30 complaint) while still never moving the buttons
            (his earlier complaint). */}
        <div className={styles.controls}>
          <button type="button" className="btn" onClick={goPrev} disabled={stepIndex === 0}>
            &larr; Previous
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={goNext}
            disabled={stepIndex === total - 1}
          >
            Next &rarr;
          </button>
          <button type="button" className="btn" onClick={goFinal} disabled={stepIndex === total - 1}>
            Final Slide &#8677;
          </button>
        </div>

        {/* Every step stays mounted so MathJax typesets everything once and
            switching is instant. The ACTIVE step is in normal flow (the stage
            takes exactly its height); hidden steps are absolutely positioned
            at the same width, invisible but laid out, so line-break
            measurement still sees the real column width. */}
        <div className={styles.stage}>
          <div className={styles.stepsHost}>
            {deck.steps.map((s, i) => (
            <article
              key={s.id}
              className={`${styles.stepContent} ${i === stepIndex ? styles.stepActive : styles.stepHidden}`}
              aria-hidden={i !== stepIndex}
            >
              <p className="eyebrow">Step {i + 1}</p>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              {s.caption && (
                <p className={styles.caption}>
                  <Prose text={s.caption} />
                </p>
              )}

              {s.equations.length > 0 && (
                <div className="equation-stack">
                  {s.equations.map((eq, j) => (
                    <div key={j} className={`equation-row ${eq.style}`}>
                      <div className="equation-label">{eq.label}</div>
                      <div className="equation">
                        <MathBlock latex={eq.latex} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.cards.length > 0 && (
                <div className="cards">
                  {s.cards.map((c, j) => (
                    <div key={j} className={`math-card ${c.tone}`}>
                      <div className="card-label">{c.label}</div>
                      <div className="card-math">
                        <MathBlock latex={c.latex} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.callout && (
                <div className={`callout ${s.callout.type}`}>
                  <div className="callout-icon">{CALLOUT_ICONS[s.callout.type] ?? "•"}</div>
                  <div>
                    <h3>
                      <Prose text={s.callout.title} />
                    </h3>
                    <p>
                      <Prose text={s.callout.text} />
                    </p>
                  </div>
                </div>
              )}
            </article>
            ))}
          </div>
        </div>
      </section>

      <aside className={`panel ${styles.sidebar}`}>
        <h2 className={styles.sidebarHeading}>Animation data</h2>
        <div className={styles.problemCard}>
          <div className={styles.problemLabel}>Current problem</div>
          <div className={styles.problemMath}>
            <MathBlock latex={deck.problem.latex} />
          </div>
        </div>
        <div className="timeline">
          {deck.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === stepIndex ? "active" : ""}
              onClick={() => jumpTo(i)}
            >
              <span className="timeline-index">{i + 1}</span>
              <span className="timeline-title">{s.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className={`panel ${styles.referenceShell}`} aria-labelledby="practice-deck-reference-heading">
        <div className={styles.referenceHeader}>
          <h2 id="practice-deck-reference-heading">Key Equations &amp; Formulas</h2>
          <p>Topic-specific reference material connected to the worked solution.</p>
        </div>
        <div className={styles.referenceList}>
          {deck.reference.equations.map((r, i) => (
            <article key={i} className={styles.referenceItem}>
              <div className={styles.referenceItemTop}>
                <div>
                  <h3>{r.title}</h3>
                  <div className={styles.referenceMath}>
                    <MathBlock latex={r.latex} />
                  </div>
                  {r.text && <p>{r.text}</p>}
                </div>
                <button type="button" className={styles.referenceJump} onClick={() => jumpToStepId(r.stepId)}>
                  View step
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
