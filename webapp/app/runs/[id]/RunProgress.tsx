"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RunState, StageKey } from "@/lib/runStore";
import { BangIcon, CheckIcon } from "@/components/icons";
import styles from "./run.module.css";

const POLL_MS = 1500;
const MAX_CONSECUTIVE_FAILURES = 5;

const STAGE_ORDER: StageKey[] = ["stage1", "critic", "case_study", "concept_cards", "practice_deck"];

const STAGE_LABELS: Record<StageKey, string> = {
  stage1: "Understand the problem",
  critic: "Verify the math",
  case_study: "Case study worksheet",
  concept_cards: "Concept flashcards",
  practice_deck: "Practice deck",
};

export default function RunProgress({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<RunState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const failureCount = useRef(0);
  const forwarded = useRef(false);

  // Poll GET /api/runs/:id on a fixed interval. Stops on 404 (run not found) or
  // once the run reports done; a transient fetch/network error keeps polling but
  // is counted, and MAX_CONSECUTIVE_FAILURES in a row surfaces an error panel
  // (which self-clears the moment a poll succeeds again).
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const res = await fetch(`/api/runs/${id}`);
        if (cancelled) return;

        if (res.status === 404) {
          setNotFound(true);
          if (timer) clearInterval(timer);
          return;
        }
        if (!res.ok) throw new Error(`unexpected status ${res.status}`);

        const data = (await res.json()) as RunState;
        if (cancelled) return;

        failureCount.current = 0;
        setConnectionLost(false);
        setState(data);

        if (data.done && timer) clearInterval(timer);
      } catch {
        if (cancelled) return;
        failureCount.current += 1;
        if (failureCount.current >= MAX_CONSECUTIVE_FAILURES) setConnectionLost(true);
      }
    }

    poll();
    timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [id]);

  // Auto-forward once the run finishes successfully. Guarded by a ref so a
  // second state update after the redirect is already in flight doesn't
  // re-trigger router.replace.
  useEffect(() => {
    if (state?.done && !state.failed && !forwarded.current) {
      forwarded.current = true;
      router.replace(`/runs/${id}/results`);
    }
  }, [state, id, router]);

  if (notFound) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.panel}`}>
          <div className={styles.courseRow}>
            <span>MathGPT &middot; Calculus 1</span>
            <span>Case Study Pipeline</span>
          </div>
          <h1>Run not found</h1>
          <p className={styles.muted}>No run exists with id &ldquo;{id}&rdquo;.</p>
          <Link href="/" className="btn btn-primary">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (connectionLost) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.panel}`}>
          <div className={styles.courseRow}>
            <span>MathGPT &middot; Calculus 1</span>
            <span>Case Study Pipeline</span>
          </div>
          <div className="callout warning">
            <div className="callout-icon">
              <BangIcon />
            </div>
            <div>
              <h3>Lost connection</h3>
              <p>Could not reach the run status endpoint after several attempts. Still retrying.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!state) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.panel}`}>
          <div className={styles.courseRow}>
            <span>MathGPT &middot; Calculus 1</span>
            <span>Case Study Pipeline</span>
          </div>
          <h1>Loading run...</h1>
        </div>
      </main>
    );
  }

  const completed = STAGE_ORDER.filter((k) => {
    const status = state.stages[k].status;
    return status === "done" || status === "cached";
  }).length;
  const progressPct = Math.round((completed / STAGE_ORDER.length) * 100);

  const failedStages = STAGE_ORDER.filter((k) => state.stages[k].status === "failed");

  return (
    <main className={styles.main}>
      <div className={`panel ${styles.panel}`}>
        <div className={styles.courseRow}>
          <span>MathGPT &middot; Calculus 1</span>
          <span>Case Study Pipeline</span>
        </div>
        <h1 className={styles.title}>Generating your case study</h1>

        <div className="progress-track">
          <div className="progress-fill" style={{ transform: `scaleX(${progressPct / 100})` }} />
        </div>

        <ul className={styles.stageList}>
          {STAGE_ORDER.map((key) => {
            const stage = state.stages[key];
            // A run that failed upstream (stage1 or critic) never advances the
            // three fan-out stages past "pending": render those as a dim
            // "skipped" state rather than looking like they're still running.
            const display = state.failed && stage.status !== "done" && stage.status !== "failed" ? "skipped" : stage.status;
            return (
              <li key={key} className={styles.stageRow}>
                <span className={`${styles.icon} ${styles[display]}`} aria-hidden="true">
                  {(display === "done" || display === "cached") && <CheckIcon size={16} />}
                  {display === "failed" && <BangIcon size={16} />}
                </span>
                <div className={styles.stageBody}>
                  <span className={styles.label}>{STAGE_LABELS[key]}</span>
                  {stage.status === "failed" && stage.message && (
                    <p className={styles.failMessage}>{stage.message}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {state.failed && (
          <div className="callout warning">
            <div className="callout-icon">
              <BangIcon />
            </div>
            <div>
              <h3>We could not verify this problem&rsquo;s math</h3>
              {failedStages.length === 0 && <p>The run stopped before any stage reported a specific error.</p>}
              {failedStages.map((k) => (
                <p key={k}>
                  {STAGE_LABELS[k]}: {state.stages[k].message ?? "failed"}
                </p>
              ))}
              <Link href="/" className="btn" style={{ marginTop: 8, display: "inline-block" }}>
                Try another problem
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
