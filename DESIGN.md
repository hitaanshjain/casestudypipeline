---
name: MathGPT Case Study Pipeline
description: The app is the worksheet - printed study matter on a desk, in the team's deck-brand navy and ivory.
colors:
  paper: "#FAF8F4"
  ink: "#011E4F"
  desk: "#E9E4DA"
  periwinkle: "#82A4F5"
  blue: "#176CF8"
  blue-hover: "#2F7DFF"
  paper-shade: "#F3EFE7"
  manila: "#EFE9DF"
  white: "#FFFFFF"
  rule: "rgba(1, 30, 79, 0.16)"
  rule-strong: "rgba(1, 30, 79, 0.3)"
  ink-dim: "rgba(1, 30, 79, 0.64)"
  success: "#1D6F4C"
  warning: "#A6600F"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.7rem, 4vw, 2.3rem)"
    fontWeight: 700
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.4rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.1rem, 2vw, 1.4rem)"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 800
    letterSpacing: "0.08em"
rounded:
  sheet: "3px"
  box: "6px"
  soft: "8px"
  card: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "26px"
components:
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.pill}"
    padding: "0 13px"
    height: "30px"
  tab:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.ink-dim}"
    rounded: "10px 10px 0 0"
    padding: "9px 18px 11px"
  tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  mathbox:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "12px 18px 14px"
  textarea:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "14px 16px"
---

# Design System: MathGPT Case Study Pipeline

<!-- Direction A - The Worksheet, chosen by Hitaansh July 30, 2026 from three
served drafts (see direction-approved.md and the IMPECCABLE DIRECTION CONTRACT
comment at the top of webapp/app/globals.css). This file records the system AS
BUILT; the code is ground truth. Product truth lives in PRODUCT.md - do not
duplicate it here. -->

## Overview

**Creative North Star: "The Worksheet"**

The app IS the worksheet: every surface reads as printed course material lying
on a desk, refusing the dark glass dashboard this category defaults to. Sheets
of ivory paper (#FAF8F4) with crisp navy ink borders sit on a warm desk
(#E9E4DA), casting hard offset print shadows. Results tabs are manila folder
tabs standing up from the sheet. Buttons are inked stamps you physically press.
Problems get circled exercise numbers; answers go in ruled boxes. A serif
masthead over a thin ink rule opens each page like the header of a handout.

The palette is not a generic "academic ivory" default: it is derived directly
from the team's flashcard deck brand assets (navy #011E4F, ivory #FAF8F4,
periwinkle #82A4F5, blue #176CF8), so the app and the study artifacts it
produces read as one set of course materials. Density is calm and generous;
one sheet, centered, is the default composition.

**Key Characteristics:**
- Printed matter, not glass: opaque paper surfaces, ink borders, hard offset shadows, no blur, no translucency.
- One ink: nearly every line, border, and letter is navy or a navy alpha; blue is functional (labels, actions, active states).
- Serif masthead voice over sans working text.
- Physicality in motion: stamps press, cards flip, rows settle onto the page.
- Student surfaces never scroll horizontally; math wraps or shrinks instead.

## Colors

An ink-and-paper monochrome with one working blue; every neutral is either
paper or a navy alpha, so the whole page mixes from four brand values.

### Primary
- **Ink** (`--ink`, #011E4F): the deck-brand navy. All text, all borders (1.5px signature weight), the shadow color, the meta-box cap bar, the callout icon disc. Math inherits it via `currentColor` - math is never colored separately.
- **Blue** (`--blue`, #176CF8): the working accent. Uppercase field/equation labels, primary buttons, active tab and timeline states, links ("Show more"), the progress fill, focus outlines. Hover face #2F7DFF.

### Secondary
- **Periwinkle** (`--peri`, #82A4F5): the deck brand's soft accent. In the app shell it is reserved; it appears as the flashcard front's subtitle/variable-key/footer color (as `--cc-front-accent`). Do not spend it on app chrome.

### Neutral
- **Paper** (`--paper`, #FAF8F4): the sheet. Panel faces, button faces, tab-active face, circled-number fills.
- **White** (#FFFFFF): "brighter paper" for working surfaces sitting ON a sheet: mathboxes, inputs, the meta box body, active timeline rows, callout bodies, the PDF frame.
- **Desk** (`--desk`, #E9E4DA): the page background the sheets lie on. Never a component face.
- **Paper shade** (`--paper-shade`, #F3EFE7): a slightly darker paper for utility strips (the deck controls bar).
- **Manila** (#EFE9DF): inactive folder tabs only.
- **Rule** (`--rule`, rgba(1,30,79,0.16)) and **Rule strong** (`--rule-strong`, rgba(1,30,79,0.3)): hairlines, ruled textarea lines, secondary borders (chips, reference items, pending dots).
- **Ink dim** (`--ink-dim`, rgba(1,30,79,0.64)): secondary text - intros, captions, course row, inactive tabs.
- **Success** (#1D6F4C) and **Warning** (#A6600F): stage/callout semantics only, each with a paper-tinted wash (#EDF6F1 / #FDF3E2). There is no red; failure is a warning-amber, honest-note tone.
- Tinted mathbox washes: **#E9F0FE** (`primary`/`blue` rows) and **#F0F3FE** (`rule`/`violet` rows) - the only two tints that may sit behind math.

**Compatibility aliases.** `--bg`, `--panel`, `--panel-2`, `--text`, `--muted`,
`--accent`, `--accent-2`, `--border`, `--shadow` are pre-redesign token names
that now resolve INTO the paper world (e.g. `--bg: var(--desk)`,
`--accent: var(--blue)`, `--panel-2: #ffffff`). They exist so any rule not
hand-restyled still lands on-world. Write new CSS against the world's own
names; the aliases are a safety net, not the vocabulary.

**The One Ink Rule.** Text, borders, shadows, and math are navy or a navy
alpha. Blue marks what works (labels, actions, active); periwinkle belongs to
the flashcard fronts. Nothing else gets a hue.

**The Deck Brand Rule.** The flip cards carry their own local copy of the
brand palette (`--cc-*` custom properties in conceptCards.module.css) rather
than reading the app tokens. This is deliberate: the cards must stay exactly
on the source-deck brand even if the app tokens drift. Do not "clean up" the
duplication.

## Typography

**Display Font:** Source Serif 4 (via next/font, `--font-serif`; fallback Georgia, serif). Weights 400/600/700 + italic.
**Body Font:** Public Sans (via next/font, `--font-sans`; fallback system-ui). Weights 400/600/700/800.

**Character:** A print pairing: the serif speaks in the voice of the printed
worksheet (mastheads, exercise titles, the quoted problem in italic), while
Public Sans does all the working text - labels, buttons, captions, form input.
If a student would see it typeset on a handout, it is serif; if it is
interface, it is sans.

### Hierarchy
- **Display / Masthead** (serif 700, clamp(1.7rem, 4vw, 2.3rem), -0.01em): the page masthead ("Generate a Case Study"). Results header uses clamp(1.6rem, 3.6vw, 2.2rem); the run page a smaller clamp(1.4rem, 3vw, 1.8rem).
- **Headline / Step title** (serif 700, clamp(1.4rem, 3vw, 2rem), lh 1.1, -0.015em): practice-deck step titles beside the circled exercise number.
- **Title** (serif 700, ~1.1-1.5rem, -0.01em): deck title, reference-sheet heading, results center titles.
- **Body** (sans 400, 0.95rem, lh 1.55): intro copy, captions (ink-dim), form text. Reading measure capped (~58-70ch).
- **Label** (sans 800, UPPERCASE, blue, tracked): the system's signature small type. Field labels 0.78rem / 0.04em; card labels 0.72rem / 0.06em; equation labels and the meta-box cap bar 0.68rem / 0.08em (the cap bar is paper-on-ink, not blue). Final-row equation labels flip to ink.
- **Course row** (sans 600, 0.8rem, ink-dim): "MathGPT · Calculus 1" left, page slug right, above a 1.5px ink rule. This is masthead furniture - the printed course header of a handout - not a kicker.

**The Masthead Rule.** Serif appears only where print would put it: mastheads,
step/deck/reference titles, circled exercise numbers (`.stepNum`), and the
student's problem quoted in italic. Never on buttons, labels, or navigation.

**The No-Kicker Rule.** No uppercase eyebrow/kicker lines above titles. The
only thing above a masthead is the course row, and it reads as document
furniture, not marketing.

## Layout

Sheets centered on the desk. The body is the desk (`--desk`); each page places
one or more `.panel` sheets on it with generous padding (38px 44px on the home
sheet; 22-26px at <=620px). Max widths: 640px (run progress, results header
column), 760px (home form), 1180px (results working area). Vertical page
padding ~44-56px top.

The results page stacks: header sheet, then the manila tab bar (padded left
22px so tabs sit inboard of the sheet edge), then the active tab's sheet with
its top-left corner squared where the tab meets it. The practice deck is a
two-column grid, `minmax(0, 1fr) 320px`: exercise stage left, sticky meta-box
sidebar right (`top: 18px`), with the reference sheet spanning both columns
below; single column below 900px. Common rhythm: 12px gaps in math stacks,
16-20px between cards/columns, 26px between page sections.

Every grid track that can contain math is `minmax(0, 1fr)`, never bare `1fr`
or an implicit `auto` track: pre-typeset LaTeX is one long unbreakable string
and an auto track sizes to it, breaking the layout before MathJax runs.

## Elevation & Depth

Depth is stacked paper, not floating glass. Shadows are hard offset prints -
zero blur, always the ink color at an alpha - as if each sheet were pressed
onto the one below. There are no blurred drop shadows anywhere.

### Shadow Vocabulary
- **Sheet offset** (`--shadow`: `6px 10px 0 rgba(1,30,79,0.1)`): every `.panel`. Direction is fixed down-right; never re-angle it.
- **Stamp** (`2.5px 3px 0 rgba(1,30,79,0.85)` on `.btn`; alpha 0.55 under `.btn-primary`): buttons at rest. Hover lifts to `3.5px 4px 0` with a -1px translate; active presses to `1px 1px 0` with a +1px translate; disabled fades to alpha 0.4.
- **Card inset frame** (flip cards): `inset 0 0 0 6px <face bg>, inset 0 0 0 7px <face fg>` - a printed 1px keyline inset 6px from the card edge, matching the source decks.

**The Hard Offset Rule.** All depth is `Xpx Ypx 0` in ink alpha. If a shadow
needs blur to look right, the element does not belong in this world.

## Shapes

Print-shop corner language, tightest on the largest surfaces: sheets 3px,
working boxes (mathboxes, inputs, callouts, meta box) 6px, timeline rows 8px,
folder tabs `10px 10px 0 0` (square where they meet the sheet), flip cards
14px, and full pills (999px) for everything stamp-like: buttons, chips, theme
chip, reference-jump. Circles for counted things: exercise numbers (40px,
serif), timeline indices (24px), status dots (13px), callout icon discs (30px).

The signature stroke is the **1.5px ink border** - panels, mathboxes, inputs,
tabs, buttons, meta box, step circles all use it (final equation rows upgrade
to 2.5px; flip cards use 2px in their own brand frame). Secondary enclosures
(chips, reference items) drop to 1.5px `--rule-strong`. Dashed
`--rule-strong` is the tear-off line under the deck controls strip. The ruled
textarea draws real notebook rules with a repeating gradient aligned to its
1.6 line-height.

## Components

Physical, hand-operated, quietly playful: everything is something a student
could touch on a real desk. Shared classes live in `webapp/app/globals.css`;
page/component modules restyle only their own layout.

### Sheet (`.panel`)
- Paper face, 1.5px ink border, 3px corners, sheet-offset shadow. The base surface every page composes from.

### Stamped Buttons (`.btn`, `.btn-primary`)
- Pill, 1.5px ink border, sans 700, min-height 40px. Default face paper/ink; primary face blue/white with blue border.
- The stamp behavior IS the interaction design: rest `2.5px 3px 0` shadow; hover lifts (translate(-1px,-1px), bigger shadow); active presses (translate(1px,1.5px), `1px 1px 0`). Transitions 0.1-0.12s ease. Focus-visible: 2px blue outline, 2px offset.
- Icon buttons place a drawn icon (see Icons) inline at 8px gap.

### Manila Paper Tabs (results)
- Inactive: manila #EFE9DF, ink-dim text, 1.5px ink border with `border-bottom: none`, radius 10px 10px 0 0, nudged down 1.5px to tuck behind the sheet; hover lightens to #F5F0E8.
- Active: paper face, ink text, z-index above the sheet edge so tab and sheet fuse into one piece of paper. A failed artifact tab carries a small warning pill badge.

### Course Row (masthead line)
- The two-ended 0.8rem ink-dim line over a 1.5px ink rule that opens every sheet: "MathGPT · Calculus 1" left, page slug right. Present on home, run, and results; it is what makes each screen read as a document.

### Mathbox (`.equation-row`, `.equation-stack`, `.math-card`)
- White box, 1.5px ink border, 6px corners, blue uppercase label over the math. Variants: `.rule`/`.violet` wash #F0F3FE, `.primary`/`.blue` wash #E9F0FE; `.final` upgrades to a 2.5px border, larger bolder math, ink label. Math size clamps fluidly (base clamp(1.1rem, 2.5vw, 1.65rem)).
- No overflow scrollbox, ever: MathJax v4 line-breaking (`displayOverflow: "linebreak"`, inline breaks) wraps what can wrap, and `Math.tsx` post-typeset auto-shrinks the rare unbreakable atom (a `\boxed` group, a wide fraction) to fit its container. Treat both as system behavior new surfaces inherit for free by using `MathBlock`/`Prose`.
- All math in a batch typesets in ONE MathJax pass (Math.tsx queues per commit) - never call `typesetPromise` per element.

### Meta Box (deck sidebar `.problemCard`)
- Printed reference box: navy cap bar (paper text, 0.68rem/800/uppercase/0.08em) over a white body holding the problem statement. Sticky beside the deck stage.

### Circled Numbers
- `.stepNum`: 40px circle, 1.5px ink border, white fill, serif 700 - the worksheet exercise number.
- `.timeline-index`: 24px circle, `--rule-strong` border, paper fill, sans 800 0.72rem; active turns border and numeral blue.

### Flip Cards (concept flashcards)
- The deck brand verbatim, via local `--cc-*` tokens (see The Deck Brand Rule): navy front with ivory text and periwinkle accents, ivory back with navy text and blue accents, each face framed by the inset keyline. 14px corners, min-height 380px.
- Both faces occupy grid cell 1/1 so the card's height is natively the taller face's height - no JS measurement. Flip: `rotateY(180deg)` on `.inner`, `transform 0.5s`, `perspective: 1400px`, `backface-visibility: hidden`. The whole card is one button; focus-visible outlines it in the accent.
- The back runs a compact type scale (0.82-0.98rem) deliberately: every px of back height is empty navy on the front.

### Callouts (`.callout`)
- White 1.5px-ink box, 6px corners, two-column grid: a 30px ink disc holding a drawn icon (paper-colored stroke), then title + ink-dim body. `.success` washes #EDF6F1 with a green disc; `.warning` washes #FDF3E2 with an amber disc.

### Ruled Textarea (home form)
- White, 1.5px ink border, with real notebook rule lines painted by a repeating gradient locked to the 1.6em line-height (`background-attachment: local` so rules scroll with the text). Focus: 2px blue outline. Theme chips below it are pill buttons (rule-strong border, ink-dim text) that fill the theme field on click.

### Deck Player Chrome
- Topbar (serif deck title + step count) over a full-width progress track (6px, blue fill, `scaleX` transition 0.35s), then the controls strip: paper-shade background, dashed rule below, holding Previous/Next/Final Slide stamps. Controls sit ABOVE the stage, so their position is independent of step height - they never move during navigation. Hidden steps stay mounted (`visibility: hidden`, absolutely positioned in `.stepsHost`) so the stage keeps the tallest step's height and MathJax measures real widths.
- Timeline sidebar buttons: transparent until hover (5% ink wash); active is white with a 1.5px blue border.

### Icons
- Every icon comes from `webapp/components/icons.tsx` and only from there: 16-unit viewBox, 1.6 stroke (1.8 on the smallest marks: check, bang, dash), round caps/joins, `currentColor`, `aria-hidden`, default 15px. Hand-drawn single-path glyphs (download, check, bang, dash, target, spark, refresh, skip-to-end). No icon fonts, no emoji-as-icon, no icon libraries; new glyphs are drawn in this same stroke and weight.

### Motion (system-wide)
- **One entrance per surface:** mathboxes/cards settle in with `rowIn` (0.4-0.42s, translateY(8px) + fade); practice-deck steps enter with `practiceDeckEnter` (0.42s, translateY(12px) + fade), restarted per navigation by flipping animation-name from none. Nothing else animates on load.
- Micro-motion: stamp transitions 0.1-0.12s; card flip 0.5s; progress fill 0.35s; the running status dot pulses a fading blue ring (1.15s loop).
- `prefers-reduced-motion: reduce` collapses all durations AND explicitly pins entrance end states (`opacity: 1; transform: none`) - required because rows and cards mount at opacity 0 and would otherwise never appear.

## Do's and Don'ts

### Do:
- **Do** compose every screen from sheets on the desk: `.panel` on `--desk`, opened by the course row + serif masthead.
- **Do** use the 1.5px ink border and hard offset shadows for anything that must read as printed.
- **Do** render all math through `MathBlock`/`Prose` so it inherits ink, line-breaks, batch-typesets, and auto-shrinks; give any grid track holding math `minmax(0, 1fr)`.
- **Do** use the uppercase blue tracked label (0.68-0.78rem, 800) for every small heading and field label.
- **Do** draw new icons in the icons.tsx system: 16-box, ~1.6 stroke, currentColor.
- **Do** keep the flip cards on their local `--cc-*` palette copy.

### Don't:
- **Don't** put an overflow scrollbox on any student surface - no `overflow-x: auto` around math or cards; wrap or shrink instead (Hitaansh: "scrollables are shit").
- **Don't** show cache or provenance labels to students ("from cache", "generated earlier"); pipeline state like `cached`/`cacheOffline` stays internal and renders as a plain done check.
- **Don't** move the deck controls below or beside the stage; they live above it precisely so they never shift with step height.
- **Don't** color math or set it in a non-ink color; math is text and inherits `currentColor`.
- **Don't** add blur shadows, translucent glass, dark surfaces, or gradients (the only sanctioned gradient is the textarea's rule lines).
- **Don't** add kickers/eyebrows above titles; the course row is the only masthead furniture.
- **Don't** style the pipeline's artifacts with this system: the compiled case-study PDF is produced by the LaTeX house preamble (grayscale, print-safe) and the flashcard/practice-deck JSON are renderer-agnostic content contracts (PRODUCT.md principle 5). This system styles the app that PRESENTS them.
- **Don't** treat `webapp/public/design-demos/*.html` as product surfaces; they are the three direction drafts kept for reference (direction-approved.md), not sources of truth.
