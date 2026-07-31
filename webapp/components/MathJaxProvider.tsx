"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const MathJaxReady = createContext(false);
export function useMathJaxReady() { return useContext(MathJaxReady); }

export default function MathJaxProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (window as any).MathJax = {
      tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
      // v4 line breaking: wide display math wraps to the container width and
      // inline math may break across lines, so no element ever needs an
      // overflow-x scrollbox (a Hitaansh requirement: no scrollables).
      output: { displayOverflow: "linebreak", linebreaks: { inline: true } },
      chtml: { scale: 1.05, displayAlign: "center" },
      // v4 ships the accessibility explorer on by default: expressions become
      // focusable (blue highlight box) with an (i) help icon top-right.
      // Hitaansh wants neither (July 31). Cost: screen readers lose MathJax's
      // interactive math exploration on these pages.
      options: { enableExplorer: false, enableSpeech: false, enableBraille: false },
      startup: { pageReady: () => (window as any).MathJax.startup.defaultPageReady().then(() => setReady(true)) },
    };
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js";
    s.defer = true;
    document.head.appendChild(s);
  }, []);
  return <MathJaxReady.Provider value={ready}>{children}</MathJaxReady.Provider>;
}
