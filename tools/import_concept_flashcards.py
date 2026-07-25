"""Import the 75 concept flashcard decks into flashcards_db seed SQL.

Deterministic: same decks + same mapping in, byte-identical SQL out.
Spec: plan/concept_flashcard_import_design.md
Run from repo root:  python tools/import_concept_flashcards.py
"""
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DECKS = REPO / "OpenStax_Calculus_Volume_1_Concept_Only_Flashcards"

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "asvg": "http://schemas.microsoft.com/office/drawing/2016/SVG/main",
}
R_EMBED = "{%s}embed" % NS["r"]
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def deck_paths():
    """All deck paths, sorted by filename (the 001_ prefix gives book order)."""
    return sorted(DECKS.glob("*/*.pptx"), key=lambda p: p.name)


def _shape_y(el):
    """Vertical offset in EMU. Every text-bearing shape in these decks has one."""
    off = el.find("./p:spPr/a:xfrm/a:off", NS)
    return int(off.get("y")) if off is not None else 0


def _shape_text(el):
    """Runs concatenated within a paragraph, paragraphs joined by newline.

    Runs must not be separated: PowerPoint splits "f(x)=..." across runs.
    """
    paras = []
    for p in el.findall("./p:txBody/a:p", NS):
        runs = "".join(t.text or "" for t in p.findall("./a:r/a:t", NS))
        if runs.strip():
            paras.append(runs)
    return "\n".join(paras)


def _pic_rel_id(el):
    """Prefer the svgBlip relationship: the primary .png is SVG bytes misnamed."""
    blip = el.find("./p:blipFill/a:blip", NS)
    if blip is None:
        return None
    svg = blip.find("./a:extLst/a:ext/asvg:svgBlip", NS)
    return (svg if svg is not None else blip).get(R_EMBED)


def _rels(zf, slide):
    root = ET.fromstring(zf.read("ppt/slides/_rels/%s.xml.rels" % slide))
    return {r.get("Id"): r.get("Target") for r in root.findall(REL_NS + "Relationship")}


def _shape_tree(zf, slide):
    root = ET.fromstring(zf.read("ppt/slides/%s.xml" % slide))
    return root.find("./p:cSld/p:spTree", NS)


def extract_side(zf, slide):
    """One slide as {"title": str, "blocks": [{"type","value"}, ...]}.

    The first text block in vertical order becomes the title.
    """
    rels = _rels(zf, slide)
    items = []
    for el in _shape_tree(zf, slide):
        tag = el.tag.split("}")[1]
        if tag == "sp":
            text = _shape_text(el)
            if text:
                items.append((_shape_y(el), {"type": "text", "value": text}))
        elif tag == "pic":
            target = rels[_pic_rel_id(el)].replace("../", "ppt/")
            svg = zf.read(target).decode("utf-8")
            items.append((_shape_y(el), {"type": "math_svg", "value": svg}))
    items.sort(key=lambda item: item[0])  # stable: ties keep document order
    blocks = [block for _, block in items]
    title = ""
    if blocks and blocks[0]["type"] == "text":
        title = blocks.pop(0)["value"]
    return {"title": title, "blocks": blocks}


def count_content_shapes(zf, slide):
    """Source-side count for the completeness guard: text shapes plus pictures."""
    n = 0
    for el in _shape_tree(zf, slide):
        tag = el.tag.split("}")[1]
        if tag == "sp" and _shape_text(el):
            n += 1
        elif tag == "pic":
            n += 1
    return n
