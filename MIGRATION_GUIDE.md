# Database Schema Migration Guide
## From: Domains → Topics → Decks → Cards
## To: Classes → Decks → Cards (Brainscape Model)

---

## Overview

This migration simplifies the hierarchy from a 4-level structure to a 3-level structure:

### OLD SCHEMA (4 levels)
```
Domains (CISSP Domain 1, Domain 2...)
  └── Topics (Subtopics within domains)
      └── Decks (Collections of cards)
          └── Cards (Individual flashcards)
```

### NEW SCHEMA (3 levels) ✅
```
Classes (CISSP Mastery, AWS Certification...)
  └── Decks (Security Architecture and Engineering...)
      └── Cards (Individual flashcards with Q&A)
```

---

## Key Changes

### 1. **Removed Tables**
- ❌ `domains` table
- ❌ `topics` table

### 2. **New Tables**
- ✅ `classes` table (replaces domains/topics)
- ✅ `class_progress` table (tracks user progress per class)

### 3. **Modified Tables**
- `decks` table: Now references `classId` instead of `topicId`
- `flashcards` table: No structural changes
- `flashcard_media` table: No changes
- All progress tracking tables: No changes

### 4. **Unchanged Tables**
- ✅ `users` - No changes
- ✅ `subscriptions` - No changes
- ✅ `payments` - No changes
- ✅ `flashcards` - No changes (except deck reference)
- ✅ `flashcard_media` - No changes
- ✅ `user_card_progress` - No changes
- ✅ `study_sessions` - No changes
- ✅ `session_cards` - No changes
- ✅ `deck_progress` - No changes
- ✅ `user_stats` - No changes

---

## Role Permissions

### Admin Users (role = 'admin')
**Can CREATE:**
- ✅ Classes
- ✅ Decks (within classes)
- ✅ Cards (within decks)
- ✅ Upload images (up to 10 per card: 5 for question, 5 for answer)

**Can VIEW:**
- ✅ All users' progress
- ✅ All study sessions
- ✅ All analytics and metrics
- ✅ Individual user performance

**Can EDIT/DELETE:**
- ✅ Any class, deck, or card
- ✅ Any media files

### Regular Users (role = 'user')
**Can CONSUME:**
- ✅ Study cards in any published class/deck
- ✅ Rate confidence (1-5 scale)
- ✅ View own progress

**Can VIEW:**
- ✅ Own progress only
- ✅ Own study sessions
- ✅ Own statistics

**Cannot:**
- ❌ Create classes, decks, or cards
- ❌ Upload images
- ❌ View other users' progress

---

## Migration Steps

### Step 1: Backup Current Database
```bash
# Create a backup before migration
pg_dump your_database > backup_before_migration.sql
```

### Step 2: Data Transformation Strategy

**Option A: Fresh Start (Recommended for Development)**
1. Drop old tables (domains, topics)
2. Create new schema with `classes` table
3. Manually recreate content in new structure
4. Preserve user progress data

**Option B: Data Migration (For Production)**
1. Create `classes` table
2. Migrate data:
   - Combine domains + topics into classes
   - Update deck references: `topicId` → `classId`
3. Drop old tables after verification

### Step 3: Update Schema File

Replace [src/lib/db/schema.ts](src/lib/db/schema.ts) with the new schema:

```bash
# Backup old schema
cp src/lib/db/schema.ts src/lib/db/schema.old.ts

# Replace with new schema
cp src/lib/db/schema-new.ts src/lib/db/schema.ts
```

### Step 4: Generate Migration

```bash
npm run db:generate
```

This will create a migration file in `drizzle/` directory.

### Step 5: Review Migration SQL

Open the generated migration file and review the SQL commands.

**Expected changes:**
- CREATE TABLE `classes`
- CREATE TABLE `class_progress`
- DROP TABLE `topics` (if exists)
- DROP TABLE `domains` (if exists)
- ALTER TABLE `decks` - change `topic_id` to `class_id`

### Step 6: Run Migration

```bash
npm run db:push
```

Or manually apply migration:
```bash
npm run db:migrate
```

### Step 7: Seed Initial Data

Create initial classes (e.g., "CISSP Mastery"):

```bash
npm run db:seed
```

Or manually via SQL:
```sql
INSERT INTO classes (id, name, description, "order", icon, color, is_published, created_by)
VALUES (
  gen_random_uuid(),
  'CISSP Mastery',
  'Comprehensive CISSP certification preparation',
  1,
  '🔒',
  'purple',
  true,
  'your_admin_clerk_user_id'
);
```

---

## Code Changes Required

### 1. API Endpoints

**New Endpoints Needed:**
- `POST /api/admin/classes` - Create class
- `GET /api/admin/classes` - List all classes
- `GET /api/admin/classes/:id` - Get class details
- `PUT /api/admin/classes/:id` - Update class
- `DELETE /api/admin/classes/:id` - Delete class

**Endpoints to Update:**
- `GET /api/admin/decks` - Change to filter by `classId` instead of `topicId`
- `POST /api/admin/decks` - Change to accept `classId` instead of `topicId`

**Endpoints to Remove:**
- ❌ `/api/admin/domains/*`
- ❌ `/api/admin/topics/*`

### 2. Admin UI Components

**New Components Needed:**
- Class creation modal
- Class list view
- Class selection dropdown

**Components to Update:**
- [src/app/admin/flashcards/page.tsx](src/app/admin/flashcards/page.tsx)
  - Replace Domain/Topic/Deck dropdowns → Class/Deck dropdowns
- Admin navigation sidebar
  - Add "Classes" menu item
  - Remove "Domains" menu item

### 3. User UI Components

**Components to Update:**
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
  - Display classes instead of domains
- Study mode page
  - Update routing from `/dashboard/domain/:id` → `/dashboard/deck/:id`

### 4. Database Queries

**Update all queries that reference:**
- `domains` table → `classes` table
- `topics` table → Remove or integrate into classes
- `decks.topicId` → `decks.classId`

---

## Testing Checklist

### Admin Workflow
- [ ] Admin can create a new class
- [ ] Admin can create a new deck within a class
- [ ] Admin can create cards within a deck
- [ ] Admin can upload up to 5 images for question
- [ ] Admin can upload up to 5 images for answer
- [ ] Admin can edit existing cards
- [ ] Admin can delete cards/decks/classes
- [ ] Admin can view all users' progress
- [ ] Admin can search and filter users

### User Workflow
- [ ] User can view available classes
- [ ] User can select a class and see decks
- [ ] User can start studying a deck
- [ ] User sees flashcard with question + images
- [ ] User can flip card to see answer + images
- [ ] User can rate confidence (1-5)
- [ ] User progress is saved automatically
- [ ] User can see their own progress dashboard
- [ ] Free users are limited to 10 cards/day
- [ ] Pro users have unlimited access

### Data Integrity
- [ ] User progress data is preserved during migration
- [ ] Study sessions are correctly linked
- [ ] Card media files are accessible
- [ ] Confidence ratings are tracked accurately
- [ ] Spaced repetition calculations work correctly

---

## Rollback Plan

If migration fails:

```bash
# Restore from backup
psql your_database < backup_before_migration.sql

# Revert schema file
cp src/lib/db/schema.old.ts src/lib/db/schema.ts

# Regenerate old schema
npm run db:generate
npm run db:push
```

---

## Timeline Estimate

- **Step 1-2 (Backup & Planning):** 30 minutes
- **Step 3-6 (Schema Migration):** 1-2 hours
- **Step 7 (Seeding):** 30 minutes
- **Code Changes (API endpoints):** 3-4 hours
- **Code Changes (UI components):** 4-6 hours
- **Testing:** 2-3 hours
- **Total:** 11-16 hours

---

## Support & Documentation

### New Schema File
- [src/lib/db/schema-new.ts](src/lib/db/schema-new.ts)

### Key Documentation
- Brainscape model: Classes → Decks → Cards
- Admin-only creation
- User consumption and progress tracking
- Up to 10 images per card (5 question + 5 answer)

### Questions?
Review the requirements document or check the schema comments for clarification.
