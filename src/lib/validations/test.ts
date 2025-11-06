import { z } from 'zod';

// ============================================
// TEST QUESTION VALIDATION SCHEMAS
// ============================================

export const testQuestionSchema = z.object({
  flashcardId: z.string().uuid(),
  question: z.string().min(10, 'Question must be at least 10 characters').max(1000),
  choices: z
    .array(z.string().min(1).max(500))
    .min(2, 'Must have at least 2 choices')
    .max(6, 'Cannot have more than 6 choices'),
  correctAnswers: z
    .array(z.number().int().min(0))
    .min(1, 'Must have at least one correct answer')
    .refine(
      (answers) => new Set(answers).size === answers.length,
      'Correct answers must be unique'
    ),
  explanation: z.string().max(1000).optional(),
  pointValue: z.number().int().min(1).max(10).default(1),
  timeLimit: z.number().int().min(10).max(600).optional(), // 10 seconds to 10 minutes
  difficulty: z.number().int().min(1).max(5).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const createTestQuestionSchema = testQuestionSchema;

export const updateTestQuestionSchema = testQuestionSchema.partial().extend({
  id: z.string().uuid(),
});

// Bulk import schema for JSON uploads
export const bulkTestQuestionsSchema = z.object({
  questions: z.array(testQuestionSchema).min(1).max(1000),
  strategy: z.enum(['replace', 'append', 'skip']).default('append'),
  validateOnly: z.boolean().default(false), // Preview mode
});

// ============================================
// DECK TEST VALIDATION SCHEMAS
// ============================================

export const deckTestSchema = z.object({
  deckId: z.string().uuid(),
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  description: z.string().max(1000).optional(),
  testType: z.enum(['flashcard', 'deck', 'random']).default('deck'),
  questionCount: z.number().int().min(1).max(100).optional(), // null = all questions
  timeLimit: z.number().int().min(60).max(7200).optional(), // 1 minute to 2 hours
  passingScore: z.number().int().min(0).max(100).default(70),
  shuffleQuestions: z.boolean().default(true),
  shuffleChoices: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(true),
  allowRetakes: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).max(100).optional(), // null = unlimited
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const createDeckTestSchema = deckTestSchema;

export const updateDeckTestSchema = deckTestSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================
// TEST ATTEMPT VALIDATION SCHEMAS
// ============================================

export const startTestAttemptSchema = z.object({
  deckTestId: z.string().uuid().optional(),
  flashcardId: z.string().uuid().optional(),
  testType: z.enum(['flashcard', 'deck', 'random']),
}).refine(
  (data) => {
    // Either deckTestId or flashcardId must be provided
    return (data.deckTestId && !data.flashcardId) || (!data.deckTestId && data.flashcardId);
  },
  {
    message: 'Either deckTestId or flashcardId must be provided, but not both',
  }
);

export const submitAnswerSchema = z.object({
  attemptId: z.string().uuid(),
  testQuestionId: z.string().uuid(),
  selectedAnswers: z.array(z.number().int().min(0).max(5)).min(1).max(6),
  timeSpent: z.number().int().min(0).optional(),
  markedForReview: z.boolean().default(false),
});

export const submitTestSchema = z.object({
  attemptId: z.string().uuid(),
});

export const abandonTestSchema = z.object({
  attemptId: z.string().uuid(),
});

// ============================================
// QUERY VALIDATION SCHEMAS
// ============================================

export const getTestHistorySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  deckTestId: z.string().uuid().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
});

export const getTestResultsSchema = z.object({
  attemptId: z.string().uuid(),
});

export const getTestAnalyticsSchema = z.object({
  deckTestId: z.string().uuid().optional(),
  deckId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type TestQuestion = z.infer<typeof testQuestionSchema>;
export type CreateTestQuestion = z.infer<typeof createTestQuestionSchema>;
export type UpdateTestQuestion = z.infer<typeof updateTestQuestionSchema>;
export type BulkTestQuestions = z.infer<typeof bulkTestQuestionsSchema>;

export type DeckTest = z.infer<typeof deckTestSchema>;
export type CreateDeckTest = z.infer<typeof createDeckTestSchema>;
export type UpdateDeckTest = z.infer<typeof updateDeckTestSchema>;

export type StartTestAttempt = z.infer<typeof startTestAttemptSchema>;
export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
export type SubmitTest = z.infer<typeof submitTestSchema>;
export type AbandonTest = z.infer<typeof abandonTestSchema>;

export type GetTestHistory = z.infer<typeof getTestHistorySchema>;
export type GetTestResults = z.infer<typeof getTestResultsSchema>;
export type GetTestAnalytics = z.infer<typeof getTestAnalyticsSchema>;
