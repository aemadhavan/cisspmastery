import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { deckTests, decks, testQuestionPool, testQuestions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createDeckTestSchema } from '@/lib/validations/test';
import { CacheInvalidation, safeInvalidate } from '@/lib/redis/invalidation';

/**
 * GET /api/admin/deck-tests
 * Get all deck tests (admin only)
 * Query params: deckId, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const deckId = searchParams.get('deckId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query;

    if (deckId) {
      // Get tests for specific deck
      query = db.query.deckTests.findMany({
        where: eq(deckTests.deckId, deckId),
        orderBy: [desc(deckTests.createdAt)],
        limit,
        offset,
        with: {
          deck: {
            with: {
              class: true,
            },
          },
          questionPool: {
            with: {
              testQuestion: true,
            },
          },
        },
      });
    } else {
      // Get all tests
      query = db.query.deckTests.findMany({
        orderBy: [desc(deckTests.createdAt)],
        limit,
        offset,
        with: {
          deck: {
            with: {
              class: true,
            },
          },
        },
      });
    }

    const tests = await query;

    return NextResponse.json({
      tests,
      total: tests.length,
    });

  } catch (error) {
    console.error('Error fetching deck tests:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deck tests';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/deck-tests
 * Create new deck test (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const validation = createDeckTestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify deck exists
    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, data.deckId),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get all test questions for this deck's flashcards
    const deckFlashcards = await db.query.flashcards.findMany({
      where: eq(testQuestions.flashcardId, data.deckId), // This should query through flashcards
      with: {
        testQuestions: {
          where: eq(testQuestions.isActive, true),
        },
      },
    });

    const availableQuestions = deckFlashcards.flatMap(fc => fc.testQuestions || []);

    if (availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No test questions found for this deck. Please create test questions first.' },
        { status: 400 }
      );
    }

    // Validate question count
    if (data.questionCount && data.questionCount > availableQuestions.length) {
      return NextResponse.json(
        { error: `Requested ${data.questionCount} questions but only ${availableQuestions.length} available` },
        { status: 400 }
      );
    }

    // Create deck test
    const [test] = await db
      .insert(deckTests)
      .values({
        deckId: data.deckId,
        name: data.name,
        description: data.description || null,
        testType: data.testType,
        questionCount: data.questionCount || null,
        timeLimit: data.timeLimit || null,
        passingScore: data.passingScore,
        shuffleQuestions: data.shuffleQuestions,
        shuffleChoices: data.shuffleChoices,
        showCorrectAnswers: data.showCorrectAnswers,
        allowRetakes: data.allowRetakes,
        maxAttempts: data.maxAttempts || null,
        isPremium: data.isPremium,
        isPublished: data.isPublished,
        createdBy: admin.clerkUserId,
      })
      .returning();

    // Add all available questions to the test pool
    if (availableQuestions.length > 0) {
      await db.insert(testQuestionPool).values(
        availableQuestions.map((q, index) => ({
          deckTestId: test.id,
          testQuestionId: q.id,
          order: index,
        }))
      );
    }

    // Fetch complete test with question pool
    const completeTest = await db.query.deckTests.findFirst({
      where: eq(deckTests.id, test.id),
      with: {
        deck: {
          with: {
            class: true,
          },
        },
        questionPool: {
          with: {
            testQuestion: true,
          },
        },
      },
    });

    // Invalidate cache
    await safeInvalidate(() =>
      CacheInvalidation.deck(data.deckId, deck.classId)
    );

    return NextResponse.json({
      success: true,
      test: completeTest,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating deck test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create deck test';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
