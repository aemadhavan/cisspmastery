import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { testAttempts, testAnswers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/tests/results/[attemptId]
 * Get detailed results for a test attempt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get attempt with all details
    const attempt = await db.query.testAttempts.findFirst({
      where: and(
        eq(testAttempts.id, params.attemptId),
        eq(testAttempts.clerkUserId, userId)
      ),
      with: {
        deckTest: {
          with: {
            deck: {
              with: {
                class: true,
              },
            },
          },
        },
        flashcard: {
          with: {
            deck: {
              with: {
                class: true,
              },
            },
          },
        },
        answers: {
          with: {
            testQuestion: {
              with: {
                flashcard: true,
              },
            },
          },
          orderBy: (answers, { asc }) => [asc(answers.answeredAt)],
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Test attempt not found' }, { status: 404 });
    }

    // Only show detailed results if test is completed and showCorrectAnswers is enabled
    const showAnswers = attempt.status === 'completed' &&
      (attempt.deckTest?.showCorrectAnswers !== false);

    // Format results
    const results = {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        totalQuestions: attempt.totalQuestions,
        questionsAnswered: attempt.questionsAnswered,
        correctAnswers: attempt.correctAnswers,
        score: parseFloat(attempt.score || '0'),
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
      },
      test: attempt.deckTest ? {
        id: attempt.deckTest.id,
        name: attempt.deckTest.name,
        description: attempt.deckTest.description,
        passingScore: attempt.deckTest.passingScore,
        deck: {
          id: attempt.deckTest.deck.id,
          name: attempt.deckTest.deck.name,
          class: {
            id: attempt.deckTest.deck.class.id,
            name: attempt.deckTest.deck.class.name,
          },
        },
      } : attempt.flashcard ? {
        flashcard: {
          id: attempt.flashcard.id,
          question: attempt.flashcard.question,
          deck: {
            id: attempt.flashcard.deck.id,
            name: attempt.flashcard.deck.name,
            class: {
              id: attempt.flashcard.deck.class.id,
              name: attempt.flashcard.deck.class.name,
            },
          },
        },
      } : null,
      questions: showAnswers ? attempt.answers.map(answer => ({
        questionId: answer.testQuestionId,
        question: answer.testQuestion.question,
        choices: answer.testQuestion.choices,
        correctAnswers: answer.testQuestion.correctAnswers,
        selectedAnswers: answer.selectedAnswers,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        timeSpent: answer.timeSpent,
        markedForReview: answer.markedForReview,
        explanation: answer.testQuestion.explanation,
      })) : null,
      performance: {
        accuracy: attempt.totalQuestions > 0
          ? ((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(2)
          : '0',
        averageTimePerQuestion: attempt.questionsAnswered > 0 && attempt.timeSpent
          ? (attempt.timeSpent / attempt.questionsAnswered).toFixed(1)
          : null,
      },
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching test results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test results';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
