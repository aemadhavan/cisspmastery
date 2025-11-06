import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { testAttempts } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getTestHistorySchema } from '@/lib/validations/test';

/**
 * GET /api/tests/history
 * Get user's test attempt history
 * Query params: limit, offset, deckTestId, status
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
      deckTestId: searchParams.get('deckTestId') || undefined,
      status: searchParams.get('status') as any || undefined,
    };

    const validation = getTestHistorySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { limit, offset, deckTestId, status } = validation.data;

    // Build where conditions
    const conditions = [eq(testAttempts.clerkUserId, userId)];

    if (deckTestId) {
      conditions.push(eq(testAttempts.deckTestId, deckTestId));
    }

    if (status) {
      conditions.push(eq(testAttempts.status, status));
    }

    // Fetch attempts
    const attempts = await db.query.testAttempts.findMany({
      where: and(...conditions),
      orderBy: [desc(testAttempts.startedAt)],
      limit,
      offset,
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
      },
    });

    // Format response
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      testType: attempt.testType,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      totalQuestions: attempt.totalQuestions,
      questionsAnswered: attempt.questionsAnswered,
      correctAnswers: attempt.correctAnswers,
      score: parseFloat(attempt.score || '0'),
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      test: attempt.deckTest ? {
        id: attempt.deckTest.id,
        name: attempt.deckTest.name,
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
          question: attempt.flashcard.question.substring(0, 100) + '...',
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
    }));

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<string>`count(*)` })
      .from(testAttempts)
      .where(and(...conditions));

    return NextResponse.json({
      attempts: formattedAttempts,
      pagination: {
        limit,
        offset,
        total: parseInt(totalCount[0]?.count as string || '0'),
      },
    });

  } catch (error) {
    console.error('Error fetching test history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test history';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
