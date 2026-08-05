"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MathBlock, Prose } from "./Math";
import DeckVisual from "./DeckVisual";
import { BangIcon, CheckIcon, DashIcon, GridIcon, RefreshIcon, SkipToEndIcon, SparkIcon, TargetIcon } from "./icons";
import type { TPracticeDeck } from "@/lib/contracts";
import styles from "./practiceDeck.module.css";

const CALLOUT_ICONS: Record<string, React.ReactNode> = {
  goal: <TargetIcon />,
  tip: <SparkIcon />,
  memory: <RefreshIcon />,
  check: <CheckIcon />,
  warning: <BangIcon />,
  success: <CheckIcon />,
};

type DeckStep = TPracticeDeck["steps"][number];

// The overview slide shows ONE equation per step. The prompt requires every step
// to carry exactly one "primary" and the zod contract requires at least one, so
// freshly generated decks always hit the second branch (or the first, on the last
// step). The rest of the chain is for decks cached in MySQL before that rule
// existed, which are served straight from cache without revalidation: they may
// have steps with no primary, or with no equations at all, and an overview card
// must never render an empty math slot.
function headlineEquation(step: DeckStep): string | null {
  const last = (style: string) => {
    const matches = step.equations.filter((e) => e.style === style);
    return matches.length > 0 ? matches[matches.length - 1].latex : null;
  };
  // "final" leads because on the last step the boxed answer is the conclusive line.
  return last("final") ?? last("primary") ?? last("secondary") ?? last("rule") ?? step.cards[0]?.latex ?? null;
}

export default function PracticeDeckPlayer({ deck }: { deck: TPracticeDeck }) {
  const [stepIndex, setStepIndex] = useState(0);
  const stageShellRef = useRef<HTMLElement>(null);
  const stepCount = deck.steps.length;
  // The overview is slide stepCount, so the deck has one more slide than steps.
  const overviewIndex = stepCount;
  const total = stepCount + 1;
  const isOverview = stepIndex === overviewIndex;

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

  // Prefer the last step's boxed equation over problem.answerLatex: answerLatex
  // is allowed to pack several results with \qquad, which cannot line-break and
  // renders shrunken.
  const lastStep = deck.steps[stepCount - 1];
  const finalAnswerLatex =
    lastStep?.equations.find((e) => e.style === "final")?.latex ?? deck.problem.answerLatex;

  return (
    <div className={styles.layout}>
      <section className={`panel ${styles.stageShell}`} ref={stageShellRef} aria-label="Practice deck stage">
        <header className={styles.topbar}>
          <div>
            <h2 className={styles.deckTitle}>
              <Prose text={deck.title} />
            </h2>
            <p className={styles.deckSubtitle}>
              <Prose text={deck.subtitle} />
            </p>
          </div>
          {/* Counts against the real step count, never the slide count: the
              overview is a recap, not a tenth step to work through. */}
          <div className={styles.stepCount}>
            {isOverview ? "Complete solution" : `Step ${stepIndex + 1} of ${stepCount}`}
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
          <button
            type="button"
            className={`btn ${styles.finalBtn}`}
            onClick={goFinal}
            disabled={stepIndex === total - 1}
          >
            Final Slide <SkipToEndIcon size={14} />
          </button>
        </div>

        {/* Every step stays mounted so MathJax typesets everything once and
            switching is instant. The ACTIVE step is in normal flow (the stage
            takes exactly its height); hidden steps are absolutely positioned
            at the same width, invisible but laid out, so line-break
            measurement still sees the real column width. visibility:hidden
            also drops the overview's step buttons out of the tab order while
            it is not the active slide. */}
        <div className={styles.stage}>
          <div className={styles.stepsHost}>
            {deck.steps.map((s, i) => (
            <article
              key={s.id}
              className={`${styles.stepContent} ${i === stepIndex ? styles.stepActive : styles.stepHidden}`}
              aria-hidden={i !== stepIndex}
            >
              <div className={styles.stepHead}>
                <span className={styles.stepNum} aria-label={`Step ${i + 1}`}>
                  {i + 1}
                </span>
                <h3 className={styles.stepTitle}>
                  <Prose text={s.title} />
                </h3>
              </div>
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

              {s.visual && <DeckVisual visual={s.visual} />}

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
                  <div className="callout-icon">{CALLOUT_ICONS[s.callout.type] ?? <DashIcon />}</div>
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

            {/* The overview: the whole worked solution on one slide, so a
                student who skips to the end sees every step at once. Built
                entirely from the steps above, never authored by the model, so
                it cannot drift from the solution it summarises. */}
            <article
              className={`${styles.stepContent} ${isOverview ? styles.stepActive : styles.stepHidden}`}
              aria-hidden={!isOverview}
            >
              <div className={styles.overviewHead}>
                <span className={styles.overviewEyebrow}>Complete solution</span>
                <h3 className={styles.overviewTitle}>
                  <Prose text={deck.title} />
                </h3>
                <p className={styles.overviewLead}>
                  Every step of the worked solution in one view. Select any step to reopen it.
                </p>
              </div>

              <ol className={styles.overviewGrid}>
                {deck.steps.map((s, i) => {
                  const latex = headlineEquation(s);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={styles.overviewCard}
                        onClick={() => jumpTo(i)}
                        aria-label={`Go to step ${i + 1}, ${s.title}`}
                      >
                        <span className={styles.overviewCardHead}>
                          <span className={styles.overviewCardNum}>{i + 1}</span>
                          <span className={styles.overviewCardTitle}>
                            <Prose text={s.title} />
                          </span>
                        </span>
                        <span className={styles.overviewCardBody}>
                          {s.caption && (
                            <span className={styles.overviewCaption}>
                              <Prose text={s.caption} />
                            </span>
                          )}
                          {latex && (
                            <span className={styles.overviewMath}>
                              <MathBlock latex={latex} />
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className={`equation-row final ${styles.overviewFinal}`}>
                <div className="equation-label">Final answer</div>
                <div className="equation">
                  <MathBlock latex={finalAnswerLatex} />
                </div>
              </div>

              {deck.reference.equations.length > 0 && (
                <section className={styles.overviewRules} aria-label="Rules used in this solution">
                  <h4 className={styles.overviewRulesHead}>Rules used</h4>
                  <ul className={styles.overviewRulesList}>
                    {deck.reference.equations.map((r, i) => (
                      <li key={i}>
                        <span className={styles.overviewRuleTitle}>
                          <Prose text={r.title} />
                        </span>
                        <span className={styles.overviewRuleMath}>
                          <MathBlock latex={r.latex} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          </div>
        </div>
      </section>

      <aside className={`panel ${styles.sidebar}`}>
        <div className={styles.problemCard}>
          <div className={styles.problemLabel}>Your problem</div>
          <p className={styles.problemProse}>
            <Prose text={deck.problem.prompt} />
          </p>
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
              <span className="timeline-title">
                <Prose text={s.title} />
              </span>
            </button>
          ))}
          <button
            type="button"
            className={isOverview ? "active" : ""}
            onClick={() => jumpTo(overviewIndex)}
          >
            <span className="timeline-index">
              <GridIcon size={13} />
            </span>
            <span className="timeline-title">Complete solution</span>
          </button>
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
                  <h3>
                    <Prose text={r.title} />
                  </h3>
                  <div className={styles.referenceMath}>
                    <MathBlock latex={r.latex} />
                  </div>
                  {r.text && (
                    <p>
                      <Prose text={r.text} />
                    </p>
                  )}
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
