-- Showcase queries for the flashcard database. Run any of these in a MySQL client.

-- 1. Every card with its full tag path (subject, textbook, section, LO, concept).
SELECT * FROM flashcard_full;

-- 2. Read one card's actual content (blobs decoded to text).
SELECT CONVERT(front_content USING utf8mb4) AS front,
       CONVERT(back_content USING utf8mb4) AS back
FROM flashcard WHERE id = 1;

-- 3. Coverage gaps: learning objectives with no flashcards yet.
SELECT c.section_number, lo.lo_text
FROM learning_objective lo
JOIN chapter c ON lo.chapter_id = c.id
LEFT JOIN concept co ON co.lo_id = lo.id
LEFT JOIN flashcard f ON f.concept_id = co.id
WHERE f.id IS NULL
ORDER BY c.id, lo.ordinal;

-- 4. Card counts rolled up by real chapter (1-6).
SELECT c.chapter_number, COUNT(f.id) AS cards
FROM chapter c
LEFT JOIN learning_objective lo ON lo.chapter_id = c.id
LEFT JOIN concept co ON co.lo_id = lo.id
LEFT JOIN flashcard f ON f.concept_id = co.id
GROUP BY c.chapter_number
ORDER BY c.chapter_number;

-- 5. The attribution line a UI is obligated to show (CC BY-NC-SA).
SELECT title, license, attribution, source_url FROM textbook;
