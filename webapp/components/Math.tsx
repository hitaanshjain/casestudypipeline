"use client";
import { useEffect, useRef } from "react";
import { useMathJaxReady } from "./MathJaxProvider";

// All MathBlock/Prose instances mounting in the same commit enqueue here and
// get typeset in ONE MathJax pass. Per-element typesetPromise calls serialize
// inside MathJax as separate layout passes, so N elements cost N passes; with
// every practice-deck step mounted at once (~50+ elements) that left the last
// elements in the queue (the sidebar problem, the reference list) visibly raw
// for seconds after the steps had already rendered.
let pendingTypeset: Element[] = [];
let typesetScheduled = false;

function scheduleTypeset(el: Element) {
  pendingTypeset.push(el);
  if (typesetScheduled) return;
  typesetScheduled = true;
  // A macrotask so every effect in the current commit enqueues first.
  setTimeout(() => {
    const batch = pendingTypeset.filter((e) => e.isConnected);
    pendingTypeset = [];
    typesetScheduled = false;
    if (batch.length > 0) {
      (window as any).MathJax?.typesetPromise?.(batch)
        .then(() => shrinkOversizeMath(batch))
        .catch(() => {});
    }
  }, 0);
}

// MathJax line-breaking (MathJaxProvider) wraps whatever CAN wrap, but a
// single unbreakable atom (a \boxed group, a wide fraction) can still exceed
// its container. Scrollboxes and clipping are both banned (Hitaansh), so the
// remaining fallback is his other sanctioned option: shrink that one
// equation's font until it fits. Measured post-typeset; hidden elements
// (visibility: hidden) still have layout, so they measure fine.
function shrinkOversizeMath(roots: Element[]) {
  for (const root of roots) {
    const containers = root.querySelectorAll<HTMLElement>("mjx-container");
    for (let i = 0; i < containers.length; i++) {
      const mjx = containers[i];
      // MathBlock/Prose render inline <span> hosts (clientWidth 0), so walk
      // up to the nearest ancestor with a real layout width to fit against.
      let box: HTMLElement | null = mjx.parentElement;
      while (box && box.clientWidth <= 0) box = box.parentElement;
      if (!box) continue;
      const avail = box.clientWidth;
      // displayAlign "center" overhangs both sides, so scrollWidth (which
      // counts rightward overflow only) undercounts; the inner mjx-math box
      // is the true content width.
      const math = mjx.querySelector<HTMLElement>("mjx-math");
      const need = Math.max(mjx.scrollWidth, math ? math.getBoundingClientRect().width : 0);
      if (need > avail + 1) {
        const current = parseFloat(window.getComputedStyle(mjx).fontSize);
        mjx.style.fontSize = `${Math.floor(current * (avail / need) * 0.98)}px`;
      }
    }
  }
}

export function MathBlock({ latex, inline = false }: { latex: string; inline?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = inline ? `\\(${latex}\\)` : `\\[${latex}\\]`;
    if (ready) scheduleTypeset(ref.current);
  }, [latex, inline, ready]);
  return <span ref={ref} />;
}

export function Prose({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = text;
    if (ready) scheduleTypeset(ref.current);
  }, [text, ready]);
  return <span ref={ref} />;
}
