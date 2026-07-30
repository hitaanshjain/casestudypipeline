"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RunState, StageKey, StageStatus } from "@/lib/runStore";
import {
  ConceptCardsPayload,
  PracticeDeck,
  type TConceptCardsPayload,
  type TPracticeDeck,
} from "@/lib/contracts";
import ConceptCardGrid from "@/components/ConceptCardGrid";
import PracticeDeckPlayer from "@/components/PracticeDeckPlayer";
import styles from "./results.module.css";

type TabKey = Extract<StageKey, "case_study" | "concept_cards" | "practice_deck">;

const TAB_ORDER: TabKey[] = ["case_study", "concept_cards", "practice_deck"];

const TAB_LABELS: Record<TabKey, string> = {
  case_study: "Case Study",
  concept_cards: "Concept Cards",
  practice_deck: "Practice Deck",
};

// Cache is section-scoped, not problem-scoped (progress.md, Task 9 note): a
// "cached" stage means this exact content was generated for an earlier run on
// the same textbook section, not for this specific problem.
const CACHE_NOTES: Record<Exclude<TabKey, "case_study">, string> = {
  concept_cards: "These flashcards were generated earlier for this topic.",
  practice_deck: "This practice deck was generated earlier for this topic.",
};

type StageEntry = { status: StageStatus; message?: string };

export default function Results({ id }: { id: string }) {
  const [state, setState] = useState<RunState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);

  const [problemExpanded, setProblemExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const problemRef = useRef<HTMLParagraphElement>(null);

  const [conceptCards, setConceptCards] = useState<TConceptCardsPayload | null>(null);
  const [practiceDeck, setPracticeDeck] = useState<TPracticeDeck | null>(null);
  const [artifactsAttempted, setArtifactsAttempted] = useState(false);

  // Fetch state ONCE on mount (no polling: by the time a run reaches this page
  // it is already `done`, per RunProgress.tsx's auto-forward). If done, fetch
  // both artifact JSONs in parallel; a 404 on either just means that stage
  // failed and is tolerated (decision 2), not treated as a fetch error.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      let res: Response;
      try {
        res = await fetch(`/api/runs/${id}`);
      } catch {
        return;
      }
      if (cancelled) return;
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) return;

      const data = (await res.json()) as RunState;
      if (cancelled) return;
      setState(data);
      if (!data.done) return;

      const [ccRes, pdRes] = await Promise.all([
        fetch(`/api/runs/${id}/artifacts/concept_cards.json`).catch(() => null),
        fetch(`/api/runs/${id}/artifacts/practice_deck.json`).catch(() => null),
      ]);
      if (cancelled) return;

      if (ccRes?.ok) {
        const raw = await ccRes.json().catch(() => null);
        const parsed = raw !== null ? ConceptCardsPayload.safeParse(raw) : null;
        if (parsed?.success) setConceptCards(parsed.data);
      }
      if (pdRes?.ok) {
        const raw = await pdRes.json().catch(() => null);
        const parsed = raw !== null ? PracticeDeck.safeParse(raw) : null;
        if (parsed?.success) setPracticeDeck(parsed.data);
      }
      if (!cancelled) setArtifactsAttempted(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Default tab: Case Study if its stage isn't failed, else the first
  // non-failed tab (decision 10). Computed at render time rather than via an
  // effect + setState (which would trigger an extra cascading render for no
  // benefit): `activeTab` stays null until the user picks one, and the
  // effective tab falls back to this derived default so a manual click is
  // never overridden.
  const effectiveTab: TabKey | null =
    activeTab ?? (state ? TAB_ORDER.find((k) => state.stages[k].status !== "failed") ?? "case_study" : null);

  useEffect(() => {
    if (problemRef.current) {
      setCanExpand(problemRef.current.scrollHeight > problemRef.current.clientHeight + 1);
    }
  }, [state?.input.problem]);

  if (notFound) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.centerPanel}`}>
          <p className="eyebrow">MathGPT Pipeline</p>
          <h1>Run not found</h1>
          <p className={styles.muted}>No run exists with id &ldquo;{id}&rdquo;.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (!state) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.centerPanel}`}>
          <p className="eyebrow">MathGPT Pipeline</p>
          <h1>Loading results...</h1>
        </div>
      </main>
    );
  }

  if (!state.done) {
    return (
      <main className={styles.main}>
        <div className={`panel ${styles.centerPanel}`}>
          <p className="eyebrow">MathGPT Pipeline</p>
          <h1>This run has not finished yet</h1>
          <p className={styles.muted}>Results appear here once every stage has stopped running.</p>
          <Link href={`/runs/${id}`} className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
            Run still in progress
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.pageInner}>
        <div className={`panel ${styles.headerPanel}`}>
          <p className="eyebrow">Results</p>
          <h1 className={styles.title}>Your case study is ready</h1>
          <p ref={problemRef} className={`${styles.problemText} ${problemExpanded ? styles.expanded : ""}`}>
            {state.input.problem}
          </p>
          {canExpand && (
            <button type="button" className={styles.expandBtn} onClick={() => setProblemExpanded((e) => !e)}>
              {problemExpanded ? "Show less" : "Show more"}
            </button>
          )}
          {state.input.preferredContext && <div className={styles.themeChip}>{state.input.preferredContext}</div>}
        </div>

        <div className={`panel ${styles.tabPanel}`}>
          <div className={styles.tabBar} role="tablist">
            {TAB_ORDER.map((key) => {
              const status = state.stages[key].status;
              const isActive = effectiveTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`btn ${isActive ? "btn-primary" : ""} ${styles.tabBtn}`}
                  onClick={() => setActiveTab(key)}
                >
                  {TAB_LABELS[key]}
                  {status === "failed" && <span className={styles.badgeFailed}>failed</span>}
                  {status === "cached" && <span className={styles.badgeCached}>from cache</span>}
                </button>
              );
            })}
          </div>

          {state.cacheOffline && (effectiveTab === "concept_cards" || effectiveTab === "practice_deck") && (
            <p className={styles.cacheNote}>
              Flashcard cache was offline for this run; cards were generated fresh and not saved.
            </p>
          )}

          <div className={styles.tabBody}>
            {effectiveTab === "case_study" && (
              <CaseStudyTab id={id} stage={state.stages.case_study} failed={state.failed} />
            )}
            {effectiveTab === "concept_cards" && (
              <ConceptCardsTab
                id={id}
                stage={state.stages.concept_cards}
                payload={conceptCards}
                attempted={artifactsAttempted}
                failed={state.failed}
              />
            )}
            {effectiveTab === "practice_deck" && (
              <PracticeDeckTab
                id={id}
                stage={state.stages.practice_deck}
                deck={practiceDeck}
                attempted={artifactsAttempted}
                failed={state.failed}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Shared: a stage that never ran because an earlier stage failed the whole
// run. Natural navigation never surfaces this (a failed run auto-forwards
// here with the failed tab selected, per decision 10), so it only guards a
// manually-typed results URL against attempting artifact rendering or
// showing the misleading "reported success but data could not be read"
// message for a stage that was never attempted at all.
// ---------------------------------------------------------------------------
function StageNotRun() {
  return (
    <div className="callout">
      <div className="callout-icon">-</div>
      <div>
        <h3>This stage did not run</h3>
        <p>This stage did not run because the run failed earlier.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Case Study tab
// ---------------------------------------------------------------------------
function CaseStudyTab({ id, stage, failed }: { id: string; stage: StageEntry; failed: boolean }) {
  const [texExists, setTexExists] = useState(false);
  const [logExists, setLogExists] = useState(false);

  useEffect(() => {
    if (stage.status !== "failed") return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/runs/${id}/artifacts/case_study.tex`, { method: "HEAD" })
        .then((r) => r.ok)
        .catch(() => false),
      fetch(`/api/runs/${id}/artifacts/compile.log`, { method: "HEAD" })
        .then((r) => r.ok)
        .catch(() => false),
    ]).then(([tex, log]) => {
      if (!cancelled) {
        setTexExists(tex);
        setLogExists(log);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, stage.status]);

  if (stage.status === "pending" && failed) {
    return <StageNotRun />;
  }

  if (stage.status === "failed") {
    return (
      <div>
        <div className="callout warning">
          <div className="callout-icon">!</div>
          <div>
            <h3>The case study could not be generated</h3>
            <p>{stage.message ?? "The case study stage failed."}</p>
          </div>
        </div>
        {(texExists || logExists) && (
          <div className={styles.downloadRow}>
            {texExists && (
              <a className="btn" href={`/api/runs/${id}/artifacts/case_study.tex`} download>
                Download .tex
              </a>
            )}
            {logExists && (
              <a className="btn" href={`/api/runs/${id}/artifacts/compile.log`} download>
                Download compile.log
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <object data={`/api/runs/${id}/artifacts/case_study.pdf`} type="application/pdf" className={styles.pdfObject}>
        <p className={styles.pdfFallback}>
          Your browser cannot display the PDF inline.{" "}
          <a href={`/api/runs/${id}/artifacts/case_study.pdf`} target="_blank" rel="noopener noreferrer">
            Open the PDF
          </a>
          .
        </p>
      </object>
      <div className={styles.downloadRow}>
        <a className="btn btn-primary" href={`/api/runs/${id}/artifacts/case_study.pdf`} download>
          Download PDF
        </a>
        <a className="btn" href={`/api/runs/${id}/artifacts/case_study.tex`} download>
          Download .tex
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Concept Cards tab
// ---------------------------------------------------------------------------
function ConceptCardsTab({
  id,
  stage,
  payload,
  attempted,
  failed,
}: {
  id: string;
  stage: StageEntry;
  payload: TConceptCardsPayload | null;
  attempted: boolean;
  failed: boolean;
}) {
  if (stage.status === "pending" && failed) {
    return <StageNotRun />;
  }

  if (stage.status === "failed") {
    return (
      <div className="callout warning">
        <div className="callout-icon">!</div>
        <div>
          <h3>Concept cards could not be generated</h3>
          <p>{stage.message ?? "The concept cards stage failed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {stage.status === "cached" && <p className={styles.cacheNote}>{CACHE_NOTES.concept_cards}</p>}
      {payload ? (
        <ConceptCardGrid cards={payload.cards} />
      ) : attempted ? (
        <div className="callout warning">
          <div className="callout-icon">!</div>
          <div>
            <h3>Concept cards could not be loaded</h3>
            <p>The stage reported success but the card data could not be read.</p>
          </div>
        </div>
      ) : (
        <p className={styles.muted}>Loading concept cards...</p>
      )}
      <div className={styles.downloadRow}>
        <a className="btn" href={`/api/runs/${id}/artifacts/concept_cards.json`} download>
          Download JSON
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Practice Deck tab
// ---------------------------------------------------------------------------
function PracticeDeckTab({
  id,
  stage,
  deck,
  attempted,
  failed,
}: {
  id: string;
  stage: StageEntry;
  deck: TPracticeDeck | null;
  attempted: boolean;
  failed: boolean;
}) {
  if (stage.status === "pending" && failed) {
    return <StageNotRun />;
  }

  if (stage.status === "failed") {
    return (
      <div className="callout warning">
        <div className="callout-icon">!</div>
        <div>
          <h3>The practice deck could not be generated</h3>
          <p>{stage.message ?? "The practice deck stage failed."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {stage.status === "cached" && <p className={styles.cacheNote}>{CACHE_NOTES.practice_deck}</p>}
      {deck ? (
        <PracticeDeckPlayer deck={deck} />
      ) : attempted ? (
        <div className="callout warning">
          <div className="callout-icon">!</div>
          <div>
            <h3>Practice deck could not be loaded</h3>
            <p>The stage reported success but the deck data could not be read.</p>
          </div>
        </div>
      ) : (
        <p className={styles.muted}>Loading practice deck...</p>
      )}
      <div className={styles.downloadRow}>
        <a className="btn" href={`/api/runs/${id}/artifacts/practice_deck.json`} download>
          Download JSON
        </a>
      </div>
    </div>
  );
}
