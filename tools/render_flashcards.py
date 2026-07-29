"""Render stored flashcards to a standalone HTML page.

Reads card content out of the running MySQL container, so what you see is what
the database actually holds, not a re-read of the source decks. Card JSON that
is not in the database yet can be previewed straight from disk with --file.

Run from the repo root:
  python tools/render_flashcards.py                   all 75 cards, deck theme
  python tools/render_flashcards.py 28 29             specific card ids
  python tools/render_flashcards.py --section 3.3     every card in one section
  python tools/render_flashcards.py --theme dark      both sides on navy
  python tools/render_flashcards.py --theme both      dark and light side by side
  python tools/render_flashcards.py --math-scale 2    bigger formulas (v1 only)
  python tools/render_flashcards.py --out mycards.html
  python tools/render_flashcards.py --file flashcard_examples_v2/*.json

Two card formats are rendered. v1 cards (the 75 imported from the source decks)
store their math as pre-rendered SVG blobs. format_version 2 cards store LaTeX,
which MathJax typesets in the browser, so a v2 preview needs network access for
the MathJax CDN; raw \\(...\\) on screen means MathJax did not load.

The default "deck" theme mirrors the source decks' design: navy front, cream
back. v1 math SVGs are normalised to currentColor at render time, so formulas
always match their card's text colour regardless of theme (the stored SVGs
bake in the deck palette: cream fills on fronts, navy fills on backs).

Needs the container running (not for --file):
  cd flashcards_db && docker compose up -d
"""
import argparse
import binascii
import glob
import html
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONTAINER = "flashcards-db"

CSS = """
:root { --navy:#011E4F; --cream:#FAF8F4; --accent:#82A4F5; }
body { margin:0; padding:2rem; background:#3a3a3a;
       font-family:Georgia,'Times New Roman',serif; }
h1 { color:#fff; font-size:1.15rem; font-weight:400; max-width:70rem;
     margin:0 auto 1.5rem; }
h1 small { color:#bbb; }
.label { max-width:70rem; margin:0 auto .6rem; color:#ddd; font-size:.8rem;
         letter-spacing:.05em; text-transform:uppercase; }
.row { display:flex; flex-wrap:wrap; gap:1.5rem; max-width:70rem;
       margin:0 auto 2.5rem; }
.card { flex:1 1 22rem; min-width:20rem; aspect-ratio:4/3;
        border-radius:14px; padding:2.2rem 2rem; display:flex;
        flex-direction:column; align-items:center; justify-content:center;
        text-align:center; gap:.55rem; overflow:hidden; }
.card .title { font-size:1.9rem; font-weight:700; line-height:1.1; }
/* The decks draw a thin rule under the subtitle as a decorative shape; the
   extractor deliberately skips decor, so the divider is reproduced in CSS. */
.card .sub { font-style:italic; font-size:1.05rem; margin-bottom:.7rem;
             padding-bottom:.75rem; border-bottom:1px solid; width:82%; }
.card p { margin:0; font-size:.95rem; line-height:1.45; }
.card .math { margin:.15rem 0; }
/* Sized by the scaled width/height attrs; max-width guards overflow. */
.card .math svg { max-width:100%; height:auto; vertical-align:middle; }

.dark { background:var(--navy); color:var(--cream);
        border:2px solid rgba(250,248,244,.35); }
.dark .sub { color:var(--accent); border-color:rgba(250,248,244,.45); }

.light { background:var(--cream); color:#12264f; border:2px solid #d8d8d0; }
.light .title { color:#0d1b3e; }
.light .sub { color:#4a6ab8; border-color:rgba(13,27,62,.35); }

/* format_version 2 cards. Their math is MathJax, which sizes itself against
   the surrounding text, so these rules control every dimension the JSON
   deliberately does not carry. v2 cards keep 4:3 as a floor but may grow:
   a six-row back on a narrow screen must stay readable, not be clipped. */
.card.v2 { overflow:visible; }
.card .varkey { font-size:.78rem; opacity:.85; margin:.1rem 0 .35rem; }
.card .central { font-size:1.15rem; margin:.3rem 0; }
.card .supporting { font-size:.85rem; }
.card .foot { font-style:italic; font-size:.82rem; margin-top:.5rem; opacity:.9; }
.card .step { font-size:.9rem; margin:.12rem 0; }
.card .step.bold { font-weight:700; }
/* An aligned run is ONE derivation, not a pile of independent statements, so
   it is drawn as a single left-aligned block behind a rule: its rows share a
   left edge (which lines up the relation symbols when the left sides match)
   and the rule shows at a glance where the derivation starts and stops.
   Non-aligned rows stay centred, one per line, as separate claims. */
.card .derivation { text-align:left; max-width:100%; margin:.2rem 0;
                    padding:.2rem 0 .2rem .8rem; border-left:2px solid; }
.dark .varkey, .dark .foot { color:var(--accent); }
.dark .derivation { border-color:rgba(250,248,244,.45); }
.light .foot { color:#176CF8; }
.light .derivation { border-color:rgba(13,27,62,.35); }
"""

# MathJax typesets v2 cards in the browser. Loaded from a CDN and only when a
# v2 card is on the page, so the v1 preview stays a single offline file.
MATHJAX = (
    '<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],'
    'displayMath:[["\\\\[","\\\\]"]]},svg:{fontCache:"global"}};</script>'
    '<script id="MathJax-script" async '
    'src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>')


def query(sql):
    """Run SQL in the container and return rows as lists of fields.

    Blobs are selected as HEX() by the caller so no field can contain a tab or
    newline, which keeps the tab-separated output safe to split.
    """
    cmd = ["docker", "exec", "-i", CONTAINER, "mysql", "-uroot",
           "-pchange_me_root", "-N", "-B", "flashcards", "-e", sql]
    try:
        done = subprocess.run(cmd, capture_output=True, text=True)
    except FileNotFoundError:
        sys.exit("docker not found on PATH. Is Docker Desktop installed?")
    if done.returncode != 0:
        sys.exit("Database query failed. Is the container running?\n"
                 "  cd flashcards_db && docker compose up -d\n\n"
                 + done.stderr.strip())
    return [line.split("\t") for line in done.stdout.strip().splitlines() if line]


def fetch(card_ids=None, section=None):
    where = ""
    if card_ids:
        where = "WHERE f.id IN (%s)" % ",".join(str(int(i)) for i in card_ids)
    elif section:
        where = "WHERE ch.section_number = '%s'" % section.replace("'", "")
    sql = """
        SELECT f.id, ch.section_number, co.name,
               HEX(f.front_content), HEX(f.back_content)
        FROM flashcard f
        JOIN concept co ON f.concept_id = co.id
        JOIN learning_objective lo ON co.lo_id = lo.id
        JOIN chapter ch ON lo.chapter_id = ch.id
        %s
        ORDER BY f.id;
    """ % where
    cards = []
    for row in query(sql):
        card_id, section_number, concept, front_hex, back_hex = row
        cards.append({
            "id": card_id,
            "section": section_number,
            "concept": concept,
            "front": json.loads(binascii.unhexlify(front_hex).decode("utf-8")),
            "back": json.loads(binascii.unhexlify(back_hex).decode("utf-8")),
        })
    return cards


def load_files(patterns):
    """Cards read from disk, so prompt output can be previewed before import.

    Wildcards are expanded here as well as by the shell, because PowerShell
    passes *.json through to the program untouched.
    """
    cards = []
    for pattern in patterns:
        matches = ([Path(p) for p in sorted(glob.glob(pattern))]
                   if any(ch in pattern for ch in "*?[") else [Path(pattern)])
        if not matches:
            sys.exit("No file matched %s" % pattern)
        for path in matches:
            try:
                doc = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError) as exc:
                sys.exit("Cannot read %s as card JSON: %s" % (path, exc))
            # format_version rides on the wrapper, but render_side dispatches
            # per side, so each side carries a copy.
            version = doc.get("format_version")
            cards.append({
                "id": path.stem,
                "section": doc.get("source", {}).get("section", "?"),
                "concept": doc.get("concept", path.stem),
                "front": dict(doc["front"], format_version=version),
                "back": dict(doc["back"], format_version=version),
            })
    return cards


def prepare_svg(svg, scale):
    """Make a stored math SVG theme-proof and size it.

    The decks bake their palette into the SVG fills (cream on fronts, navy on
    backs), so a formula rendered on the wrong background disappears entirely.
    MathJax output is monochrome, so every fill/stroke can safely become
    currentColor, making the math inherit its card's text colour.

    Sizing: scale the root tag's natural width/height so formulas keep their
    relative proportions instead of being squashed to one uniform height.
    """
    svg = re.sub(r'(fill|stroke)="#[0-9A-Fa-f]{3,6}"', r'\1="currentColor"', svg)
    svg = re.sub(
        r'\b(width|height)="([\d.]+)px"',
        lambda m: '%s="%.0fpx"' % (m.group(1), float(m.group(2)) * scale),
        svg, count=2)  # only the root tag carries width/height attrs
    return svg


def render_side(doc, theme, scale):
    """Dispatch on format. v1 cards have no format_version key."""
    if doc.get("format_version") == 2:
        return render_side_v2(doc, theme)
    return render_side_v1(doc, theme, scale)


def _math_html(latex, display=False):
    r"""One latex string as a MathJax delimiter.

    The latex is HTML-escaped: the browser decodes the entities back before
    MathJax reads the text node, so escaping is lossless, and an unescaped
    "<" in a formula would otherwise be parsed as the start of a tag.
    """
    fence = ("\\[%s\\]" if display else "\\(%s\\)")
    return fence % html.escape(latex)


def _segments_html(segments):
    """Segments as HTML. Math becomes a MathJax delimiter, not an image.

    Spacing convention: the renderer owns it, not the card. Cards are
    inconsistent about padding text segments ("Differentiate " carries a
    trailing space, "The integrand is" does not), so each text value is
    stripped and the segments are joined with exactly one space. Fixing it
    here rather than in the cards means no card can produce a double space.
    """
    out = []
    for segment in segments:
        if segment.get("t") == "math":
            out.append(_math_html(segment["latex"]))
        else:
            value = segment.get("v", "").strip()
            if value:
                out.append(html.escape(value))
    return " ".join(out)


def _step_html(row):
    """One back row as a line. The bold row is the conclusion."""
    return '<p class="step%s">%s</p>' % (" bold" if row.get("bold") else "",
                                         _segments_html(row["segments"]))


def _rows_html(rows):
    """Back rows, with each contiguous run of aligned rows grouped as one block.

    The contract (G07) allows at most one such run, but grouping every run
    keeps this honest if that ever loosens.
    """
    parts, i = [], 0
    while i < len(rows):
        if not rows[i].get("aligned"):
            parts.append(_step_html(rows[i]))
            i += 1
            continue
        j = i
        while j < len(rows) and rows[j].get("aligned"):
            j += 1
        parts.append('<div class="derivation">%s</div>'
                     % "".join(_step_html(row) for row in rows[i:j]))
        i = j
    return parts


def render_side_v2(doc, theme):
    """A format_version 2 side. Layout lives here, never in the JSON."""
    parts = ['<div class="card v2 %s">' % theme,
             '<div class="title">%s</div>' % html.escape(doc["title"])]
    if "subtitle" in doc:                                   # front
        parts.append('<div class="sub">%s</div>' % html.escape(doc["subtitle"]))
        central = doc["central"]
        parts.append('<div class="math central">%s</div>'
                     % (_math_html(central["latex"], display=True)
                        if "latex" in central else html.escape(central["text"])))
        key = doc.get("variable_key") or []
        if key:
            parts.append('<div class="varkey">%s</div>' % "; ".join(
                "%s = %s" % (_math_html(e["symbol"]), html.escape(e["meaning"]))
                for e in key))
        parts.append("<p>%s</p>" % html.escape(doc["main_description"]))
        parts.append('<p class="supporting">%s</p>'
                     % html.escape(doc["supporting_description"]))
        parts.append('<p class="foot">%s</p>' % html.escape(doc["footer"]))
    else:                                                   # back
        parts.append('<div class="sub">%s</div>' % _segments_html(doc["problem"]))
        parts.extend(_rows_html(doc["rows"]))
        parts.append('<p class="foot">%s</p>' % html.escape(doc["footer"]))
    parts.append("</div>")
    return "".join(parts)


def render_side_v1(doc, theme, scale):
    """One side as a styled card. math_svg values are already SVG markup."""
    parts = ['<div class="card %s">' % theme,
             '<div class="title">%s</div>' % html.escape(doc["title"])]
    for i, block in enumerate(doc["blocks"]):
        if block["type"] == "math_svg":
            parts.append('<div class="math">%s</div>'
                         % prepare_svg(block["value"], scale))
        elif i == 0:
            parts.append('<div class="sub">%s</div>' % html.escape(block["value"]))
        else:
            parts.append("<p>%s</p>" % html.escape(block["value"]))
    parts.append("</div>")
    return "".join(parts)


# Page heading, which names where the cards actually came from.
DB_ORIGIN = "the database <small>rendered from stored JSON</small>"
FILE_ORIGIN = "disk <small>rendered from card JSON</small>"

# theme name -> list of (front_theme, back_theme, label_suffix) rows per card
THEMES = {
    "deck": [("dark", "light", "")],
    "dark": [("dark", "dark", "")],
    "light": [("light", "light", "")],
    "both": [("dark", "dark", " / dark"), ("light", "light", " / light")],
}


def build_page(cards, theme, scale, origin=DB_ORIGIN):
    out = ["<meta charset=utf-8><title>Flashcards</title>",
           "<style>%s</style>" % CSS,
           "<h1>%d card%s from %s</h1>"
           % (len(cards), "" if len(cards) == 1 else "s", origin)]
    if any(side.get("format_version") == 2
           for card in cards for side in (card["front"], card["back"])):
        out.append(MATHJAX)
    for card in cards:
        for front_theme, back_theme, suffix in THEMES[theme]:
            out.append('<div class="label">#%s &middot; %s &middot; %s%s</div>'
                       % (html.escape(card["id"]), html.escape(card["section"]),
                          html.escape(card["concept"]), suffix))
            out.append('<div class="row">%s%s</div>'
                       % (render_side(card["front"], front_theme, scale),
                          render_side(card["back"], back_theme, scale)))
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Render stored flashcards to HTML.")
    ap.add_argument("ids", nargs="*", type=int, help="card ids (default: all)")
    ap.add_argument("--section", help="render every card in a section, e.g. 3.3")
    ap.add_argument("--theme", choices=sorted(THEMES), default="deck",
                    help="deck = navy front, cream back, like the source decks")
    ap.add_argument("--math-scale", type=float, default=1.75,
                    help="multiplier on the formulas' natural size (v1 cards "
                         "only: v2 math is sized by MathJax)")
    ap.add_argument("--file", nargs="+", metavar="CARD.json",
                    help="render card JSON from disk instead of the database")
    ap.add_argument("--out", default="flashcards.html")
    args = ap.parse_args()

    if args.file and (args.ids or args.section):
        sys.exit("--file reads cards from disk, so card ids and --section, "
                 "which are database filters, cannot be combined with it.")

    cards = (load_files(args.file) if args.file
             else fetch(card_ids=args.ids, section=args.section))
    if not cards:
        sys.exit("No cards matched. Try: python tools/render_flashcards.py")

    origin = FILE_ORIGIN if args.file else DB_ORIGIN
    out_path = REPO / args.out
    out_path.write_text(build_page(cards, args.theme, args.math_scale, origin),
                        encoding="utf-8", newline="\n")
    print("wrote %s (%d cards, theme=%s, math x%.2f)"
          % (args.out, len(cards), args.theme, args.math_scale))


if __name__ == "__main__":
    main()
