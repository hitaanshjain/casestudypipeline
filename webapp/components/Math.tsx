"use client";
import { useEffect, useRef } from "react";
import { useMathJaxReady } from "./MathJaxProvider";

// Every MathBlock/Prose writes its LaTeX source into the DOM and then waits for
// MathJax to replace it. Two rules govern what the user sees in between:
//
//  1. NEVER show the source. A host stays visibility:hidden until its typeset
//     pass finishes, so a student sees blank space for a moment rather than
//     \[\int_0^6 ...\]. Layout is preserved (visibility, not display), so
//     nothing jumps when the math lands.
//  2. NEVER stay blank forever. If MathJax fails, never loads (CDN blocked), or
//     simply takes too long, the host is revealed anyway at REVEAL_DEADLINE_MS:
//     raw LaTeX is bad, invisible content is worse.
//
// Batching: per-element typesetPromise calls serialize inside MathJax as
// separate layout passes, so N elements cost N passes. The practice deck mounts
// every step at once (~50 elements), which made the whole tab render as source
// for seconds. Elements enqueue here and are typeset in as few passes as
// possible, VISIBLE ONES FIRST, so the step the student is actually looking at
// lands quickly instead of queueing behind four hidden steps.
const REVEAL_DEADLINE_MS = 4000;

type Pending = { el: HTMLElement; reveal: () => void };

let pending: Pending[] = [];
let scheduled = false;

// MathJax records internal offsets into the text nodes it typesets. Overwriting an
// element's textContent while a pass is running invalidates those offsets, and the
// pass dies with "IndexSizeError: The offset N is larger than the Text node's
// length". React re-renders freely (a deck navigation, a state change), so the two
// races below are both reachable and both have to be closed:
//   1. content rewritten WHILE a pass is in flight -> defer the rewrite until the
//      pass finishes, then apply it and re-typeset.
//   2. content rewritten AFTER a pass -> clear MathJax's record of the old node
//      first, so it never walks a stale tree.
const inFlight = new WeakSet<HTMLElement>();
const deferred = new WeakMap<HTMLElement, () => void>();

function mathJaxTypesetClear(el: HTMLElement): void {
  const mj = (window as unknown as { MathJax?: { typesetClear?: (els: Element[]) => void } }).MathJax;
  try {
    mj?.typesetClear?.([el]);
  } catch {
    // Clearing is a courtesy to MathJax's bookkeeping; failing it is not fatal.
  }
}

function reveal(el: HTMLElement) {
  el.style.visibility = "";
}

// visibility:hidden ancestors (the practice deck's inactive steps) still have
// layout, so MathJax can measure them — they just don't need to be typeset
// first. checkVisibility is Chrome 105+/Safari 17.4+; older engines fall back to
// treating everything as visible, which only costs ordering, never correctness.
function isVisible(el: HTMLElement): boolean {
  const check = (el as unknown as { checkVisibility?: (o: object) => boolean }).checkVisibility;
  if (typeof check !== "function") return true;
  try {
    return check.call(el, { visibilityProperty: true, contentVisibilityAuto: true });
  } catch {
    return true;
  }
}

async function typesetBatch(batch: Pending[]): Promise<void> {
  if (batch.length === 0) return;
  for (const p of batch) inFlight.add(p.el);
  const mj = (window as unknown as { MathJax?: { typesetPromise?: (els: Element[]) => Promise<void> } }).MathJax;
  try {
    if (typeof mj?.typesetPromise !== "function") throw new Error("MathJax.typesetPromise unavailable");
    await mj.typesetPromise(batch.map((p) => p.el));
    shrinkOversizeMath(batch.map((p) => p.el));
  } catch (err) {
    // A whole batch can fail on one bad expression. Retry each element alone so
    // one malformed \frac cannot blank out an entire deck, and log rather than
    // swallow: a silent catch here is why a rendering failure was invisible.
    console.error("MathJax batch typeset failed; retrying individually", err);
    for (const p of batch) {
      try {
        if (typeof mj?.typesetPromise !== "function") break;
        await mj.typesetPromise([p.el]);
        shrinkOversizeMath([p.el]);
      } catch (single) {
        console.error("MathJax could not typeset an expression; showing its source", single);
      }
    }
  } finally {
    for (const p of batch) {
      inFlight.delete(p.el);
      // Reveal whatever state each host ended in — typeset math on success, raw
      // source on failure. Never leave one invisible.
      p.reveal();
      // A re-render that arrived mid-pass parked its rewrite here rather than
      // mutating a node MathJax was walking. Apply it now.
      const run = deferred.get(p.el);
      if (run) {
        deferred.delete(p.el);
        run();
      }
    }
  }
}

function scheduleTypeset(el: HTMLElement, revealFn: () => void) {
  // One entry per element per flush: queueing the same host twice makes MathJax
  // walk a tree it has already rewritten.
  if (!pending.some((p) => p.el === el)) pending.push({ el, reveal: revealFn });
  if (scheduled) return;
  scheduled = true;
  // A macrotask so every effect in the current commit enqueues first.
  setTimeout(async () => {
    const batch = pending.filter((p) => p.el.isConnected);
    pending = [];
    scheduled = false;
    // Visible first, in its own pass: the active practice-deck step is ~6
    // elements and lands in one fast pass instead of waiting behind ~44 hidden ones.
    const visible = batch.filter((p) => isVisible(p.el));
    const hidden = batch.filter((p) => !isVisible(p.el));
    await typesetBatch(visible);
    await typesetBatch(hidden);
  }, 0);
}

// MathJax line-breaking (MathJaxProvider) wraps whatever CAN wrap, but a single
// unbreakable atom (a \boxed group, a wide fraction) can still exceed its
// container. Scrollboxes and clipping are both banned (Hitaansh), so the
// remaining fallback is his other sanctioned option: shrink that one equation's
// font until it fits. Hidden elements still have layout, so they measure fine.
function shrinkOversizeMath(roots: Element[]) {
  for (const root of roots) {
    const containers = root.querySelectorAll<HTMLElement>("mjx-container");
    for (let i = 0; i < containers.length; i++) {
      const mjx = containers[i];
      // MathBlock/Prose render inline <span> hosts (clientWidth 0), so walk up
      // to the nearest ancestor with a real layout width to fit against.
      let box: HTMLElement | null = mjx.parentElement;
      while (box && box.clientWidth <= 0) box = box.parentElement;
      if (!box) continue;
      const avail = box.clientWidth;
      // displayAlign "center" overhangs both sides, so scrollWidth (which counts
      // rightward overflow only) undercounts; the inner mjx-math box is the true
      // content width.
      const math = mjx.querySelector<HTMLElement>("mjx-math");
      const need = Math.max(mjx.scrollWidth, math ? math.getBoundingClientRect().width : 0);
      if (need > avail + 1) {
        const current = parseFloat(window.getComputedStyle(mjx).fontSize);
        mjx.style.fontSize = `${Math.floor(current * (avail / need) * 0.98)}px`;
      }
    }
  }
}

// Writes the source into the host, hides it, and queues the typeset. Returns a
// cleanup that cancels the reveal deadline. Split out of the hook so a rewrite
// parked during an in-flight pass can replay exactly the same work afterwards.
function applyAndSchedule(el: HTMLElement, source: string, ready: boolean): () => void {
  // Drop MathJax's record of whatever was here before, so a later pass never
  // walks the tree it built for the previous content.
  mathJaxTypesetClear(el);
  el.textContent = source;
  el.style.visibility = "hidden";
  const deadline = setTimeout(() => reveal(el), REVEAL_DEADLINE_MS);
  // Without MathJax the deadline is the only thing that will ever reveal this;
  // the effect re-runs when `ready` flips, which is the normal path.
  if (ready) {
    scheduleTypeset(el, () => {
      clearTimeout(deadline);
      reveal(el);
    });
  }
  return () => clearTimeout(deadline);
}

// Shared by MathBlock and Prose: write the source, hide the host, hand it to the
// batcher, and guarantee a reveal even if MathJax never answers.
function useTypeset(source: string, deps: unknown[]) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // MathJax is walking this node right now. Park the rewrite; typesetBatch runs
    // it once the pass completes. Mutating here is what raises IndexSizeError.
    if (inFlight.has(el)) {
      deferred.set(el, () => applyAndSchedule(el, source, ready));
      return;
    }
    return applyAndSchedule(el, source, ready);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, ready]);
  return ref;
}

export function MathBlock({ latex, inline = false }: { latex: string; inline?: boolean }) {
  const ref = useTypeset(inline ? `\\(${latex}\\)` : `\\[${latex}\\]`, [latex, inline]);
  return <span ref={ref} />;
}

export function Prose({ text }: { text: string }) {
  const ref = useTypeset(text, [text]);
  return <span ref={ref} />;
}
