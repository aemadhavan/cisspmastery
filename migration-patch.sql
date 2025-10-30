-- ============================================
-- Patch Migration: Add missing is_published column to decks table
-- ============================================

BEGIN;

-- Add is_published column to decks if it doesn't exist
ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

COMMIT;
