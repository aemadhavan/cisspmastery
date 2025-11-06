import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { testAttempts, deckTests, testQuestions, flashcards, testQuestionPool } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { startTestAttemptSchema } from '@/lib/validations/test';

/**
 * POST /api/tests/start
 * Start a new test attempt
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = startTestAttemptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { deckTestId, flashcardId, testType } = validation.data;

    let questions: typeof testQuestions.$inferSelect[] = [];
    let testConfig: typeof deckTests.$inferSelect | null = null;

    if (deckTestId) {
      // Deck test
      testConfig = await db.query.deckTests.findFirst({
        where: and(
          eq(deckTests.id, deckTestId),
          eq(deckTests.isPublished, true)
        ),
        with: {
          questionPool: {
            with: {
              testQuestion: {
                where: eq(testQuestions.isActive, true),
              },
            },
            orderBy: (pool, { asc }) => [asc(pool.order)],
          },
        },
      });

      if (!testConfig) {
        return NextResponse.json({ error: 'Test not found or not published' }, { status: 404 });
      }

      // Check if user has exceeded max attempts
      if (testConfig.maxAttempts) {
        const previousAttempts = await db.query.testAttempts.findMany({
          where: and(
            eq(testAttempts.clerkUserId, userId),
            eq(testAttempts.deckTestId, deckTestId),
            eq(testAttempts.status, 'completed')
          ),
        });

        if (previousAttempts.length >= testConfig.maxAttempts) {
          return NextResponse.json(
            { error: `Maximum attempts (${testConfig.maxAttempts}) reached for this test` },
            { status: 403 }
          );
        }
      }

      // Get questions from pool
      questions = testConfig.questionPool
        .map(p => p.testQuestion)
        .filter(Boolean);

      // Apply question count limit if specified
      if (testConfig.questionCount && testConfig.questionCount < questions.length) {
        // Shuffle and take subset
        questions = shuffleArray(questions).slice(0, testConfig.questionCount);
      }

      // Shuffle questions if configured
      if (testConfig.shuffleQuestions) {
        questions = shuffleArray(questions);
      }

    } else if (flashcardId) {
      // Single flashcard test
      const flashcard = await db.query.flashcards.findFirst({
        where: eq(flashcards.id, flashcardId),
        with: {
          testQuestions: {
            where: eq(testQuestions.isActive, true),
          },
        },
      });

      if (!flashcard || !flashcard.testQuestions || flashcard.testQuestions.length === 0) {
        return NextResponse.json(
          { error: 'No test questions found for this flashcard' },
          { status: 404 }
        );
      }

      questions = flashcard.testQuestions;
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this test' },
        { status: 400 }
      );
    }

    // Create test attempt
    const [attempt] = await db
      .insert(testAttempts)
      .values({
        clerkUserId: userId,
        deckTestId: deckTestId || null,
        flashcardId: flashcardId || null,
        testType,
        status: 'in_progress',
        totalQuestions: questions.length,
        questionsAnswered: 0,
        correctAnswers: 0,
      })
      .returning();

    // Prepare questions for response (hide correct answers, optionally shuffle choices)
    const sanitizedQuestions = questions.map(q => {
      let choices = q.choices;

      // Shuffle choices if configured
      if (testConfig?.shuffleChoices) {
        // Create array of choice indices and shuffle
        const indices = Array.from({ length: choices.length }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);

        // Reorder choices
        choices = shuffledIndices.map(i => q.choices[i]);

        // Note: We don't expose the mapping to maintain test integrity
      }

      return {
        id: q.id,
        question: q.question,
        choices,
        pointValue: q.pointValue,
        timeLimit: q.timeLimit,
        difficulty: q.difficulty,
        explanation: null, // Hide until after submission
      };
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        totalQuestions: attempt.totalQuestions,
        timeLimit: testConfig?.timeLimit,
        passingScore: testConfig?.passingScore,
      },
      questions: sanitizedQuestions,
    }, { status: 201 });

  } catch (error) {
    console.error('Error starting test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to start test';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
