"use client";

import { useState } from "react";
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
// typeset the hidden face on mount. Both faces occupy the SAME grid cell of
// .inner (grid-area 1/1), so they stay in normal flow and .inner's height is
// natively the taller face's height, re-flowing whenever MathJax typesetting
// changes content size. The earlier absolute-position + measured-height
// pattern is gone for cause: pinning the faces to a measured height let a
// tall back face shrink .backBody and overflow its content over the footer,
// and because that overflow landed inside the pinned box, scrollHeight never
// reported a larger value, so the measurement could not correct itself.
function FlipCard({ card }: { card: TConceptCard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={styles.cardButton}
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={`${card.front.title}. Press to flip between the concept and the worked example.`}
    >
      <div className={`${styles.inner} ${flipped ? styles.flipped : ""}`}>
        <div className={`${styles.face} ${styles.front}`}>
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
                    <span>
                      <Prose text={entry.meaning} />
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.descMain}>
              <Prose text={card.front.description_main} />
            </p>
            <p className={styles.descSupport}>
              <Prose text={card.front.description_support} />
            </p>
          </div>
          <p className={styles.frontFooter}>Flip for a worked example</p>
        </div>

        <div className={`${styles.face} ${styles.back}`}>
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
          <p className={styles.backFooter}>
            <Prose text={card.back.footer} />
          </p>
        </div>
      </div>
    </button>
  );
}
