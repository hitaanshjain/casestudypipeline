"""Render stored flashcards to a standalone HTML page.

Reads card content out of the running MySQL container, so what you see is what
the database actually holds, not a re-read of the source decks.

Run from the repo root:
  python tools/render_flashcards.py                   all 75 cards, dark theme
  python tools/render_flashcards.py 28 29             specific card ids
  python tools/render_flashcards.py --section 3.3     every card in one section
  python tools/render_flashcards.py --theme light     recolour the math for light
  python tools/render_flashcards.py --theme both      both themes side by side
  python tools/render_flashcards.py --out mycards.html

Needs the container running:  cd flashcards_db && docker compose up -d
"""
import argparse
import binascii
import html
import json
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
.card .sub { font-style:italic; font-size:1.05rem; margin-bottom:.7rem; }
.card p { margin:0; font-size:.95rem; line-height:1.45; }
.card .math { margin:.15rem 0; }
/* The SVGs carry a viewBox, so we can scale the math with the text instead of
   trusting the pixel width MathJax baked in. */
.card .math svg { height:1.7em; width:auto; max-width:100%; vertical-align:middle; }

.dark { background:var(--navy); color:var(--cream);
        border:2px solid rgba(250,248,244,.35); }
.dark .sub { color:var(--accent); }

/* The stored math is filled #FAF8F4 for the decks' navy background. One rule
   recolours every formula for a light card. */
.light { background:#fdfdfb; color:#1a2233; border:2px solid #d8d8d0; }
.light .title { color:#0d1b3e; }
.light .sub { color:#4a6ab8; }
.light .math svg [fill="#FAF8F4"] { fill:#1a2233; }
.light .math svg [stroke="#FAF8F4"] { stroke:#1a2233; }
"""


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


def render_side(doc, theme):
    """One side as a styled card. math_svg values are already SVG markup."""
    parts = ['<div class="card %s">' % theme,
             '<div class="title">%s</div>' % html.escape(doc["title"])]
    for i, block in enumerate(doc["blocks"]):
        if block["type"] == "math_svg":
            parts.append('<div class="math">%s</div>' % block["value"])
        elif i == 0:
            parts.append('<div class="sub">%s</div>' % html.escape(block["value"]))
        else:
            parts.append("<p>%s</p>" % html.escape(block["value"]))
    parts.append("</div>")
    return "".join(parts)


def build_page(cards, themes):
    out = ["<meta charset=utf-8><title>Flashcards</title>",
           "<style>%s</style>" % CSS,
           '<h1>%d card%s from the database <small>rendered from stored JSON'
           "</small></h1>" % (len(cards), "" if len(cards) == 1 else "s")]
    for card in cards:
        for theme in themes:
            suffix = " / %s" % theme if len(themes) > 1 else ""
            out.append('<div class="label">#%s &middot; %s &middot; %s%s</div>'
                       % (html.escape(card["id"]), html.escape(card["section"]),
                          html.escape(card["concept"]), suffix))
            out.append('<div class="row">%s%s</div>'
                       % (render_side(card["front"], theme),
                          render_side(card["back"], theme)))
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Render stored flashcards to HTML.")
    ap.add_argument("ids", nargs="*", type=int, help="card ids (default: all)")
    ap.add_argument("--section", help="render every card in a section, e.g. 3.3")
    ap.add_argument("--theme", choices=["dark", "light", "both"], default="dark")
    ap.add_argument("--out", default="flashcards.html")
    args = ap.parse_args()

    cards = fetch(card_ids=args.ids, section=args.section)
    if not cards:
        sys.exit("No cards matched. Try: python tools/render_flashcards.py")

    themes = ["dark", "light"] if args.theme == "both" else [args.theme]
    out_path = REPO / args.out
    out_path.write_text(build_page(cards, themes), encoding="utf-8", newline="\n")
    print("wrote %s (%d cards, %s)" % (args.out, len(cards), args.theme))


if __name__ == "__main__":
    main()
