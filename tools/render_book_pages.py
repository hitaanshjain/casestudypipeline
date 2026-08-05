#!/usr/bin/env python3
"""Render OpenStax book pages to PNGs for visual extraction.

Speaks BOOK page numbers; the +8 PDF offset is applied internally.
Usage: python tools/render_book_pages.py --pages 199-203 --out <dir> [--dpi 200]
"""
import argparse
import os

import fitz

PDF = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "references", "calculus-textbook.pdf")
OFFSET = 8


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", required=True, help="book page range, e.g. 199-203 or 199")
    ap.add_argument("--out", required=True)
    ap.add_argument("--dpi", type=int, default=200)
    a = ap.parse_args()
    lo, _, hi = a.pages.partition("-")
    lo, hi = int(lo), int(hi or lo)
    os.makedirs(a.out, exist_ok=True)
    doc = fitz.open(PDF)
    for bp in range(lo, hi + 1):
        pix = doc[bp + OFFSET - 1].get_pixmap(dpi=a.dpi)
        out = os.path.join(a.out, "p%d.png" % bp)
        pix.save(out)
        print(out)


if __name__ == "__main__":
    main()
