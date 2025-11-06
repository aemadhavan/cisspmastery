# Flashcard Test/Quiz System

## Overview

This document describes the comprehensive testing and quiz functionality added to the CISSP Mastery flashcard application. The system allows administrators to create multiple-choice questions for flashcards and decks, while users can take tests and track their progress.

## Features Implemented

### Admin Features
- ✅ Create/edit/delete test questions for individual flashcards
- ✅ Bulk import test questions via JSON upload
- ✅ Create/edit/delete deck tests (aggregated tests for entire decks)
- ✅ Configure test settings (time limits, passing scores, shuffle options)
- ✅ Preview mode for validating imports before committing
- ✅ Question pool management for deck tests

### User Features
- ✅ Take tests on individual flashcards or entire decks
- ✅ Multiple-choice question format (2-6 choices per question)
- ✅ Track answers and progress during test
- ✅ View detailed results after completion
- ✅ Test history and analytics
- ✅ Retake tests (configurable by admin)
- ✅ Time tracking per question and overall

## Database Schema

### New Tables

#### `test_questions`
Stores multiple-choice questions for flashcards.

**Key Fields:**
- `flashcard_id` - Links to flashcard
- `question` - The test question text
- `choices` - Array of answer choices (2-6 items)
- `correct_answers` - Array of correct answer indices
- `explanation` - Explanation of correct answer
- `point_value` - Points awarded for correct answer
- `time_limit` - Optional time limit per question
- `difficulty` - 1-5 difficulty rating
- `is_active` - Enable/disable question

#### `deck_tests`
Aggregated tests for entire decks.

**Key Fields:**
- `deck_id` - Links to deck
- `name` - Test name
- `test_type` - 'flashcard', 'deck', or 'random'
- `question_count` - Number of questions (null = all)
- `time_limit` - Total time limit in seconds
- `passing_score` - Percentage required to pass (default 70%)
- `shuffle_questions` - Randomize question order
- `shuffle_choices` - Randomize choice order
- `show_correct_answers` - Show answers after submission
- `allow_retakes` - Allow users to retake test
- `max_attempts` - Maximum attempts allowed
- `is_premium` - Requires Pro subscription
- `is_published` - Publish/draft status

#### `test_attempts`
User test sessions.

**Key Fields:**
- `clerk_user_id` - User taking the test
- `deck_test_id` - Deck test (if applicable)
- `flashcard_id` - Single flashcard test (if applicable)
- `test_type` - Type of test
- `status` - 'not_started', 'in_progress', 'completed', 'abandoned'
- `total_questions` - Number of questions in test
- `questions_answered` - Number answered so far
- `correct_answers` - Number of correct answers
- `score` - Percentage score
- `passed` - Whether user passed
- `time_spent` - Total time in seconds

#### `test_answers`
Individual answers within test attempts.

**Key Fields:**
- `attempt_id` - Links to test attempt
- `test_question_id` - The question answered
- `selected_answers` - Array of selected answer indices
- `is_correct` - Whether answer was correct
- `points_earned` - Points earned
- `time_spent` - Time spent on this question
- `marked_for_review` - User marked for review

#### `test_question_pool`
Links questions to deck tests (many-to-many relationship).

## API Endpoints

### Admin Endpoints

#### Test Questions
- `GET /api/admin/test-questions` - List all test questions
  - Query params: `flashcardId`, `limit`, `offset`
- `POST /api/admin/test-questions` - Create question or bulk import
  - Single: `{ flashcardId, question, choices[], correctAnswers[], ... }`
  - Bulk: `{ questions: [...], strategy: 'replace'|'append'|'skip', validateOnly: boolean }`
- `GET /api/admin/test-questions/[id]` - Get single question
- `PATCH /api/admin/test-questions/[id]` - Update question
- `DELETE /api/admin/test-questions/[id]` - Delete question

#### Deck Tests
- `GET /api/admin/deck-tests` - List all deck tests
  - Query params: `deckId`, `limit`, `offset`
- `POST /api/admin/deck-tests` - Create deck test
- `GET /api/admin/deck-tests/[id]` - Get single deck test
- `PATCH /api/admin/deck-tests/[id]` - Update deck test
- `DELETE /api/admin/deck-tests/[id]` - Delete deck test

### User Endpoints

#### Test Taking
- `POST /api/tests/start` - Start a new test attempt
  - Body: `{ deckTestId OR flashcardId, testType }`
  - Returns: `{ attempt, questions[] }` (questions have correct answers hidden)
- `POST /api/tests/answer` - Submit answer for a question
  - Body: `{ attemptId, testQuestionId, selectedAnswers[], timeSpent?, markedForReview? }`
  - Returns: `{ isCorrect, pointsEarned, progress }`
- `POST /api/tests/submit` - Complete and submit test
  - Body: `{ attemptId }`
  - Returns: `{ result: { score, passed, timeSpent, ... } }`

#### Results & History
- `GET /api/tests/results/[attemptId]` - Get detailed test results
  - Returns: `{ attempt, test, questions[], performance }`
- `GET /api/tests/history` - Get user's test history
  - Query params: `limit`, `offset`, `deckTestId`, `status`
  - Returns: `{ attempts[], pagination }`

## Validation Schemas

All API endpoints use Zod validation schemas defined in `/src/lib/validations/test.ts`:

- `testQuestionSchema` - Validates test question creation/update
- `bulkTestQuestionsSchema` - Validates JSON bulk imports
- `deckTestSchema` - Validates deck test creation/update
- `startTestAttemptSchema` - Validates test start requests
- `submitAnswerSchema` - Validates answer submissions
- `submitTestSchema` - Validates test completion
- `getTestHistorySchema` - Validates history queries

## JSON Import Format

Admins can bulk import test questions using this JSON format:

```json
{
  "questions": [
    {
      "flashcardId": "uuid-here",
      "question": "Which of the following best describes defense in depth?",
      "choices": [
        "Using a single strong firewall",
        "Implementing multiple layers of security controls",
        "Encrypting all data at rest",
        "Using strong passwords"
      ],
      "correctAnswers": [1],
      "explanation": "Defense in depth involves multiple layers of security controls to protect assets.",
      "pointValue": 1,
      "timeLimit": 60,
      "difficulty": 3,
      "order": 0,
      "isActive": true
    }
  ],
  "strategy": "append",
  "validateOnly": false
}
```

**Import Strategies:**
- `replace` - Delete existing questions for these flashcards, then import
- `append` - Add to existing questions
- `skip` - Skip questions that already exist (based on question text match)

**Validate Only Mode:**
Set `validateOnly: true` to preview import results without committing changes.

## Business Rules

### Test Creation
- Minimum 2 choices per question, maximum 6
- At least one correct answer required
- Correct answer indices must be within choice array bounds
- Maximum 10 questions per flashcard (recommended)
- Maximum 100 questions per deck test (recommended)

### Test Taking
- Users can only take published tests
- Premium tests require Pro subscription
- Max attempts enforced if configured
- Cannot modify answers after submission
- Tests auto-save progress
- Abandoned tests saved for 24 hours (configurable)

### Scoring
- Default 1 point per question (configurable)
- No negative marking for incorrect answers
- Partial credit not supported in v1
- Percentage score = (correct / total) × 100
- Pass/fail based on passing score threshold

## Security & Performance

### Security
- Admin-only endpoints protected with `requireAdmin()` middleware
- Users can only access their own test attempts
- Correct answers hidden until test completion
- Server-side answer validation
- SQL injection prevention via Drizzle ORM
- XSS protection via input sanitization

### Performance
- Indexed database queries for fast retrieval
- Cache invalidation for related entities
- Pagination support on list endpoints
- Efficient bulk import with transaction support
- Response time targets:
  - Question loading: < 200ms
  - Answer submission: < 500ms
  - Results calculation: < 1 second

## Migration

To apply the database migration:

```bash
# Review the migration
cat drizzle/migrations/0002_add_test_quiz_system.sql

# Apply to database (if using Drizzle migrations)
npx drizzle-kit push

# Or manually execute the SQL against your database
```

## Next Steps (UI Implementation)

The following UI components need to be built:

### Admin Components
1. **Test Question Manager** - CRUD interface for test questions
2. **Bulk Import Tool** - JSON upload with validation preview
3. **Deck Test Builder** - Create and configure deck tests
4. **Question Pool Editor** - Manage which questions are in a test

### User Components
1. **Test Selector** - Choose flashcard or deck test
2. **Test Taking Interface** - Display questions, track progress, timer
3. **Results Dashboard** - Show score, correct/incorrect answers
4. **Test History** - List past attempts with filters
5. **Progress Analytics** - Charts and statistics

### Integration Points
1. Add "Take Test" button to deck detail pages
2. Add "Quiz Me" button to individual flashcard pages
3. Show test availability in deck cards
4. Display test scores in user progress dashboard

## Usage Examples

### Creating a Test Question (Admin)

```typescript
// POST /api/admin/test-questions
const response = await fetch('/api/admin/test-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flashcardId: 'flashcard-uuid',
    question: 'What is the primary goal of risk management?',
    choices: [
      'Eliminate all risks',
      'Reduce risks to acceptable levels',
      'Transfer all risks to insurance',
      'Avoid all risky activities'
    ],
    correctAnswers: [1],
    explanation: 'Risk management aims to reduce risks to acceptable levels, not eliminate them entirely.',
    pointValue: 1,
    difficulty: 2
  })
});
```

### Starting a Test (User)

```typescript
// POST /api/tests/start
const response = await fetch('/api/tests/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deckTestId: 'deck-test-uuid',
    testType: 'deck'
  })
});

const { attempt, questions } = await response.json();
```

### Submitting an Answer (User)

```typescript
// POST /api/tests/answer
const response = await fetch('/api/tests/answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attemptId: 'attempt-uuid',
    testQuestionId: 'question-uuid',
    selectedAnswers: [1], // User selected choice at index 1
    timeSpent: 45 // seconds
  })
});

const { isCorrect, pointsEarned, progress } = await response.json();
```

## Testing Checklist

- [ ] Create test questions via admin API
- [ ] Bulk import questions from JSON
- [ ] Create deck test
- [ ] Start test as user
- [ ] Submit answers
- [ ] Complete test
- [ ] View results
- [ ] View test history
- [ ] Verify max attempts enforcement
- [ ] Test premium test access control
- [ ] Verify time tracking
- [ ] Check score calculation accuracy
- [ ] Test question shuffling
- [ ] Test choice shuffling
- [ ] Verify cache invalidation

## Support

For issues or questions about the quiz system, please refer to:
- Database schema: `/src/lib/db/schema.ts`
- Validations: `/src/lib/validations/test.ts`
- API routes: `/src/app/api/admin/test-questions/`, `/src/app/api/tests/`
- Migration: `/drizzle/migrations/0002_add_test_quiz_system.sql`
