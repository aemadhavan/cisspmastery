import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { testAttempts, testAnswers, testQuestions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { submitAnswerSchema } from '@/lib/validations/test';

/**
 * POST /api/tests/answer
 * Submit an answer for a test question
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = submitAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { attemptId, testQuestionId, selectedAnswers, timeSpent, markedForReview } = validation.data;

    // Verify attempt belongs to user and is in progress
    const attempt = await db.query.testAttempts.findFirst({
      where: and(
        eq(testAttempts.id, attemptId),
        eq(testAttempts.clerkUserId, userId)
      ),
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Cannot submit answer. Test status is: ${attempt.status}` },
        { status: 400 }
      );
    }

    // Get the test question
    const question = await db.query.testQuestions.findFirst({
      where: eq(testQuestions.id, testQuestionId),
    });

    if (!question) {
      return NextResponse.json({ error: 'Test question not found' }, { status: 404 });
    }

    // Check if answer already exists (prevent duplicate submissions)
    const existingAnswer = await db.query.testAnswers.findFirst({
      where: and(
        eq(testAnswers.attemptId, attemptId),
        eq(testAnswers.testQuestionId, testQuestionId)
      ),
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Answer already submitted for this question' },
        { status: 400 }
      );
    }

    // Validate selected answers are within bounds
    const maxIndex = question.choices.length - 1;
    const invalidAnswers = selectedAnswers.filter(idx => idx > maxIndex || idx < 0);

    if (invalidAnswers.length > 0) {
      return NextResponse.json(
        { error: `Invalid answer indices. Must be between 0 and ${maxIndex}` },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const correctAnswersSet = new Set(question.correctAnswers);
    const selectedAnswersSet = new Set(selectedAnswers);

    const isCorrect =
      correctAnswersSet.size === selectedAnswersSet.size &&
      [...correctAnswersSet].every(ans => selectedAnswersSet.has(ans));

    const pointsEarned = isCorrect ? question.pointValue : 0;

    // Insert answer
    const [answer] = await db
      .insert(testAnswers)
      .values({
        attemptId,
        testQuestionId,
        selectedAnswers,
        isCorrect,
        pointsEarned,
        timeSpent: timeSpent || null,
        markedForReview,
      })
      .returning();

    // Update attempt progress
    const updatedQuestionsAnswered = attempt.questionsAnswered + 1;
    const updatedCorrectAnswers = attempt.correctAnswers + (isCorrect ? 1 : 0);

    await db
      .update(testAttempts)
      .set({
        questionsAnswered: updatedQuestionsAnswered,
        correctAnswers: updatedCorrectAnswers,
        updatedAt: new Date(),
      })
      .where(eq(testAttempts.id, attemptId));

    return NextResponse.json({
      success: true,
      answer: {
        id: answer.id,
        isCorrect,
        pointsEarned,
      },
      progress: {
        questionsAnswered: updatedQuestionsAnswered,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: updatedCorrectAnswers,
      },
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
