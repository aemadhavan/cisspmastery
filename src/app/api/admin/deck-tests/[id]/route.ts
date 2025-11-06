import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { deckTests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateDeckTestSchema } from '@/lib/validations/test';
import { CacheInvalidation, safeInvalidate } from '@/lib/redis/invalidation';

/**
 * GET /api/admin/deck-tests/[id]
 * Get a single deck test by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const test = await db.query.deckTests.findFirst({
      where: eq(deckTests.id, params.id),
      with: {
        deck: {
          with: {
            class: true,
          },
        },
        questionPool: {
          with: {
            testQuestion: {
              with: {
                flashcard: true,
              },
            },
          },
        },
        attempts: {
          orderBy: (attempts, { desc }) => [desc(attempts.startedAt)],
          limit: 10,
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Deck test not found' }, { status: 404 });
    }

    return NextResponse.json({ test });

  } catch (error) {
    console.error('Error fetching deck test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deck test';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/deck-tests/[id]
 * Update a deck test
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = updateDeckTestSchema.safeParse({ ...body, id: params.id });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if test exists
    const existingTest = await db.query.deckTests.findFirst({
      where: eq(deckTests.id, params.id),
      with: {
        deck: true,
      },
    });

    if (!existingTest) {
      return NextResponse.json({ error: 'Deck test not found' }, { status: 404 });
    }

    const { id, ...updateData } = validation.data;

    // Update test
    const [updatedTest] = await db
      .update(deckTests)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(deckTests.id, params.id))
      .returning();

    // Invalidate cache
    await safeInvalidate(() =>
      CacheInvalidation.deck(existingTest.deckId, existingTest.deck.classId)
    );

    return NextResponse.json({
      success: true,
      test: updatedTest,
    });

  } catch (error) {
    console.error('Error updating deck test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update deck test';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/deck-tests/[id]
 * Delete a deck test
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if test exists
    const test = await db.query.deckTests.findFirst({
      where: eq(deckTests.id, params.id),
      with: {
        deck: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Deck test not found' }, { status: 404 });
    }

    // Delete test (question pool and attempts will cascade)
    await db.delete(deckTests).where(eq(deckTests.id, params.id));

    // Invalidate cache
    await safeInvalidate(() =>
      CacheInvalidation.deck(test.deckId, test.deck.classId)
    );

    return NextResponse.json({
      success: true,
      message: 'Deck test deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting deck test:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete deck test';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
