"use client";

import { useEffect, useRef, useState } from "react";
import { MathBlock, Prose } from "./Math";
import type { TConceptCard } from "@/lib/contracts";
import styles from "./conceptCards.module.css";

export default function ConceptCardGrid({ cards }: { cards: TConceptCard[] }) {
  return (
    <div className={styles.grid}>
      {cards.map((card, i) => (
        <FlipCard key={`${card.concept_name}-${i}`} card={card} />
      ))}
    </div>
  );
}

// Both faces are always mounted (never conditionally rendered) so MathJax can
// typeset the hidden face on mount, per the results-page brief: "The FLIPPED
// (hidden) face still typesets fine since MathJax runs on mount; do not
// re-typeset on flip." Height is measured from both faces via ResizeObserver
// and applied to .inner so the card grows to fit whichever face is taller,
// satisfying "grows with content, no internal scrolling" while keeping the
// brief's literal flip technique (rotateY on .inner; faces backface-visibility:
// hidden; position: absolute; inset: 0 — which by itself would NOT let the
// container's height track content, since absolutely positioned children are
// out of flow).
const MIN_CARD_HEIGHT = 380;

function FlipCard({ card }: { card: TConceptCard }) {
  const [flipped, setFlipped] = useState(false);
  const [height, setHeight] = useState(MIN_CARD_HEIGHT);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const frontHeight = frontRef.current?.scrollHeight ?? 0;
      const backHeight = backRef.current?.scrollHeight ?? 0;
      setHeight(Math.max(MIN_CARD_HEIGHT, frontHeight, backHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frontRef.current) ro.observe(frontRef.current);
    if (backRef.current) ro.observe(backRef.current);
    return () => ro.disconnect();
  }, [card]);

  return (
    <button
      type="button"
      className={styles.cardButton}
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={`${card.front.title}. Press to flip between the concept and the worked example.`}
    >
      <div className={`${styles.inner} ${flipped ? styles.flipped : ""}`} style={{ height }}>
        <div ref={frontRef} className={`${styles.face} ${styles.front}`}>
          <div className={styles.frontBody}>
            <h3 className={styles.frontTitle}>{card.front.title}</h3>
            <p className={styles.frontSubtitle}>{card.front.subtitle}</p>
            <div className={styles.frontDivider} />
            <div className={styles.frontCentral}>
              {card.front.central_latex !== null ? (
                <MathBlock latex={card.front.central_latex} />
              ) : (
                <Prose text={card.front.central_prose ?? ""} />
              )}
            </div>
            {card.front.variable_key.length > 0 && (
              <div className={styles.variableKey}>
                {card.front.variable_key.map((entry, i) => (
                  <div key={i} className={styles.variableRow}>
                    <MathBlock latex={entry.symbol} inline />
                    <span>{entry.meaning}</span>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.descMain}>{card.front.description_main}</p>
            <p className={styles.descSupport}>{card.front.description_support}</p>
          </div>
          <p className={styles.frontFooter}>Flip for a worked example</p>
        </div>

        <div ref={backRef} className={`${styles.face} ${styles.back}`}>
          <div className={styles.backBody}>
            <h3 className={styles.backHeading}>Worked Example</h3>
            <p className={styles.question}>
              <Prose text={card.back.question} />
            </p>
            <div className={styles.backDivider} />
            <div className={styles.steps}>
              {card.back.steps.map((step, i) => (
                <div key={i} className={styles.step}>
                  {step.latex !== null && <MathBlock latex={step.latex} />}
                  {step.prose !== null && (
                    <p className={styles.stepProse}>
                      <Prose text={step.prose} />
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.finalAnswer}>
              <MathBlock latex={card.back.final_answer_latex} />
            </div>
          </div>
          <p className={styles.backFooter}>{card.back.footer}</p>
        </div>
      </div>
    </button>
  );
}
