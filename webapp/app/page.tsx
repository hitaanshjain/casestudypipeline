"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const THEME_CHIPS = ["Soccer", "Architecture", "Music", "Cooking", "Space", "Fitness"] as const;

export default function Home() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [theme, setTheme] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          preferredContext: theme.trim() || undefined,
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
        <p className="eyebrow">MathGPT Pipeline</p>
        <h1 className={styles.title}>Generate a Case Study</h1>
        <p className={styles.intro}>
          Paste a textbook problem and the pipeline builds a verified case study, concept
          flashcards, and a practice deck around it.
        </p>

        <form onSubmit={onSubmit} className={styles.form}>
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
              <div className="callout-icon">!</div>
              <div>
                <h3>Could not start the run</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={submitting}>
            {submitting ? "Starting..." : "Run Pipeline"}
          </button>
        </form>
      </div>
    </main>
  );
}
