"use client";
import { useEffect, useRef } from "react";
import { useMathJaxReady } from "./MathJaxProvider";

export function MathBlock({ latex, inline = false }: { latex: string; inline?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = inline ? `\\(${latex}\\)` : `\\[${latex}\\]`;
    if (ready) (window as any).MathJax?.typesetPromise?.([ref.current]).catch(() => {});
  }, [latex, inline, ready]);
  return <span ref={ref} />;
}

export function Prose({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useMathJaxReady();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = text;
    if (ready) (window as any).MathJax?.typesetPromise?.([ref.current]).catch(() => {});
  }, [text, ready]);
  return <span ref={ref} />;
}
