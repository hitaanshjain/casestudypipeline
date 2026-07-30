"use client";

import { useEffect, useRef, useState } from "react";
import { MathBlock, Prose } from "./Math";
import { useMathJaxReady } from "./MathJaxProvider";
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
  const mathJaxReady = useMathJaxReady();

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

    // ResizeObserver alone is not enough: each face is `position: absolute;
    // inset: 0` inside `.inner` (an explicit pixel height, applied via the
    // inline `height` style below), so a face's own border-box is pinned by
    // its parent and never itself resizes as content grows inside its
    // `overflow: hidden` box -- the observer above never re-fires when
    // MathJax-typeset math grows taller than the raw text it replaced. The
    // initial measure() call above also runs on mount before MathJax has
    // typeset anything: MathBlock/Prose (Math.tsx) write raw
    // "\(...\)"/"\[...\]" textContent synchronously, then call
    // MathJax.typesetPromise asynchronously, only once useMathJaxReady()
    // flips true. Typesetting replaces those raw text nodes with rendered
    // `mjx-container` elements, which IS a DOM mutation, so a
    // MutationObserver on each face catches the moment typesetting actually
    // finishes (whenever the CDN script/typeset call completes, regardless
    // of load timing) and re-measures scrollHeight then, which is the
    // moment it is correct. `mathJaxReady` is also in the dependency array
    // so a fresh measure + observer pair is installed as soon as MathJax
    // becomes available, not just at initial mount.
    const mo = new MutationObserver(measure);
    if (frontRef.current) {
      mo.observe(frontRef.current, { childList: true, subtree: true, characterData: true });
    }
    if (backRef.current) {
      mo.observe(backRef.current, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [card, mathJaxReady]);

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
            <p className={styles.descMain}>
              <Prose text={card.front.description_main} />
            </p>
            <p className={styles.descSupport}>
              <Prose text={card.front.description_support} />
            </p>
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
          <p className={styles.backFooter}>
            <Prose text={card.back.footer} />
          </p>
        </div>
      </div>
    </button>
  );
}
