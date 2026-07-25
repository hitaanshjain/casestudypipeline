-- Verification ledger for the concept flashcard import.
-- Run: docker exec -i flashcards-db mysql -uroot -pchange_me_root flashcards < tools/verify_flashcard_import.sql
USE flashcards;

SELECT 'chapters' AS check_name, COUNT(*) AS actual, 45 AS expected FROM chapter
UNION ALL SELECT 'learning_objectives', COUNT(*), 195 FROM learning_objective
UNION ALL SELECT 'concepts', COUNT(*), 75 FROM concept
UNION ALL SELECT 'cards', COUNT(*), 75 FROM flashcard
UNION ALL SELECT 'cards_json_format', COUNT(*), 75 FROM flashcard
    WHERE front_format = 'json' AND back_format = 'json'
UNION ALL SELECT 'front_invalid_json', COUNT(*), 0 FROM flashcard
    WHERE JSON_VALID(CONVERT(front_content USING utf8mb4)) = 0
UNION ALL SELECT 'back_invalid_json', COUNT(*), 0 FROM flashcard
    WHERE JSON_VALID(CONVERT(back_content USING utf8mb4)) = 0
UNION ALL SELECT 'cards_missing_title', COUNT(*), 0 FROM flashcard
    WHERE JSON_UNQUOTE(JSON_EXTRACT(CONVERT(front_content USING utf8mb4), '$.title')) = ''
UNION ALL SELECT 'orphan_concepts', COUNT(*), 0 FROM concept c
    LEFT JOIN learning_objective lo ON c.lo_id = lo.id WHERE lo.id IS NULL;

-- Coverage gap: learning objectives with no concept yet. Expected to stay large.
SELECT COUNT(*) AS los_without_any_card
FROM learning_objective lo LEFT JOIN concept c ON c.lo_id = lo.id WHERE c.id IS NULL;

-- Spread across the book, sanity check against 14/8/17/18/8/10 (not the raw
-- folder counts 15/9/16/16/9/10: three decks map cross-chapter, per
-- tools/flashcard_lo_mapping.csv: 004_Average_Rate to 3.4, 022_Limits_At_Infinity
-- to 4.6, 062_Indefinite_Integrals to 4.10).
SELECT ch.chapter_number, COUNT(*) AS cards
FROM flashcard f JOIN concept co ON f.concept_id = co.id
JOIN learning_objective lo ON co.lo_id = lo.id
JOIN chapter ch ON lo.chapter_id = ch.id
GROUP BY ch.chapter_number ORDER BY ch.chapter_number;

-- Per-card blob hashes, compared against the source decks in step 4.
SELECT id, SHA2(front_content, 256) AS front_sha, SHA2(back_content, 256) AS back_sha
FROM flashcard ORDER BY id;
