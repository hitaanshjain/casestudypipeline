"""One-shot check: stored blob hashes equal the hashes of freshly extracted decks."""
import hashlib
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_concept_flashcards as imp

want = {}
for cid, path in enumerate(imp.deck_paths(), start=1):
    deck = imp.extract_deck(path)
    want[cid] = (
        hashlib.sha256(imp.card_json(deck["front"])).hexdigest(),
        hashlib.sha256(imp.card_json(deck["back"])).hexdigest(),
    )

query = ("SELECT id, SHA2(front_content,256), SHA2(back_content,256) "
         "FROM flashcard ORDER BY id")
result = subprocess.run(
    ["docker", "exec", "-i", "flashcards-db", "mysql", "-uroot",
     "-pchange_me_root", "-N", "-B", "flashcards", "-e", query],
    capture_output=True, text=True, check=True)

rows = [line.split("\t") for line in result.stdout.strip().splitlines()]
bad = [r for r in rows if want[int(r[0])] != (r[1], r[2])]
print("rows compared: %d | mismatches: %d" % (len(rows), len(bad)))
assert len(rows) == 75, "expected 75 cards, found %d" % len(rows)
assert not bad, bad[:3]
print("blob round trip OK")
