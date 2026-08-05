"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { BangIcon } from "@/components/icons";
import type { ResolveResult } from "@/lib/exerciseBank";
import type { ProblemSource } from "@/lib/citation";
import styles from "./page.module.css";

const THEME_CHIPS = ["Soccer", "Architecture", "Music", "Cooking", "Space", "Fitness"] as const;

export default function Home() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [theme, setTheme] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"paste" | "lookup">("paste");
  const [refInput, setRefInput] = useState("");
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveFailed, setResolveFailed] = useState(false); // network-level failure only
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookupReady = mode === "lookup" && resolved?.found === true && resolved.available === true;

  const doResolve = useCallback(async (q: string) => {
    setResolving(true);
    try {
      const res = await fetch(`/api/problems/resolve?ref=${encodeURIComponent(q)}`);
      setResolved(await res.json());
    } catch {
      setResolveFailed(true);
    } finally {
      setResolving(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "lookup") return;
    const q = refInput.trim();
    if (!q) return;
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void doResolve(q);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [refInput, mode, doResolve]);

  function onRefChange(value: string) {
    setRefInput(value);
    setResolved(null);
    setResolveFailed(false);
  }

  function onRefKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const q = refInput.trim();
    if (q) void doResolve(q);
  }

  function switchMode(next: "paste" | "lookup") {
    setMode(next);
    setResolved(null);
    setResolveFailed(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const problemText = lookupReady && resolved?.found && resolved.available ? resolved.text : problem;
      const source: ProblemSource | undefined =
        lookupReady && resolved?.found && resolved.available
          ? { book_key: "openstax_calculus_v1", chapter: resolved.ref.chapter, section: resolved.ref.section, number: resolved.ref.number }
          : undefined;
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemText,
          preferredContext: theme.trim() || undefined,
          source,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      router.push(`/runs/${data.id}`);
      // Deliberately leave submitting=true: the button should stay disabled
      // through the navigation rather than flash back to enabled.
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.courseRow}>
          <span>MathGPT &middot; Calculus 1</span>
          <span>Case Study Pipeline</span>
        </div>
        <h1 className={styles.title}>Generate a Case Study</h1>
        <p className={styles.intro}>
          Paste a textbook problem and the pipeline builds a verified case study, concept
          flashcards, and a practice deck around it.
        </p>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.modeSwitch} role="group" aria-label="Problem input mode">
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === "paste" ? styles.modeBtnActive : ""}`}
              aria-pressed={mode === "paste"}
              onClick={() => switchMode("paste")}
            >
              Paste a problem
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === "lookup" ? styles.modeBtnActive : ""}`}
              aria-pressed={mode === "lookup"}
              onClick={() => switchMode("lookup")}
            >
              Textbook lookup
            </button>
          </div>

          {mode === "paste" ? (
            <>
              <label className={styles.fieldLabel} htmlFor="problem">
                Problem
              </label>
              <textarea
                id="problem"
                name="problem"
                rows={6}
                required
                minLength={10}
                className={styles.textarea}
                placeholder="Paste a textbook problem, e.g. Water flows into a tank at r(t) = 20 + 5t liters per hour..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className={styles.fieldLabel} htmlFor="ref">
                Textbook reference
              </label>
              <input
                id="ref"
                type="text"
                className={styles.refInput}
                placeholder="e.g. 3.41 or Chapter 3, Problem 41 (OpenStax Calculus Vol 1, chapter 3 for now)"
                value={refInput}
                onChange={(e) => onRefChange(e.target.value)}
                onKeyDown={onRefKeyDown}
                autoComplete="off"
              />
              {resolving && <p className={styles.refStatus}>Looking it up...</p>}
              {resolveFailed && (
                <p className={styles.refStatus}>Could not reach the server. Check your connection and try again.</p>
              )}
              {resolved && renderResolved(resolved)}
            </>
          )}

          <label className={styles.fieldLabel} htmlFor="theme">
            Theme (optional)
          </label>
          <input
            id="theme"
            name="theme"
            type="text"
            className={styles.themeInput}
            placeholder="e.g. Soccer"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
          <div className={styles.chips}>
            {THEME_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={styles.chip}
                onClick={() => setTheme(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {error && (
            <div className="callout warning">
              <div className="callout-icon">
                <BangIcon />
              </div>
              <div>
                <h3>Could not start the run</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submit}`}
            disabled={submitting || (mode === "lookup" && !lookupReady)}
          >
            {submitting ? "Starting..." : "Run Pipeline"}
          </button>
        </form>
      </div>
    </main>
  );
}

function renderResolved(r: ResolveResult) {
  if (r.found && r.available) {
    return (
      <div className={styles.preview}>
        <p className={styles.previewCitation}>{r.citation}</p>
        {r.hinted_section && (
          <p className={styles.refStatus}>
            {`You typed section ${r.hinted_section}; this exercise is in ${
              r.ref.section === "3.review" ? "the chapter review" : `section ${r.ref.section}`
            }.`}
          </p>
        )}
        <p className={styles.previewText}>{r.text}</p>
        <p className={styles.attribution}>{r.attribution}</p>
      </div>
    );
  }
  let message: string;
  switch (r.reason) {
    case "needs_figure":
      message = "This problem needs its printed graph or figure, which we can't show yet. Paste the problem text instead.";
      break;
    case "bad_ref":
      message = "Enter a reference like 3.41 or Chapter 3, Problem 41.";
      break;
    case "not_extracted":
      message =
        r.chapters.length === 0
          ? "No textbook chapters are available yet. Paste the problem instead."
          : `Only chapter ${r.chapters.join(", ")} is available right now. Paste the problem instead.`;
      break;
    case "no_such_exercise":
      message = `Chapter ${r.chapter} has exercises 1-${r.max}.`;
      break;
    default: {
      // Exhaustiveness check: a malformed payload or a future union member must
      // never fall through to rendering undefined field interpolations.
      const _exhaustive: never = r;
      void _exhaustive;
      message = "Could not resolve that reference.";
    }
  }
  return <p className={styles.refStatus}>{message}</p>;
}
