-- Migration: Add Performance Indexes
-- Created: 2025-11-02
-- Purpose: Add missing database indexes to optimize query performance

-- Index for user_card_progress table (most frequently queried)
-- Composite index for filtering by user and flashcard IDs
CREATE INDEX IF NOT EXISTS "idx_user_card_progress_user_flashcard" ON "user_card_progress" ("clerk_user_id", "flashcard_id");

-- Index for mastery status filtering and grouping
CREATE INDEX IF NOT EXISTS "idx_user_card_progress_mastery" ON "user_card_progress" ("clerk_user_id", "mastery_status");

-- Index for flashcards table
-- Composite index for filtering by deck and published status
CREATE INDEX IF NOT EXISTS "idx_flashcards_deck_published" ON "flashcards" ("deck_id", "is_published");

-- Index for ordering flashcards within a deck
CREATE INDEX IF NOT EXISTS "idx_flashcards_deck_order" ON "flashcards" ("deck_id", "order");

-- Index for decks table
-- Composite index for filtering by class and published status
CREATE INDEX IF NOT EXISTS "idx_decks_class_published" ON "decks" ("class_id", "is_published");

-- Index for ordering decks within a class
CREATE INDEX IF NOT EXISTS "idx_decks_class_order" ON "decks" ("class_id", "order");

-- Index for study_sessions table
-- Composite index for querying user's study sessions by deck
CREATE INDEX IF NOT EXISTS "idx_study_sessions_user_deck" ON "study_sessions" ("clerk_user_id", "deck_id");

-- Index for time-based session queries
CREATE INDEX IF NOT EXISTS "idx_study_sessions_user_started" ON "study_sessions" ("clerk_user_id", "started_at");
