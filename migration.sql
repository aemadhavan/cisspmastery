-- ============================================
-- CISSP Mastery - Database Migration Script
-- From: Domains → Topics → Decks → Cards
-- To: Classes → Decks → Cards (Brainscape Model)
-- ============================================

-- IMPORTANT: Review this script before executing!
-- Backup your database first: pg_dump your_database > backup.sql

BEGIN;

-- Step 1: Create the new 'classes' table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(100),
  color VARCHAR(50),
  is_published BOOLEAN DEFAULT true,
  created_by VARCHAR(255) NOT NULL REFERENCES users(clerk_user_id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 2: Create the new 'class_progress' table
CREATE TABLE IF NOT EXISTS class_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  total_decks INTEGER DEFAULT 0,
  decks_started INTEGER DEFAULT 0,
  decks_completed INTEGER DEFAULT 0,
  overall_mastery_percentage DECIMAL(5, 2) DEFAULT '0',
  last_studied TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 3: Add new 'class_id' column to decks table (don't drop topic_id yet)
ALTER TABLE decks ADD COLUMN IF NOT EXISTS class_id UUID;

-- Step 4: Migrate data from domains/topics to classes
-- This creates one class for each domain
INSERT INTO classes (id, name, description, "order", icon, color, is_published, created_by, created_at, updated_at)
SELECT
  d.id,
  d.name,
  d.description,
  d."order",
  d.icon,
  'purple' as color, -- Default color
  true as is_published,
  COALESCE(d.created_by, (SELECT clerk_user_id FROM users WHERE role = 'admin' LIMIT 1)) as created_by,
  d.created_at,
  d.updated_at
FROM domains d
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE id = d.id);

-- Step 5: Update decks to reference classes instead of topics
-- Map: deck.topic_id → topic.domain_id → class_id
UPDATE decks
SET class_id = (
  SELECT t.domain_id
  FROM topics t
  WHERE t.id = decks.topic_id
)
WHERE class_id IS NULL AND topic_id IS NOT NULL;

-- Step 6: Make class_id NOT NULL (after data migration)
ALTER TABLE decks ALTER COLUMN class_id SET NOT NULL;

-- Step 7: Add foreign key constraint
ALTER TABLE decks
ADD CONSTRAINT decks_class_id_fkey
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

-- Step 8: Drop old columns and constraints from decks table
ALTER TABLE decks DROP CONSTRAINT IF EXISTS decks_topic_id_topics_id_fk;
ALTER TABLE decks DROP COLUMN IF EXISTS topic_id;

-- Step 9: Drop old tables (topics and domains)
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS domains CASCADE;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_created_by ON classes(created_by);
CREATE INDEX IF NOT EXISTS idx_classes_order ON classes("order");
CREATE INDEX IF NOT EXISTS idx_decks_class_id ON decks(class_id);
CREATE INDEX IF NOT EXISTS idx_class_progress_user_class ON class_progress(clerk_user_id, class_id);

COMMIT;

-- ============================================
-- Migration Complete!
-- ============================================
-- Verify the migration:
-- SELECT * FROM classes;
-- SELECT COUNT(*) FROM decks WHERE class_id IS NOT NULL;
-- ============================================
