-- Flashcard database schema. Spec: plan/flashcards_db_design.md (approach B).
-- Auto-applied by the official MySQL image on first boot (empty data volume).
USE flashcards;
SET NAMES utf8mb4;

CREATE TABLE subject (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_subject_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE textbook (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  book_key VARCHAR(100) NULL,
  authors VARCHAR(500) NULL,
  license VARCHAR(255) NULL,
  attribution VARCHAR(255) NULL,
  source_url VARCHAR(500) NULL,
  UNIQUE KEY uq_textbook_book_key (book_key),
  UNIQUE KEY uq_textbook_subject_title (subject_id, title),
  CONSTRAINT fk_textbook_subject FOREIGN KEY (subject_id)
    REFERENCES subject (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chapter (
  -- One row per textbook SECTION (e.g. 1.1); chapter_number is the rollup.
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  textbook_id BIGINT UNSIGNED NOT NULL,
  chapter_number TINYINT UNSIGNED NOT NULL,
  section_number VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_chapter_textbook_section (textbook_id, section_number),
  CONSTRAINT fk_chapter_textbook FOREIGN KEY (textbook_id)
    REFERENCES textbook (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE learning_objective (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  chapter_id BIGINT UNSIGNED NOT NULL,
  lo_text VARCHAR(500) NOT NULL,
  ordinal SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_lo_chapter_text (chapter_id, lo_text),
  CONSTRAINT fk_lo_chapter FOREIGN KEY (chapter_id)
    REFERENCES chapter (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE concept (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lo_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  ordinal SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_concept_lo_name (lo_id, name),
  CONSTRAINT fk_concept_lo FOREIGN KEY (lo_id)
    REFERENCES learning_objective (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE flashcard (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  concept_id BIGINT UNSIGNED NOT NULL,
  card_type ENUM('concept_example','problem_solution') NOT NULL,
  front_content LONGBLOB NOT NULL,
  front_format VARCHAR(20) NOT NULL DEFAULT 'latex',
  back_content LONGBLOB NOT NULL,
  back_format VARCHAR(20) NOT NULL DEFAULT 'latex',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_flashcard_concept_type (concept_id, card_type),
  CONSTRAINT fk_flashcard_concept FOREIGN KEY (concept_id)
    REFERENCES concept (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW flashcard_full AS
SELECT f.id AS flashcard_id,
       s.name AS subject,
       t.title AS textbook,
       c.chapter_number,
       c.section_number,
       c.name AS section_name,
       lo.lo_text AS learning_objective,
       co.name AS concept,
       f.card_type,
       f.front_format,
       f.back_format,
       f.created_at
FROM flashcard f
JOIN concept co ON f.concept_id = co.id
JOIN learning_objective lo ON co.lo_id = lo.id
JOIN chapter c ON lo.chapter_id = c.id
JOIN textbook t ON c.textbook_id = t.id
JOIN subject s ON t.subject_id = s.id;
