# Quiz System API Testing Guide

This guide provides step-by-step instructions and examples for testing all quiz system API endpoints.

## Prerequisites

1. ✅ Database migration applied (`npx drizzle-kit push`)
2. ✅ Have at least one flashcard and deck in the database
3. ✅ Know your Clerk user ID (admin user for admin endpoints)
4. ✅ Application running locally (`npm run dev`)

## Setup

### 1. Get Your User IDs

You'll need these for testing:

**Your Admin User ID:**
- Go to Clerk Dashboard → Users
- Copy your user ID (starts with `user_`)
- Or check the database: `SELECT clerk_user_id FROM users WHERE role = 'admin';`

**Sample Flashcard/Deck IDs:**
```sql
-- Get a flashcard ID
SELECT id, question FROM flashcards LIMIT 1;

-- Get a deck ID
SELECT id, name FROM decks LIMIT 1;
```

### 2. Environment Setup

Create a `.env.local` file if you haven't already:
```bash
POSTGRES_URL=your-database-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

### 3. Seed Test Data (Optional)

```bash
# Update the admin user ID in the script first
npx tsx scripts/seed-test-questions.ts
```

## API Testing

### Admin Endpoints

#### 1. Create a Test Question

**Endpoint:** `POST /api/admin/test-questions`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/test-questions \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "YOUR_FLASHCARD_UUID",
    "question": "Which of the following BEST describes defense in depth?",
    "choices": [
      "Using a single strong firewall",
      "Implementing multiple layers of security controls",
      "Encrypting all data at rest",
      "Using strong passwords only"
    ],
    "correctAnswers": [1],
    "explanation": "Defense in depth involves implementing multiple layers of security controls to protect assets. If one control fails, others are in place to prevent a breach.",
    "pointValue": 1,
    "timeLimit": 60,
    "difficulty": 3,
    "order": 0,
    "isActive": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "question": {
    "id": "uuid-here",
    "flashcardId": "...",
    "question": "Which of the following BEST describes defense in depth?",
    "choices": ["...", "..."],
    "correctAnswers": [1],
    "explanation": "...",
    "pointValue": 1,
    "timeLimit": 60,
    "difficulty": 3,
    "order": 0,
    "isActive": true,
    "createdBy": "user_xxx",
    "createdAt": "2025-01-07T...",
    "updatedAt": "2025-01-07T..."
  }
}
```

#### 2. Bulk Import Test Questions

**Endpoint:** `POST /api/admin/test-questions` (with bulk format)

**cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/test-questions \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "flashcardId": "YOUR_FLASHCARD_UUID_1",
        "question": "What are the three components of the CIA Triad?",
        "choices": [
          "Confidentiality, Integrity, Availability",
          "Compliance, Integrity, Authentication",
          "Confidentiality, Identity, Authorization"
        ],
        "correctAnswers": [0],
        "explanation": "The CIA Triad consists of Confidentiality, Integrity, and Availability.",
        "pointValue": 1,
        "difficulty": 1,
        "order": 0,
        "isActive": true
      },
      {
        "flashcardId": "YOUR_FLASHCARD_UUID_2",
        "question": "Which encryption algorithm is asymmetric?",
        "choices": [
          "AES",
          "DES",
          "RSA",
          "3DES"
        ],
        "correctAnswers": [2],
        "explanation": "RSA is an asymmetric encryption algorithm using public/private key pairs.",
        "pointValue": 1,
        "difficulty": 2,
        "order": 0,
        "isActive": true
      }
    ],
    "strategy": "append",
    "validateOnly": false
  }'
```

**Validate Only (Preview Mode):**
```bash
# Same as above but with "validateOnly": true
# This will validate without inserting data
```

**Expected Response:**
```json
{
  "success": true,
  "imported": 2,
  "skipped": 0,
  "questions": [...]
}
```

#### 3. List Test Questions

**Endpoint:** `GET /api/admin/test-questions`

**cURL:**
```bash
# Get all questions
curl http://localhost:3000/api/admin/test-questions

# Filter by flashcard
curl http://localhost:3000/api/admin/test-questions?flashcardId=YOUR_FLASHCARD_UUID

# With pagination
curl http://localhost:3000/api/admin/test-questions?limit=10&offset=0
```

**Expected Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "flashcardId": "uuid",
      "question": "...",
      "choices": ["...", "..."],
      "correctAnswers": [1],
      "flashcard": {
        "id": "uuid",
        "question": "...",
        "deck": {
          "name": "...",
          "class": {
            "name": "..."
          }
        }
      }
    }
  ],
  "total": 5
}
```

#### 4. Update Test Question

**Endpoint:** `PATCH /api/admin/test-questions/[id]`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/admin/test-questions/YOUR_QUESTION_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Updated question text",
    "difficulty": 4,
    "isActive": true
  }'
```

#### 5. Delete Test Question

**Endpoint:** `DELETE /api/admin/test-questions/[id]`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/admin/test-questions/YOUR_QUESTION_UUID
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test question deleted successfully"
}
```

#### 6. Create Deck Test

**Endpoint:** `POST /api/admin/deck-tests`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/deck-tests \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_UUID",
    "name": "Security Principles Practice Test",
    "description": "Comprehensive test covering all security principles",
    "testType": "deck",
    "questionCount": null,
    "timeLimit": 1800,
    "passingScore": 70,
    "shuffleQuestions": true,
    "shuffleChoices": true,
    "showCorrectAnswers": true,
    "allowRetakes": true,
    "maxAttempts": null,
    "isPremium": false,
    "isPublished": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "test": {
    "id": "uuid",
    "deckId": "uuid",
    "name": "Security Principles Practice Test",
    "questionPool": [
      {
        "testQuestion": {
          "id": "uuid",
          "question": "..."
        }
      }
    ]
  }
}
```

#### 7. List Deck Tests

**Endpoint:** `GET /api/admin/deck-tests`

**cURL:**
```bash
# Get all deck tests
curl http://localhost:3000/api/admin/deck-tests

# Filter by deck
curl http://localhost:3000/api/admin/deck-tests?deckId=YOUR_DECK_UUID
```

#### 8. Get Deck Test Details

**Endpoint:** `GET /api/admin/deck-tests/[id]`

**cURL:**
```bash
curl http://localhost:3000/api/admin/deck-tests/YOUR_DECK_TEST_UUID
```

#### 9. Update Deck Test

**Endpoint:** `PATCH /api/admin/deck-tests/[id]`

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/admin/deck-tests/YOUR_DECK_TEST_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "passingScore": 80,
    "timeLimit": 2400,
    "isPublished": true
  }'
```

#### 10. Delete Deck Test

**Endpoint:** `DELETE /api/admin/deck-tests/[id]`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/admin/deck-tests/YOUR_DECK_TEST_UUID
```

---

### User Endpoints

#### 1. Start a Test

**Endpoint:** `POST /api/tests/start`

**For Deck Test:**
```bash
curl -X POST http://localhost:3000/api/tests/start \
  -H "Content-Type: application/json" \
  -d '{
    "deckTestId": "YOUR_DECK_TEST_UUID",
    "testType": "deck"
  }'
```

**For Single Flashcard Test:**
```bash
curl -X POST http://localhost:3000/api/tests/start \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "YOUR_FLASHCARD_UUID",
    "testType": "flashcard"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "status": "in_progress",
    "totalQuestions": 10,
    "timeLimit": 1800,
    "passingScore": 70
  },
  "questions": [
    {
      "id": "question-uuid",
      "question": "What is the CIA Triad?",
      "choices": [
        "Confidentiality, Integrity, Availability",
        "Compliance, Integrity, Authentication",
        "..."
      ],
      "pointValue": 1,
      "timeLimit": 60,
      "difficulty": 2,
      "explanation": null
    }
  ]
}
```

**Save the `attempt.id` and question IDs for next steps!**

#### 2. Submit an Answer

**Endpoint:** `POST /api/tests/answer`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/tests/answer \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "YOUR_ATTEMPT_UUID",
    "testQuestionId": "YOUR_QUESTION_UUID",
    "selectedAnswers": [1],
    "timeSpent": 45,
    "markedForReview": false
  }'
```

**Multiple Choice (Select Multiple):**
```bash
curl -X POST http://localhost:3000/api/tests/answer \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "YOUR_ATTEMPT_UUID",
    "testQuestionId": "YOUR_QUESTION_UUID",
    "selectedAnswers": [0, 2],
    "timeSpent": 60,
    "markedForReview": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "answer": {
    "id": "answer-uuid",
    "isCorrect": true,
    "pointsEarned": 1
  },
  "progress": {
    "questionsAnswered": 1,
    "totalQuestions": 10,
    "correctAnswers": 1
  }
}
```

#### 3. Submit/Complete Test

**Endpoint:** `POST /api/tests/submit`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/tests/submit \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "YOUR_ATTEMPT_UUID"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "attemptId": "uuid",
    "status": "completed",
    "totalQuestions": 10,
    "questionsAnswered": 10,
    "correctAnswers": 8,
    "score": 80.00,
    "passed": true,
    "passingScore": 70,
    "timeSpent": 450,
    "completedAt": "2025-01-07T..."
  }
}
```

#### 4. View Test Results

**Endpoint:** `GET /api/tests/results/[attemptId]`

**cURL:**
```bash
curl http://localhost:3000/api/tests/results/YOUR_ATTEMPT_UUID
```

**Expected Response:**
```json
{
  "attempt": {
    "id": "uuid",
    "status": "completed",
    "totalQuestions": 10,
    "correctAnswers": 8,
    "score": 80.00,
    "passed": true
  },
  "test": {
    "name": "Security Principles Practice Test",
    "deck": {
      "name": "Security & Risk Management",
      "class": {
        "name": "CISSP"
      }
    }
  },
  "questions": [
    {
      "questionId": "uuid",
      "question": "What is the CIA Triad?",
      "choices": ["...", "..."],
      "correctAnswers": [0],
      "selectedAnswers": [0],
      "isCorrect": true,
      "pointsEarned": 1,
      "explanation": "The CIA Triad..."
    }
  ],
  "performance": {
    "accuracy": "80.00",
    "averageTimePerQuestion": "45.0"
  }
}
```

#### 5. View Test History

**Endpoint:** `GET /api/tests/history`

**cURL:**
```bash
# Get all attempts
curl http://localhost:3000/api/tests/history

# With pagination
curl http://localhost:3000/api/tests/history?limit=10&offset=0

# Filter by deck test
curl http://localhost:3000/api/tests/history?deckTestId=YOUR_DECK_TEST_UUID

# Filter by status
curl http://localhost:3000/api/tests/history?status=completed
```

**Expected Response:**
```json
{
  "attempts": [
    {
      "id": "uuid",
      "testType": "deck",
      "status": "completed",
      "startedAt": "2025-01-07T...",
      "completedAt": "2025-01-07T...",
      "totalQuestions": 10,
      "correctAnswers": 8,
      "score": 80.00,
      "passed": true,
      "timeSpent": 450,
      "test": {
        "name": "Practice Test",
        "deck": {
          "name": "Security & Risk Management"
        }
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 5
  }
}
```

## Testing Workflows

### Complete Test Flow (User Journey)

```bash
# 1. Start a test
ATTEMPT_ID=$(curl -s -X POST http://localhost:3000/api/tests/start \
  -H "Content-Type: application/json" \
  -d '{"deckTestId": "YOUR_DECK_TEST_UUID", "testType": "deck"}' \
  | jq -r '.attempt.id')

echo "Started test attempt: $ATTEMPT_ID"

# 2. Answer questions (repeat for each question)
curl -X POST http://localhost:3000/api/tests/answer \
  -H "Content-Type: application/json" \
  -d "{
    \"attemptId\": \"$ATTEMPT_ID\",
    \"testQuestionId\": \"QUESTION_UUID_1\",
    \"selectedAnswers\": [0],
    \"timeSpent\": 30
  }"

# ... answer more questions ...

# 3. Submit test
curl -X POST http://localhost:3000/api/tests/submit \
  -H "Content-Type: application/json" \
  -d "{\"attemptId\": \"$ATTEMPT_ID\"}"

# 4. View results
curl http://localhost:3000/api/tests/results/$ATTEMPT_ID | jq
```

### Bulk Import Workflow (Admin)

```bash
# 1. Create JSON file with questions
cat > test-questions.json << 'EOF'
{
  "questions": [
    {
      "flashcardId": "uuid-1",
      "question": "Sample question 1?",
      "choices": ["A", "B", "C", "D"],
      "correctAnswers": [1],
      "explanation": "Explanation here",
      "pointValue": 1,
      "difficulty": 2,
      "order": 0,
      "isActive": true
    }
  ],
  "strategy": "append",
  "validateOnly": true
}
EOF

# 2. Validate (preview mode)
curl -X POST http://localhost:3000/api/admin/test-questions \
  -H "Content-Type: application/json" \
  -d @test-questions.json | jq

# 3. If validation passes, import for real
# Change "validateOnly": false in JSON file
curl -X POST http://localhost:3000/api/admin/test-questions \
  -H "Content-Type: application/json" \
  -d @test-questions.json | jq
```

## Troubleshooting

### Common Errors

**401 Unauthorized**
- Make sure you're authenticated with Clerk
- Check that cookies are being sent with requests
- For admin endpoints, verify your user has admin role

**404 Not Found**
- Verify the UUID exists in the database
- Check that the endpoint URL is correct

**400 Bad Request**
- Review the error details in the response
- Ensure all required fields are provided
- Validate that choice indices match array length

**403 Forbidden (Max Attempts)**
- User has reached maximum attempts for this test
- Admin can update `maxAttempts` to allow more tries

## Testing Checklist

### Admin API
- [ ] Create single test question
- [ ] Create multiple test questions via bulk import
- [ ] List all test questions
- [ ] Filter test questions by flashcard
- [ ] Update test question
- [ ] Delete test question
- [ ] Create deck test
- [ ] List deck tests
- [ ] Update deck test
- [ ] Delete deck test

### User API
- [ ] Start deck test
- [ ] Start flashcard test
- [ ] Submit correct answer
- [ ] Submit incorrect answer
- [ ] Mark question for review
- [ ] Complete test (all questions answered)
- [ ] View test results
- [ ] View test history
- [ ] Verify max attempts enforcement
- [ ] Verify question shuffling
- [ ] Verify choice shuffling

## Next Steps

Once API testing is complete:

1. **Build Admin UI**
   - Test question management page
   - Bulk import interface
   - Deck test builder

2. **Build User UI**
   - Test selector/browser
   - Test-taking interface
   - Results dashboard
   - History page

3. **Integration**
   - Add "Take Test" buttons to deck pages
   - Show test availability indicators
   - Display scores in user dashboard
